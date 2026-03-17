import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Outlet } from 'react-router-dom';

import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [doctorInfo, setDoctorInfo] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setDoctorInfo(profile);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!doctorInfo) return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando panel...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f7f6', fontFamily: 'sans-serif' }}>
      <Sidebar onLogout={handleLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar doctorInfo={doctorInfo} />

        {/* EL OUTLET: Aquí es donde React renderiza Inicio, o Pacientes, o Citas */}
        {/* Le pasamos doctorInfo para que todas las pantallas sepan quién es el médico */}
        <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
          <Outlet context={{ doctorInfo }} /> 
        </div>
      </div>
    </div>
  );
}