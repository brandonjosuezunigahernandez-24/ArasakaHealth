import React from 'react';

/**
 * BurbujaMensaje
 * Renderiza un mensaje del chat con soporte para tres tipos:
 *   - Normal: burbuja azul (médico) o gris (paciente)
 *   - [ALERTA]: tarjeta roja con ícono ⚠️
 *   - [RECORDATORIO]: tarjeta azul claro con ícono 📋
 *
 * Props:
 *   mensaje — objeto de chat_messages (id, content, created_at, sender_id)
 *   esMio   — boolean, true si el mensaje fue enviado por el médico actual
 */
export default function BurbujaMensaje({ mensaje, esMio }) {
  const hora = new Date(mensaje.created_at).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  });

  // ── Tarjeta de ALERTA ── ─────────────────────────────────────────
  if (mensaje.content.startsWith('[ALERTA]')) {
    const texto = mensaje.content.replace('[ALERTA]', '').trim();
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <div style={{
          backgroundColor: '#fff0f0', border: '1px solid #f5c2c2',
          borderRadius: '10px', padding: '12px 16px', maxWidth: '70%', width: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <strong style={{ color: '#c0392b', fontSize: '13px' }}>ALERTA: {texto.split('\n')[0]}</strong>
          </div>
          {texto.split('\n').slice(1).map((line, i) => (
            <p key={i} style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  // ── Tarjeta de RECORDATORIO ──────────────────────────────────────
  if (mensaje.content.startsWith('[RECORDATORIO]')) {
    const texto = mensaje.content.replace('[RECORDATORIO]', '').trim();
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
        <div style={{
          backgroundColor: '#f0f6ff', border: '1px solid #b3d1f5',
          borderRadius: '10px', padding: '12px 16px', maxWidth: '70%', width: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px' }}>📋</span>
            <strong style={{ color: '#1a6fc4', fontSize: '13px' }}>Recordatorio: {texto.split('\n')[0]}</strong>
          </div>
          {texto.split('\n').slice(1).map((line, i) => (
            <p key={i} style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  // ── Burbuja normal ───────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      justifyContent: esMio ? 'flex-end' : 'flex-start',
      marginBottom: '12px',
    }}>
      <div style={{
        maxWidth: '65%',
        backgroundColor: esMio ? '#0056b3' : '#f0f4f8',
        color: esMio ? 'white' : '#333',
        borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 14px',
        fontSize: '14px',
        lineHeight: '1.5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{mensaje.content}</p>
        <span style={{
          display: 'block', textAlign: 'right', fontSize: '11px',
          color: esMio ? 'rgba(255,255,255,0.7)' : '#aaa', marginTop: '4px',
        }}>
          {hora}
        </span>
      </div>
    </div>
  );
}
