"use client";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const grupos = ["1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B"];

const alumnosSimulados = [
  "Pedro López",
  "Ana Martínez",
  "José Hernández",
  "María Pérez",
  "Luis González",
  "Paola Torres",
  "Sofía Ramírez",
  "Carlos Ortega",
];

export default function Reportes() {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");

  const generarPDF = () => {
    if (!grupoSeleccionado) {
      alert("Selecciona un grupo primero");
      return;
    }

    const azul = "#1e3a8a";
    const azulClaro = "#dbeafe";

    const doc = new jsPDF({ unit: "pt", format: "letter" });

    // -------------------------------------------------------
    // ENCABEZADO
    // -------------------------------------------------------
    doc.setFontSize(22);
    doc.setTextColor(azul);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Asistencia", 50, 70);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor("#555");
    doc.text("Institucional • Control de asistencia", 50, 90);

    // -------------------------------------------------------
    // LOGO REAL DESDE /public/logo.png
    // -------------------------------------------------------
    try {
      doc.addImage("/Asistialogo.png", "PNG", 455, 40, 75, 75);
    } catch (e) {
      console.log("Error cargando logo:", e);
    }

    // -------------------------------------------------------
    // DATOS GENERALES
    // -------------------------------------------------------
    doc.setTextColor("#000");
    doc.setFontSize(12);

    const fecha = new Date().toLocaleDateString();

    // Columna izquierda
    doc.text(`Grupo: ${grupoSeleccionado}`, 50, 140);
    doc.text("Docente: ____________________", 50, 165);
    doc.text("Periodo: _____________________", 50, 190);

    // Columna derecha
    doc.text("Materia: _____________________", 330, 140);
    doc.text(`Fecha: ${fecha}`, 330, 165);

    // -------------------------------------------------------
    // TABLA
    // -------------------------------------------------------
    const tabla = alumnosSimulados.map((nombre) => {
      const asistencias = Math.floor(Math.random() * 10) + 20;
      const faltas = Math.floor(Math.random() * 4);
      const total = asistencias + faltas;
      const porcentaje = Math.round((asistencias / total) * 100);

      return [nombre, asistencias, faltas, porcentaje + "%"];
    });

    autoTable(doc, {
      head: [["Alumno", "A", "F", "% Asistencia"]],
      body: tabla,
      startY: 230,
      theme: "grid",
      headStyles: {
        fillColor: azulClaro,
        textColor: azul,
        fontStyle: "bold",
      },
      styles: {
        textColor: "#000",
        lineColor: "#999",
        fontSize: 11,
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
      },
    });

    // -------------------------------------------------------
    // FIRMAS
    // -------------------------------------------------------
    const pageHeight = doc.internal.pageSize.height;
    const firmaY = pageHeight - 120;

    doc.setDrawColor("#444");

    doc.line(80, firmaY, 260, firmaY);
    doc.setFontSize(12);
    doc.text("Firma del docente", 130, firmaY + 18);

    doc.line(330, firmaY, 510, firmaY);
    doc.text("Firma del alumno", 380, firmaY + 18);

    // -------------------------------------------------------
    // DESCARGAR PDF
    // -------------------------------------------------------
    doc.save(`reporte_${grupoSeleccionado}.pdf`);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">
        Generar Reporte de Asistencia
      </h1>

      <label className="block mb-2 text-gray-600">Selecciona un grupo:</label>
      <select
        className="w-full border border-blue-300 rounded-lg p-3 mb-4"
        value={grupoSeleccionado}
        onChange={(e) => setGrupoSeleccionado(e.target.value)}
      >
        <option value="">-- Seleccionar grupo --</option>
        {grupos.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <button
        onClick={generarPDF}
        className="w-full bg-blue-800 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-900 transition"
      >
        Descargar lista de asistencia
      </button>
    </div>
  );
}
