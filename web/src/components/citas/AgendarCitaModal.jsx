import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AgendarCitaModal({ doctorInfo, onClose, onCitaAgendada }) {
  const [pacientes, setPacientes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    patient_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    motivo: '',
    descripcion: '',
  });

  // Cargar pacientes vinculados al doctor
  useEffect(() => {
    const fetchPacientes = async () => {
      const { data, error } = await supabase
        .from('relationships')
        .select('patient_id, profiles!relationships_patient_id_fkey(id, first_name, last_name)')
        .eq('agent_id', doctorInfo.id)
        .eq('status', 'active');

      if (!error && data) {
        setPacientes(data.map(r => r.profiles));
      }
    };
    fetchPacientes();
  }, [doctorInfo.id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const scheduled_at = new Date(`${form.fecha}T${form.hora_inicio}:00`).toISOString();
    const end_time = form.hora_fin
      ? new Date(`${form.fecha}T${form.hora_fin}:00`).toISOString()
      : null;

    const { data, error } = await supabase
      .from('clinical_records')
      .insert([{
        patient_id: form.patient_id,
        doctor_id: doctorInfo.id,
        type: 'cita',
        title: form.motivo,
        description: form.descripcion,
        scheduled_at,
        end_time,
        status: 'pendiente',
      }])
      .select(`
        *,
        profiles!clinical_records_patient_id_fkey(first_name, last_name)
      `);

    if (error) {
      alert('Error al agendar la cita: ' + error.message);
    } else if (data) {
      onCitaAgendada(data[0]);
      onClose();
    }
    setGuardando(false);
  };

  // ── Estilos ──────────────────────────────────────────────────────
  const overlay = {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  };
  const modal = {
    backgroundColor: 'white', borderRadius: '12px', padding: '32px',
    width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    display: 'flex', flexDirection: 'column', gap: '16px',
  };
  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '6px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s',
  };
  const labelStyle = {
    display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#444',
  };
  const rowStyle = { display: 'flex', gap: '12px' };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1a1a2e', fontWeight: '700' }}>
            📅 Agendar nueva cita
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888', lineHeight: 1 }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Paciente */}
          <div>
            <label style={labelStyle}>Paciente *</label>
            <select name="patient_id" required value={form.patient_id} onChange={handleChange} style={inputStyle}>
              <option value="">Selecciona un paciente...</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label style={labelStyle}>Fecha *</label>
            <input type="date" name="fecha" required value={form.fecha} onChange={handleChange} style={inputStyle} />
          </div>

          {/* Hora inicio / fin */}
          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Hora inicio *</label>
              <input type="time" name="hora_inicio" required value={form.hora_inicio} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Hora fin</label>
              <input type="time" name="hora_fin" value={form.hora_fin} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label style={labelStyle}>Motivo de la cita *</label>
            <input
              type="text" name="motivo" required
              placeholder="Ej. Control mensual de glucosa"
              value={form.motivo} onChange={handleChange} style={inputStyle}
            />
          </div>

          {/* Observaciones */}
          <div>
            <label style={labelStyle}>Observaciones previas</label>
            <textarea
              name="descripcion" rows="3"
              placeholder="Síntomas, indicaciones previas..."
              value={form.descripcion} onChange={handleChange}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="button" onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd',
                background: 'white', color: '#555', fontSize: '14px', cursor: 'pointer', fontWeight: '600',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={guardando}
              style={{
                padding: '10px 24px', borderRadius: '8px', border: 'none',
                background: guardando ? '#9ab8d7' : '#0056b3',
                color: 'white', fontSize: '14px',
                cursor: guardando ? 'not-allowed' : 'pointer',
                fontWeight: '700', transition: 'background 0.2s',
              }}
            >
              {guardando ? 'Agendando...' : 'Agendar cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
