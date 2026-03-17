import React from 'react';

/**
 * UpcomingAppointments
 * Lista de citas del día para el DashboardHome.
 *
 * Props:
 *   appointments — array de registros de clinical_records con tipo 'cita'
 */
export default function UpcomingAppointments({ appointments }) {
  return (
    <div style={{
      backgroundColor: 'white', padding: '25px', borderRadius: '12px',
      flex: 1, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eee',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h3 style={{ margin: 0, color: '#333' }}>Citas Próximas</h3>
        <span style={{ color: '#0056b3', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
          Ver todas
        </span>
      </div>

      {appointments.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
          No hay citas programadas para hoy.
        </p>
      ) : (
        appointments.map(cita => (
          <div
            key={cita.id}
            style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '15px 0', borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div>
              <strong style={{ display: 'block', color: '#333', fontSize: '15px' }}>
                {cita.patient?.first_name} {cita.patient?.last_name || ''}
              </strong>
              <span style={{ fontSize: '13px', color: '#777' }}>{cita.title}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: '#0056b3' }}>
                {new Date(cita.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>Hoy</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
