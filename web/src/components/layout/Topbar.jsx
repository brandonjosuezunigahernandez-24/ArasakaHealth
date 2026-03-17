import React from 'react';

export default function Topbar({ doctorInfo }) {
  return (
    <div style={{
      height: '60px', borderBottom: '1px solid #ddd',
      display: 'flex', justifyContent: 'space-between',
      padding: '0 20px', alignItems: 'center',
    }}>
      {/* Buscador global (funcionalidad futura) */}
      <input
        type="text"
        placeholder="Buscar pacientes, citas..."
        style={{ width: '300px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
      />

      {/* Información del médico */}
      <div>
        <span style={{ fontWeight: 'bold' }}>
          Dra. {doctorInfo?.first_name || 'Médico'} {doctorInfo?.last_name || ''}
        </span>
        <span style={{ fontSize: '12px', color: 'gray', marginLeft: '10px' }}>Endocrinóloga</span>
      </div>
    </div>
  );
}
