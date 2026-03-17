import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute
 * Bloquea el acceso a rutas privadas según el rol del usuario.
 *
 * Props:
 *   user        — objeto de sesión de Supabase Auth
 *   role        — rol del usuario (ej. 'doctor', 'patient', 'admin')
 *   allowedRoles — array de roles permitidos (ej. ['doctor', 'admin'])
 *   children    — componente hijo a renderizar si tiene acceso
 */
export default function ProtectedRoute({ user, role, allowedRoles, children }) {
  // Sin sesión → redirigir al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Rol no permitido → pantalla de acceso denegado
  if (!allowedRoles.includes(role)) {
    return (
      <div style={{
        padding: '50px', color: 'white',
        backgroundColor: '#050a0e', height: '100vh', textAlign: 'center',
      }}>
        <h1 style={{ color: '#ff003c' }}>ERROR 403 // ACCESO DENEGADO</h1>
        <p>Tu nivel de acceso ('{role}') no tiene los permisos necesarios.</p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: '20px', padding: '10px',
            backgroundColor: '#ff003c', color: 'white',
            border: 'none', cursor: 'pointer',
          }}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  // Acceso concedido
  return children;
}
