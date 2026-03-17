import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AgendarCitaModal from '../components/citas/AgendarCitaModal';
import CitaDetalleModal from '../components/citas/CitaDetalleModal';

// Configuración del localizador en español
const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: es }),
  getDay,
  locales,
});

// Mensajes en español para react-big-calendar
const messages = {
  allDay: 'Todo el día',
  previous: '‹',
  next: '›',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Cita',
  noEventsInRange: 'No hay citas en este período.',
  showMore: (total) => `+${total} más`,
};

export default function CitasCalendario() {
  const navigate = useNavigate();
  const { doctorInfo } = useOutletContext();

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('month');
  const [fechaActual, setFechaActual] = useState(new Date());
  const [mostrarModal, setMostrarModal] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  // Cargar citas del doctor desde Supabase
  const fetchCitas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clinical_records')
      .select(`
        id, title, description, scheduled_at, end_time, status,
        profiles!clinical_records_patient_id_fkey(first_name, last_name)
      `)
      .eq('doctor_id', doctorInfo.id)
      .eq('type', 'cita')
      .order('scheduled_at', { ascending: true });

    if (!error && data) {
      const mapped = data.map(cita => {
        const inicio = new Date(cita.scheduled_at);
        // Si no tiene end_time, ponemos 1 hora después por defecto
        const fin = cita.end_time
          ? new Date(cita.end_time)
          : new Date(inicio.getTime() + 60 * 60 * 1000);
        const paciente = cita.profiles;
        return {
          id: cita.id,
          title: paciente
            ? `${paciente.first_name} ${paciente.last_name} — ${cita.title}`
            : cita.title,
          start: inicio,
          end: fin,
          status: cita.status || 'pendiente',
          resource: cita,
        };
      });
      setEventos(mapped);
    }
    setLoading(false);
  }, [doctorInfo.id]);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  // Callback cuando se actualiza una cita desde el modal de detalle
  const handleCitaActualizada = (citaActualizada) => {
    setEventos(prev => prev.map(ev => {
      if (ev.id !== citaActualizada.id) return ev;
      const inicio = new Date(citaActualizada.scheduled_at);
      const fin = citaActualizada.end_time
        ? new Date(citaActualizada.end_time)
        : new Date(inicio.getTime() + 60 * 60 * 1000);
      return {
        ...ev,
        title: ev.title.split(' — ')[0] + ' — ' + citaActualizada.title,
        start: inicio,
        end: fin,
        status: citaActualizada.status,
        resource: citaActualizada,
      };
    }));
  };

  // Callback cuando se elimina/cancela una cita
  const handleCitaEliminada = (citaId) => {
    setEventos(prev => prev.filter(ev => ev.id !== citaId));
  };
  const handleCitaAgendada = (nuevaCita) => {
    const inicio = new Date(nuevaCita.scheduled_at);
    const fin = nuevaCita.end_time
      ? new Date(nuevaCita.end_time)
      : new Date(inicio.getTime() + 60 * 60 * 1000);
    const paciente = nuevaCita.profiles;
    const nuevoEvento = {
      id: nuevaCita.id,
      title: paciente
        ? `${paciente.first_name} ${paciente.last_name} — ${nuevaCita.title}`
        : nuevaCita.title,
      start: inicio,
      end: fin,
      status: 'pendiente',
      resource: nuevaCita,
    };
    setEventos(prev => [...prev, nuevoEvento]);
  };

  // Colores según el estado de la cita (fiel al mockup)
  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.status === 'completada' ? '#9e9e9e' : '#1a6fc4',
      borderLeft: event.status === 'completada' ? '4px solid #757575' : '4px solid #0d47a1',
      borderTop: 'none',
      borderRight: 'none',
      borderBottom: 'none',
      borderRadius: '4px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '500',
      padding: '1px 6px',
    },
  });

  // Estilos generales
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  };

  const titleAreaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  };

  const tabButtonStyle = (active) => ({
    padding: '7px 18px',
    borderRadius: '6px',
    border: active ? 'none' : '1px solid #ddd',
    backgroundColor: active ? '#0056b3' : 'white',
    color: active ? 'white' : '#555',
    fontWeight: active ? '700' : '400',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const btnAgregarStyle = {
    padding: '10px 22px',
    backgroundColor: '#0056b3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,86,179,0.3)',
    transition: 'background 0.2s',
  };

  const calendarWrapperStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    minHeight: '600px',
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 4px',
  };

  const legendStyle = {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  };

  const legendDotStyle = (color) => ({
    display: 'inline-block', width: '14px', height: '14px',
    backgroundColor: color, borderRadius: '3px', marginRight: '6px',
    verticalAlign: 'middle',
  });

  const btnVolverStyle = {
    padding: '10px 22px',
    backgroundColor: '#0056b3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        Cargando calendario...
      </div>
    );
  }

  return (
    <div style={containerStyle}>

      {/* HEADER */}
      <div style={headerStyle}>
        <div style={titleAreaStyle}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
            Calendario de Citas
          </h1>
          {/* Tabs de vista */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f0f4f8', padding: '4px', borderRadius: '8px' }}>
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                style={tabButtonStyle(vista === v)}
                onClick={() => setVista(v)}
              >
                {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>
        </div>

        <button
          style={btnAgregarStyle}
          onClick={() => setMostrarModal(true)}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#004494'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#0056b3'}
        >
          + Agregar cita
        </button>
      </div>

      {/* CALENDARIO */}
      <div style={calendarWrapperStyle}>
        <Calendar
          localizer={localizer}
          events={eventos}
          view={vista}
          onView={setVista}
          date={fechaActual}
          onNavigate={setFechaActual}
          messages={messages}
          culture="es"
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          style={{ height: 580 }}
          popup
          selectable={false}
          onSelectEvent={(event) => setCitaSeleccionada(event)}
          formats={{
            monthHeaderFormat: (date) =>
              format(date, 'MMMM yyyy', { locale: es })
                .replace(/^\w/, c => c.toUpperCase()),
            dayHeaderFormat: (date) =>
              format(date, "EEEE d 'de' MMMM", { locale: es })
                .replace(/^\w/, c => c.toUpperCase()),
            weekdayFormat: (date) =>
              format(date, 'EEEE', { locale: es })
                .replace(/^\w/, c => c.toUpperCase()),
          }}
          toolbar={true}
        />
      </div>

      {/* FOOTER — Leyenda + Botón volver */}
      <div style={footerStyle}>
        <div style={legendStyle}>
          <span>
            <span style={legendDotStyle('#1a6fc4')} />
            <span style={{ fontSize: '13px', color: '#555' }}>Cita pendiente</span>
          </span>
          <span>
            <span style={legendDotStyle('#9e9e9e')} />
            <span style={{ fontSize: '13px', color: '#555' }}>Cita completada</span>
          </span>
        </div>

        <button
          style={btnVolverStyle}
          onClick={() => navigate('/dashboard')}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#004494'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#0056b3'}
        >
          Volver al Dashboard
        </button>
      </div>

      {/* MODAL — Agendar nueva cita */}
      {mostrarModal && (
        <AgendarCitaModal
          doctorInfo={doctorInfo}
          onClose={() => setMostrarModal(false)}
          onCitaAgendada={handleCitaAgendada}
        />
      )}

      {/* MODAL — Detalle / editar / cancelar cita */}
      {citaSeleccionada && (
        <CitaDetalleModal
          cita={citaSeleccionada}
          onClose={() => setCitaSeleccionada(null)}
          onActualizada={handleCitaActualizada}
          onEliminada={handleCitaEliminada}
        />
      )}
    </div>
  );
}
