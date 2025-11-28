"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "1A", asistencia: 92 },
  { name: "1B", asistencia: 88 },
  { name: "1C", asistencia: 79 },
  { name: "2A", asistencia: 94 },
  { name: "2B", asistencia: 83 },
  { name: "2C", asistencia: 81 },
  { name: "3A", asistencia: 91 },
  { name: "3B", asistencia: 76 },
  { name: "3C", asistencia: 85 },
  { name: "4A", asistencia: 89 },
  { name: "4B", asistencia: 74 },
];

export default function Home() {
  return (
    <div className="p-6 bg-white min-h-screen">

      {/* Título */}
      <h1 className="text-2xl font-bold text-purple-700 mb-6">
        Panel de Asistencia
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 📊 Panel de la gráfica */}
        <div className="col-span-2 bg-white border border-purple-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition">

          <h2 className="text-xl font-semibold text-purple-700 mb-4">
            Asistencia promedio por grupo
          </h2>

          {/* Contenedor con scroll para muchos grupos */}
          <div className="h-72 overflow-x-auto">
            <div className="min-w-[800px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="asistencia"
                    radius={[10, 10, 0, 0]}
                    fill="#7C3AED" // morado
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 📌 Panel derecho (tarjetas) */}
        <div className="flex flex-col gap-4">

          {/* Tarjeta 1 */}
          <div className="bg-white border border-purple-200 rounded-2xl shadow-md p-4">
            <p className="text-sm text-gray-500">Promedio general</p>
            <p className="text-4xl font-bold text-purple-700">89%</p>
            <p className="text-xs text-blue-500 mt-1">+2% este mes</p>
          </div>

          {/* Tarjeta 2 */}
          <div className="bg-white border border-red-200 rounded-2xl shadow-md p-4">
            <p className="text-sm text-gray-500">Alertas</p>
            <p className="text-lg font-semibold text-red-500">
              3 grupos con asistencia baja
            </p>
          </div>

          {/* Tarjeta 3 */}
          <div className="bg-white border border-blue-200 rounded-2xl shadow-md p-4">
            <p className="text-sm text-gray-500">Mejor grupo</p>
            <p className="text-lg font-semibold text-blue-600">
              2A – 94%
            </p>
          </div>

          {/* Tarjeta 4 - opcional */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4">
            <p className="text-sm text-gray-500 mb-1">Últimos registros</p>

            <ul className="text-xs text-gray-600 space-y-1">
              <li>08:02 AM – 1B marcó asistencia</li>
              <li>08:05 AM – 1A marcó asistencia</li>
              <li>08:11 AM – 2C marcó asistencia</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
