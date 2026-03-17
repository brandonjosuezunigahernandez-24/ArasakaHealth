import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOutletContext } from 'react-router-dom';

// Importamos los sub-componentes
import SummaryCards from '../components/home/SummaryCards';
import UpcomingAppointments from '../components/home/UpcomingAppointments';
import RecentAlerts from '../components/home/RecentAlerts';

export default function DashboardHome() {
  const { doctorInfo } = useOutletContext();
  const doctorId = doctorInfo?.id;
  const doctorName = doctorInfo?.first_name;
  const [stats, setStats] = useState({ activePatients: 0, appointmentsToday: 0 });
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!doctorId) return;

    const fetchDashboardData = async () => {
      // 1. FUNCIONALIDAD: Contar Pacientes Activos del Médico
      const { data: relData, count: patientCount, error: relError } = await supabase
        .from('relationships')
        .select('*', { count: 'exact' })
        .eq('agent_id', doctorId)
        .eq('type', 'doctor_patient')
        .eq('status', 'active');

      // 2. FUNCIONALIDAD: Citas de Hoy
      const today = new Date().toISOString().split('T')[0];
      
      const { data: citasHoy, error: citasError } = await supabase
        .from('clinical_records')
        .select(`
          id, title, scheduled_at,
          patient:profiles!patient_id(first_name, last_name)
        `)
        .eq('doctor_id', doctorId)
        .eq('type', 'cita')
        .gte('scheduled_at', `${today}T00:00:00Z`)
        .lte('scheduled_at', `${today}T23:59:59Z`)
        .order('scheduled_at', { ascending: true });

      setStats({
        activePatients: patientCount || 0,
        appointmentsToday: citasHoy ? citasHoy.length : 0
      });
      setAppointments(citasHoy || []);
    };

    fetchDashboardData();
  }, [doctorId]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 5px 0', color: '#222' }}>Panel de Control</h1>
        <p style={{ margin: 0, color: '#666' }}>Bienvenido de nuevo, Dra. {doctorName || 'Médico'}. Aquí tiene un resumen de su actividad.</p>
      </div>
      
      {/* SECCIÓN 1: Tarjetas */}
      <SummaryCards stats={stats} />

      {/* SECCIÓN 2: Columnas */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <UpcomingAppointments appointments={appointments} />
        <RecentAlerts />
      </div>
    </div>
  );
}