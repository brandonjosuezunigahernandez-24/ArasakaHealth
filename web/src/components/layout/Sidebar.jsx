import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { nombre: 'Inicio',        icono: '🏠', ruta: '/dashboard' },
    { nombre: 'Pacientes',     icono: '👥', ruta: '/dashboard/pacientes' },
    { nombre: 'Citas',         icono: '📅', ruta: '/dashboard/citas' },
    { nombre: 'Mensajes',      icono: '💬', ruta: '/dashboard/mensajes' },
    { nombre: 'Historial',     icono: '📋', ruta: '/dashboard/historial' },
    { nombre: 'Reportes',      icono: '📊', ruta: '/dashboard/reportes' },
    { nombre: 'Recetas',       icono: '💊', ruta: '/dashboard/recetas' },
    { nombre: 'Alertas',       icono: '🔔', ruta: '/dashboard/alertas' },
    { nombre: 'Configuración', icono: '⚙️',  ruta: '/dashboard/configuracion' },
  ];

  return (
    <div style={{
      width: '250px', borderRight: '1px solid #e0e0e0', padding: '20px',
      display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        <div style={{ width: '30px', height: '30px', backgroundColor: '#050a0e', borderRadius: '50%' }} />
        <h2 style={{ color: '#050a0e', margin: 0, fontSize: '20px' }}>ArasakaHealth</h2>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map(item => {
          const isActive =
            location.pathname === item.ruta ||
            (item.ruta !== '/dashboard' && location.pathname.startsWith(item.ruta));
          return (
            <button
              key={item.nombre}
              onClick={() => navigate(item.ruta)}
              style={{
                padding: '12px 15px', textAlign: 'left', border: 'none',
                borderRadius: '8px', cursor: 'pointer',
                backgroundColor: isActive ? '#f0f5fa' : 'transparent',
                color: isActive ? '#0056b3' : '#555',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'background-color 0.2s',
              }}
            >
              {item.icono && <span style={{ marginRight: '8px' }}>{item.icono}</span>}
              {item.nombre}
            </button>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <button
        onClick={onLogout}
        style={{
          marginTop: 'auto', padding: '12px', display: 'flex', alignItems: 'center',
          gap: '10px', backgroundColor: 'transparent', color: '#555',
          border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
        }}
      >
        🚪 Cerrar Sesión
      </button>
    </div>
  );
}
