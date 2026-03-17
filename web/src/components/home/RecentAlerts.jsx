import React from 'react';

/**
 * RecentAlerts
 * Panel de alertas recientes en el DashboardHome.
 * Muestra un placeholder hasta que la integración Dexcom esté activa.
 */
export default function RecentAlerts() {
  return (
    <div style={{
      backgroundColor: 'white', padding: '25px', borderRadius: '12px',
      flex: 1, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eee',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h3 style={{ margin: 0, color: '#333' }}>Alertas Recientes</h3>
        <span style={{ color: '#0056b3', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
          Ver todas
        </span>
      </div>

      {/* Placeholder — se reemplazará con datos reales de Dexcom */}
      <div style={{ borderLeft: '4px solid #ff003c', paddingLeft: '15px', marginBottom: '20px' }}>
        <strong style={{ display: 'block', color: '#333', fontSize: '15px' }}>
          Resultados críticos: Esperando IoT
        </strong>
        <p style={{ margin: '5px 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
          Aquí se inyectarán los datos del Sandbox de Dexcom cuando un paciente tenga la glucosa fuera de rango.
        </p>
        <span style={{ fontSize: '12px', color: '#aaa' }}>Hace 0 minutos</span>
      </div>
    </div>
  );
}
