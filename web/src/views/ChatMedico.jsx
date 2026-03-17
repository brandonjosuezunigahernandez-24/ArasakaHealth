import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BurbujaMensaje from '../components/chat/BurbujaMensaje';


export default function ChatMedico() {
  const { doctorInfo } = useOutletContext();

  const [pacientes, setPacientes] = useState([]);
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [loadingMensajes, setLoadingMensajes] = useState(false);

  const mensajesEndRef = useRef(null);
  const channelRef = useRef(null);

  // ── 1. Cargar lista de pacientes vinculados ──────────────────────
  useEffect(() => {
    const fetchPacientes = async () => {
      const { data, error } = await supabase
        .from('relationships')
        .select('patient_id, profiles!relationships_patient_id_fkey(id, first_name, last_name, email)')
        .eq('agent_id', doctorInfo.id)
        .eq('status', 'active');

      if (!error && data) {
        setPacientes(data.map(r => r.profiles).filter(Boolean));
      }
    };
    fetchPacientes();
  }, [doctorInfo.id]);

  // ── 2. Cargar mensajes del paciente activo ───────────────────────
  const fetchMensajes = useCallback(async (pacienteId) => {
    setLoadingMensajes(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${doctorInfo.id},receiver_id.eq.${pacienteId}),` +
        `and(sender_id.eq.${pacienteId},receiver_id.eq.${doctorInfo.id})`
      )
      .order('created_at', { ascending: true });

    if (!error && data) setMensajes(data);
    setLoadingMensajes(false);

    // Marcar mensajes recibidos como leídos
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('sender_id', pacienteId)
      .eq('receiver_id', doctorInfo.id)
      .eq('is_read', false);
  }, [doctorInfo.id]);

  // ── 3. Suscripción Realtime al seleccionar paciente ──────────────
  useEffect(() => {
    if (!pacienteActivo) return;

    fetchMensajes(pacienteActivo.id);

    // Limpiar canal anterior
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`chat_${doctorInfo.id}_${pacienteActivo.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const msg = payload.new;
          // Solo agregar si pertenece a esta conversación
          const esDeEstaConversacion =
            (msg.sender_id === doctorInfo.id && msg.receiver_id === pacienteActivo.id) ||
            (msg.sender_id === pacienteActivo.id && msg.receiver_id === doctorInfo.id);
          if (esDeEstaConversacion) {
            setMensajes(prev => [...prev, msg]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pacienteActivo, doctorInfo.id, fetchMensajes]);

  // ── 4. Auto-scroll al último mensaje ────────────────────────────
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // ── 5. Enviar mensaje ────────────────────────────────────────────
  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!inputMensaje.trim() || !pacienteActivo || enviando) return;

    setEnviando(true);
    const contenido = inputMensaje.trim();
    setInputMensaje('');

    const { error } = await supabase.from('chat_messages').insert([{
      sender_id: doctorInfo.id,
      receiver_id: pacienteActivo.id,
      content: contenido,
      is_read: false,
    }]);

    if (error) {
      alert('Error al enviar el mensaje: ' + error.message);
      setInputMensaje(contenido); // restaurar si falló
    }
    setEnviando(false);
  };

  // ── ESTILOS ──────────────────────────────────────────────────────
  const containerStyle = {
    display: 'flex',
    height: 'calc(100vh - 100px)',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    overflow: 'hidden',
  };

  const panelIzqStyle = {
    width: '300px',
    minWidth: '280px',
    borderRight: '1px solid #e8edf2',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafbfc',
  };

  const panelDerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const getIniciales = (p) => {
    if (!p) return '?';
    return `${p.first_name?.charAt(0) || ''}${p.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div style={containerStyle}>

      {/* ── PANEL IZQUIERDO: Lista de pacientes ── */}
      <div style={panelIzqStyle}>
        <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid #e8edf2' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1a1a2e' }}>
            💬 Mensajes
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
            {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} vinculado{pacientes.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {pacientes.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
              No tienes pacientes vinculados aún.
            </div>
          ) : (
            pacientes.map(p => {
              const activo = pacienteActivo?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPacienteActivo(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    width: '100%', padding: '14px 16px', border: 'none',
                    backgroundColor: activo ? '#f0f5fa' : 'transparent',
                    borderLeft: activo ? '3px solid #0056b3' : '3px solid transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '42px', height: '42px', minWidth: '42px',
                    borderRadius: '50%', backgroundColor: activo ? '#0056b3' : '#c8d8ea',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: activo ? 'white' : '#0056b3', fontWeight: '700', fontSize: '15px',
                  }}>
                    {getIniciales(p)}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontWeight: activo ? '700' : '500', fontSize: '14px', color: activo ? '#0056b3' : '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.first_name} {p.last_name}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.email}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── PANEL DERECHO: Conversación ── */}
      {!pacienteActivo ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: '#bbb', gap: '12px',
        }}>
          <span style={{ fontSize: '48px' }}>💬</span>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#aaa' }}>
            Selecciona un paciente para ver la conversación
          </p>
        </div>
      ) : (
        <div style={panelDerStyle}>

          {/* Header conversación */}
          <div style={{
            padding: '16px 24px', borderBottom: '1px solid #e8edf2',
            display: 'flex', alignItems: 'center', gap: '14px',
            backgroundColor: 'white',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              backgroundColor: '#0056b3', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '16px',
            }}>
              {getIniciales(pacienteActivo)}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '16px', color: '#1a1a2e' }}>
                {pacienteActivo.first_name} {pacienteActivo.last_name}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>
                {pacienteActivo.email}
              </p>
            </div>
          </div>

          {/* Área de mensajes */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px 24px',
            backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column',
          }}>
            {loadingMensajes ? (
              <div style={{ textAlign: 'center', color: '#aaa', marginTop: '40px' }}>
                Cargando mensajes...
              </div>
            ) : mensajes.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#ccc', marginTop: '60px' }}>
                <p style={{ fontSize: '14px' }}>Aún no hay mensajes con este paciente.</p>
                <p style={{ fontSize: '13px' }}>¡Escribe el primero!</p>
              </div>
            ) : (
              mensajes.map(msg => (
                <BurbujaMensaje
                  key={msg.id}
                  mensaje={msg}
                  esMio={msg.sender_id === doctorInfo.id}
                />
              ))
            )}
            <div ref={mensajesEndRef} />
          </div>

          {/* Input de mensaje */}
          <form
            onSubmit={handleEnviar}
            style={{
              padding: '14px 20px', borderTop: '1px solid #e8edf2',
              display: 'flex', gap: '12px', alignItems: 'center',
              backgroundColor: 'white',
            }}
          >
            <input
              type="text"
              placeholder="Escribir mensaje..."
              value={inputMensaje}
              onChange={e => setInputMensaje(e.target.value)}
              disabled={enviando}
              style={{
                flex: 1, padding: '11px 16px', borderRadius: '24px',
                border: '1px solid #dce3ea', fontSize: '14px', outline: 'none',
                backgroundColor: '#f4f7fa', color: '#333',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#0056b3'}
              onBlur={e => e.target.style.borderColor = '#dce3ea'}
            />
            <button
              type="submit"
              disabled={!inputMensaje.trim() || enviando}
              style={{
                width: '44px', height: '44px', minWidth: '44px',
                borderRadius: '50%', border: 'none',
                backgroundColor: inputMensaje.trim() ? '#0056b3' : '#d0dae6',
                color: 'white', fontSize: '18px', cursor: inputMensaje.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
