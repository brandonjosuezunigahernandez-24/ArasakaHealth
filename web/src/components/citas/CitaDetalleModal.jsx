import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function CitaDetalleModal({ cita, onClose, onActualizada, onEliminada }) {
  const [modo, setModo] = useState('detalle'); // 'detalle' | 'editar'
  const [guardando, setGuardando] = useState(false);
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);

  // Datos de edición pre-rellenados con la cita actual
  const fechaInicio = new Date(cita.resource.scheduled_at);
  const fechaFin = cita.resource.end_time ? new Date(cita.resource.end_time) : null;

  const toDateInput = (d) => d.toISOString().split('T')[0];
  const toTimeInput = (d) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const [form, setForm] = useState({
    fecha: toDateInput(fechaInicio),
    hora_inicio: toTimeInput(fechaInicio),
    hora_fin: fechaFin ? toTimeInput(fechaFin) : '',
    motivo: cita.resource.title || '',
    descripcion: cita.resource.description || '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Marcar como completada ───────────────────────────────────────
  const handleCompletar = async () => {
    setGuardando(true);
    const { error } = await supabase
      .from('clinical_records')
      .update({ status: 'completada' })
      .eq('id', cita.resource.id);

    if (!error) {
      onActualizada({ ...cita.resource, status: 'completada' });
      onClose();
    } else {
      alert('Error al actualizar: ' + error.message);
    }
    setGuardando(false);
  };

  // ── Guardar edición ──────────────────────────────────────────────
  const handleEditar = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const scheduled_at = new Date(`${form.fecha}T${form.hora_inicio}:00`).toISOString();
    const end_time = form.hora_fin
      ? new Date(`${form.fecha}T${form.hora_fin}:00`).toISOString()
      : null;

    const { error } = await supabase
      .from('clinical_records')
      .update({
        title: form.motivo,
        description: form.descripcion,
        scheduled_at,
        end_time,
      })
      .eq('id', cita.resource.id);

    if (!error) {
      onActualizada({
        ...cita.resource,
        title: form.motivo,
        description: form.descripcion,
        scheduled_at,
        end_time,
      });
      onClose();
    } else {
      alert('Error al editar: ' + error.message);
    }
    setGuardando(false);
  };

  // ── Cancelar / eliminar cita ─────────────────────────────────────
  const handleCancelar = async () => {
    setGuardando(true);
    const { error } = await supabase
      .from('clinical_records')
      .delete()
      .eq('id', cita.resource.id);

    if (!error) {
      onEliminada(cita.resource.id);
      onClose();
    } else {
      alert('Error al cancelar: ' + error.message);
    }
    setGuardando(false);
  };

  // ── Helpers de formato ───────────────────────────────────────────
  const formatearFecha = (isoString) =>
    new Date(isoString).toLocaleString('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const badgeStatus = {
    pendiente: { color: '#1a6fc4', bg: '#e8f0fb', label: 'Pendiente' },
    completada: { color: '#2e7d32', bg: '#e8f5e9', label: 'Completada' },
    cancelada:  { color: '#c62828', bg: '#ffebee', label: 'Cancelada'  },
  }[cita.resource.status || 'pendiente'] || { color: '#888', bg: '#f5f5f5', label: 'Sin estado' };

  // ── Estilos ──────────────────────────────────────────────────────
  const overlay = {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
  };
  const modal = {
    backgroundColor: 'white', borderRadius: '14px', padding: '28px',
    width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    display: 'flex', flexDirection: 'column', gap: '18px',
  };
  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '6px',
    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle = {
    display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#444',
  };
  const rowStyle = { display: 'flex', gap: '12px' };
  const btnBase = {
    padding: '10px 18px', borderRadius: '8px', fontWeight: '600',
    fontSize: '14px', cursor: 'pointer', border: 'none', transition: 'opacity 0.15s',
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#1a1a2e' }}>
              {modo === 'editar' ? '✏️ Editar cita' : '📅 Detalle de cita'}
            </h2>
            <span style={{
              display: 'inline-block', marginTop: '6px',
              padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              color: badgeStatus.color, backgroundColor: badgeStatus.bg,
            }}>
              {badgeStatus.label}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}
          >×</button>
        </div>

        {/* ── MODO DETALLE ── */}
        {modo === 'detalle' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <InfoFila icono="👤" label="Paciente" valor={cita.title.split(' — ')[0]} />
              <InfoFila icono="📋" label="Motivo" valor={cita.resource.title} />
              <InfoFila icono="🕐" label="Inicio" valor={formatearFecha(cita.resource.scheduled_at)} />
              {cita.resource.end_time && (
                <InfoFila icono="🕑" label="Fin" valor={formatearFecha(cita.resource.end_time)} />
              )}
              {cita.resource.description && (
                <InfoFila icono="📝" label="Observaciones" valor={cita.resource.description} multilinea />
              )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              {/* Solo mostrar "Marcar completada" si está pendiente */}
              {cita.resource.status !== 'completada' && (
                <button
                  onClick={handleCompletar}
                  disabled={guardando}
                  style={{ ...btnBase, backgroundColor: '#2e7d32', color: 'white' }}
                >
                  ✅ Marcar como completada
                </button>
              )}

              {cita.resource.status !== 'completada' && (
                <button
                  onClick={() => setModo('editar')}
                  style={{ ...btnBase, backgroundColor: '#0056b3', color: 'white' }}
                >
                  ✏️ Editar cita
                </button>
              )}

              {/* Botón cancelar — solo si no está completada */}
              {cita.resource.status !== 'completada' && (
                !confirmandoCancelar ? (
                  <button
                    onClick={() => setConfirmandoCancelar(true)}
                    style={{ ...btnBase, backgroundColor: 'white', color: '#c62828', border: '1px solid #f5c2c2' }}
                  >
                    🗑️ Cancelar cita
                  </button>
                ) : (
                  <div style={{ backgroundColor: '#fff5f5', borderRadius: '8px', padding: '14px', border: '1px solid #f5c2c2' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#c62828', fontWeight: '600' }}>
                      ¿Confirmas cancelar esta cita? Esta acción no se puede deshacer.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setConfirmandoCancelar(false)}
                        style={{ ...btnBase, flex: 1, backgroundColor: 'white', color: '#555', border: '1px solid #ddd' }}
                      >
                        No, volver
                      </button>
                      <button
                        onClick={handleCancelar}
                        disabled={guardando}
                        style={{ ...btnBase, flex: 1, backgroundColor: '#c62828', color: 'white' }}
                      >
                        {guardando ? 'Cancelando...' : 'Sí, cancelar'}
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* Mensaje de solo lectura cuando está completada */}
              {cita.resource.status === 'completada' && (
                <div style={{
                  textAlign: 'center', padding: '12px',
                  backgroundColor: '#e8f5e9', borderRadius: '8px',
                  fontSize: '13px', color: '#2e7d32', fontWeight: '600',
                }}>
                  ✅ Esta cita ya fue completada y no puede modificarse.
                </div>
              )}
            </div>
          </>
        )}

        {/* ── MODO EDITAR ── */}
        {modo === 'editar' && (
          <form onSubmit={handleEditar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Fecha *</label>
              <input type="date" name="fecha" required value={form.fecha}
                onChange={handleChange} style={inputStyle} />
            </div>

            <div style={rowStyle}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Hora inicio *</label>
                <input type="time" name="hora_inicio" required value={form.hora_inicio}
                  onChange={handleChange} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Hora fin</label>
                <input type="time" name="hora_fin" value={form.hora_fin}
                  onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Motivo *</label>
              <input type="text" name="motivo" required value={form.motivo}
                onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Observaciones</label>
              <textarea name="descripcion" rows="3" value={form.descripcion}
                onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModo('detalle')}
                style={{ ...btnBase, backgroundColor: 'white', color: '#555', border: '1px solid #ddd' }}>
                Volver
              </button>
              <button type="submit" disabled={guardando}
                style={{ ...btnBase, backgroundColor: guardando ? '#9ab8d7' : '#0056b3', color: 'white' }}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Sub-componente de fila de información
function InfoFila({ icono, label, valor, multilinea }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: multilinea ? 'flex-start' : 'center' }}>
      <span style={{ fontSize: '16px', minWidth: '22px' }}>{icono}</span>
      <div>
        <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#333', lineHeight: '1.4', whiteSpace: multilinea ? 'pre-wrap' : 'normal' }}>
          {valor}
        </p>
      </div>
    </div>
  );
}
