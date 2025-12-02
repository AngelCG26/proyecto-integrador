const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// ========== CONFIG EMAIL ==========
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "infasistia@gmail.com",
    pass: "mzvy amfh nbwc senn",
  },
});

// ========== CONFIG SQL SERVER ==========
const dbConfig = {
  user: "sa",
  password: "TestSqlServer",
  server: "ANGELCG260",
  database: "EscuelaXBD",
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool;
async function connectDB() {
  try {
    pool = await sql.connect(dbConfig);
    console.log("SQL Server conectado.");
  } catch (err) {
    console.error("Error al conectar a SQL:", err);
  }
}
connectDB();

// ========================
//  🔵 ENDPOINT: LLEGADA RFID
// ========================
app.post("/llegada", async (req, res) => {
  console.log("📩 /llegada llamado");
  console.log("Cuerpo recibido:", req.body);

  if (!pool) return res.status(500).json({ error: "DB no conectada." });

  const { tarjetaUID, alumnoId } = req.body;

  if (!tarjetaUID && !alumnoId) {
    return res.status(400).json({ error: "Falta tarjetaUID o alumnoId." });
  }

  try {
    let alumno;

    // Buscar alumno por UID
    if (tarjetaUID) {
      const alumnoQuery = await pool
        .request()
        .input("uid", sql.VarChar, tarjetaUID)
        .query("SELECT id, name, papaEmail FROM Alumnos WHERE tarjetaUID = @uid");

      if (alumnoQuery.recordset.length === 0) {
        return res.status(404).json({ error: "Tarjeta no registrada." });
      }

      alumno = alumnoQuery.recordset[0];
    }

    // Buscar alumno por ID
    if (!alumno && alumnoId) {
      const alumnoQuery = await pool
        .request()
        .input("id", sql.Int, alumnoId)
        .query("SELECT id, name, papaEmail FROM Alumnos WHERE id = @id");

      if (alumnoQuery.recordset.length === 0) {
        return res.status(404).json({ error: "Alumno no encontrado." });
      }

      alumno = alumnoQuery.recordset[0];
    }

    // Hora actual
    const ahora = new Date();
    const hora = ahora.toTimeString().split(" ")[0]; // HH:MM:SS

    // Determinar status
    const HORA_LIMITE = "08:00:00";
    const status = hora <= HORA_LIMITE ? "PRESENT" : "LATE";

    // Actualizar el registro EXISTENTE del alumno (sin crear nuevos)
    const updateQuery = `
      UPDATE Llegadas
      SET status = @status, HoraLlegada = @hora
      WHERE alumnoId = @alumnoId
    `;

    const result = await pool
      .request()
      .input("alumnoId", sql.Int, alumno.id)
      .input("status", sql.VarChar, status)
      .input("hora", sql.VarChar, hora)
      .query(updateQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "No existe registro para este alumno." });
    }

    // Preparar mensaje de correo según status
    const horaLlegada = new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const statusUpper = String(status).trim().toUpperCase();
    let mensajeTexto = "";

    switch (statusUpper) {
      case "PRESENT":
        mensajeTexto = `Hola, su hijo ${alumno.name} llegó a la escuela a las ${horaLlegada}.`;
        break;
      case "LATE":
        mensajeTexto = `Hola, su hijo ${alumno.name} llegó tarde a la escuela a las ${horaLlegada}.`;
        break;
      case "ABSENT":
        mensajeTexto = `Hola, su hijo ${alumno.name} faltó a clases el día de hoy.`;
        break;
      default:
        mensajeTexto = `Hola, hay una actualización sobre la asistencia de su hijo ${alumno.name}.`;
    }

    console.log("Mensaje que se enviará:", mensajeTexto);

    await transporter.sendMail({
      from: '"InfaSistia" <infasistia@gmail.com>',
      to: alumno.papaEmail,
      subject: `Notificación: estado de asistencia de ${alumno.name}`,
      text: mensajeTexto,
    });

    res.json({
      mensaje: "Registro actualizado y correo enviado",
      alumno: alumno.name,
      status,
      hora,
      mensajeTexto,
    });
  } catch (err) {
    console.error("❌ ERROR EN /llegada:", err);
    res.status(500).json({ error: "Error al procesar llegada o enviar correo." });
  }
});


// ========================
//  🔵 ENDPOINT: SALIDA
// ========================
// Registrar salida
app.post('/salida', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DB no conectada' });

  let { alumnoId } = req.body;
  if (!alumnoId) return res.status(400).json({ error: 'Debe enviar alumnoId' });

  try {
    // Obtener datos del alumno
    const result = await pool.request()
      .input('alumnoId', sql.Int, alumnoId)
      .query('SELECT id, name, papaEmail FROM Alumnos WHERE id=@alumnoId');

    if (!result.recordset.length) return res.status(404).json({ error: 'Alumno no encontrado' });

    const alumno = result.recordset[0];
    const horaSalida = new Date();

    // Preparar mensaje
    const mensajeTexto = `Hola, su hijo ${alumno.name} salió de la escuela a las ${horaSalida.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' })}.`;

    // Enviar correo
    await transporter.sendMail({
      from: '"InfaSistia" <infasistia@gmail.com>',
      to: alumno.papaEmail,
      subject: `Notificación: salida de ${alumno.name}`,
      text: mensajeTexto,
    });

    res.json({ mensaje: 'Correo de salida enviado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar correo de salida' });
  }
});

// ========================
//  🔵 DASHBOARD
// ========================
app.get("/dashboard", async (req, res) => {
  if (!pool) return res.status(500).json({ error: "DB no conectada" });

  try {
    const totalAlumnosResult = await pool.request().query(`
      SELECT COUNT(*) AS total FROM Alumnos
    `);

    const llegadasHoyResult = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM Llegadas
      WHERE CAST(HoraLlegada AS DATE) = CAST(GETDATE() AS DATE)
    `);

    res.json({
      totalAlumnos: totalAlumnosResult.recordset[0].total,
      asistenciasHoy: llegadasHoyResult.recordset[0].total,
      faltasHoy:
        totalAlumnosResult.recordset[0].total -
        llegadasHoyResult.recordset[0].total,
    });
  } catch (error) {
    console.error("Error en /dashboard:", error);
    res.status(500).json({ error: "Error en dashboard" });
  }
});

// ========================
//  🔵 LISTA DEL DÍA
// ========================
// GET: solo devuelve la lista de alumnos con su asistencia de hoy
app.get('/api/attendance/today', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DB no conectada' });

  try {
    const result = await pool.request().query(`
      SELECT a.id, a.name, l.status
      FROM Alumnos a
      LEFT JOIN Llegadas l 
        ON a.id = l.alumnoId AND CAST(l.HoraLlegada AS DATE) = CAST(GETDATE() AS DATE)
      ORDER BY a.name
    `);

    res.json(result.recordset.map(r => ({
      id: r.id,
      name: r.name,
      status: r.status || ""
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener asistencia' });
  }
});

// POST: guardar o actualizar asistencia
app.post('/api/attendance/saveManual', async (req, res) => {
  if (!pool) return res.status(500).json({ error: 'DB no conectada' });

  const students = req.body; // [{ id: 1, status: 'PRESENT' }, ... ]

  try {
    for (const s of students) {
      // Primero intento actualizar
      const updateResult = await pool.request()
        .input('alumnoId', sql.Int, s.id)
        .input('status', sql.NVarChar(10), s.status)
        .query(`
          UPDATE Llegadas
          SET status = @status, HoraLlegada = GETDATE()
          WHERE alumnoId = @alumnoId AND CAST(HoraLlegada AS DATE) = CAST(GETDATE() AS DATE)
        `);

      // Si no existía registro, inserto uno nuevo
      if (updateResult.rowsAffected[0] === 0) {
        await pool.request()
          .input('alumnoId', sql.Int, s.id)
          .input('status', sql.NVarChar(10), s.status)
          .query(`
            INSERT INTO Llegadas (alumnoId, status, HoraLlegada)
            VALUES (@alumnoId, @status, GETDATE())
          `);
      }
    }

    res.json({ mensaje: 'Asistencia guardada correctamente' });
  } catch (error) {
    console.error('Error al guardar asistencia:', error);
    res.status(500).json({ error: 'Error al guardar asistencia' });
  }
});


// ========================
// SERVIDOR
// ========================
app.listen(4000, '0.0.0.0', () => {
  console.log("Servidoor corriendo en http://0.0.0.0:4000");
});
