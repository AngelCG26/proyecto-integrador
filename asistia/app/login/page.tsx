'use client'; // importante para que sea client-side

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // para navegar programáticamente

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setError('');

    try {
      // Aquí iría tu llamada al backend para autenticar
      console.log('Email:', email, 'Password:', password);

      // Simulación de login exitoso
      router.push('/dashboard'); // 🔹 Redirige a la carpeta dashboard
    } catch (err) {
      setError('Error al iniciar sesión');
      console.error(err);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-3xl font-bold text-center text-black">Iniciar Sesión</h1>

        {error && <p className="mb-4 text-red-500">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
            required
          />

          <button
            type="submit"
            className="mt-4 rounded bg-blue-500 py-3 text-white transition-colors hover:bg-blue-700"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          ¿No tienes cuenta?{' '}
          <a href="#" className="text-blue-500 hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </main>
  );
}