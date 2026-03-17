import React from 'react';

/**
 * SummaryCards
 * Muestra las tarjetas de resumen en el DashboardHome.
 *
 * Props:
 *   stats.activePatients    — número de pacientes activos
 *   stats.appointmentsToday — número de citas para hoy
 */
export default function SummaryCards({ stats }) {
  const cardStyle = {
    backgroundColor: 'white', padding: '25px', borderRadius: '12px',
    flex: 1, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eee',
  };

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '15px' }}>Pacientes Activos</h4>
        <h1 style={{ margin: 0, color: '#0056b3', fontSize: '2.8rem' }}>{stats.activePatients}</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#28a745' }}>↑ 12% desde el mes pasado</p>
      </div>

      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '15px' }}>Alertas Críticas</h4>
        <h1 style={{ margin: 0, color: '#ff003c', fontSize: '2.8rem' }}>0</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#ff003c' }}>↑ nuevas hoy</p>
      </div>

      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '15px' }}>Citas Hoy</h4>
        <h1 style={{ margin: 0, color: '#0056b3', fontSize: '2.8rem' }}>{stats.appointmentsToday}</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#888' }}>0 completadas</p>
      </div>
    </div>
  );
}
