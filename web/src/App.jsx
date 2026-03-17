import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase'; // <-- Importamos Supabase

// IMPORTACIONES DE TUS PANTALLAS Y COMPONENTES
import DashboardLayout from './views/DashboardLayout';
import DashboardHome from './views/DashboardHome';
import PacientesList from './views/PacientesList';
import HistorialClinico from './views/HistorialClinico';
import CitasCalendario from './views/CitasCalendario';
import ChatMedico from './views/ChatMedico';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginScreen from './views/LoginScreen'; 

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  // NUEVO: Estado para pausar la pantalla mientras revisamos las cookies
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // 1. Función que se ejecuta al presionar F5 o abrir la pestaña
    const restoreSession = async () => {
      try {
        // Preguntamos si hay una sesión activa guardada
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          // Si hay sesión, buscamos qué rol tiene este usuario
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError) throw profileError;

          // Restauramos la memoria
          setCurrentUser(session.user);
          setUserRole(profileData.role);
        }
      } catch (error) {
        console.error("Error restaurando sesión:", error.message);
      } finally {
        // 2. Ya sea que haya sesión o no, quitamos la pantalla de carga
        setIsCheckingSession(false);
      }
    };

    restoreSession();

    // 3. Escuchador automático: Si en el futuro alguien cierra sesión, limpiamos la memoria
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // El arreglo vacío indica que esto solo corre una vez al encender la App

  const handleSetSession = (user, role) => {
    setCurrentUser(user);
    setUserRole(role);
  };

  // LA MAGIA: Si estamos revisando, mostramos una pantalla de carga en lugar de expulsarte
  if (isCheckingSession) {
    return (
      <div style={{ backgroundColor: '#050a0e', color: '#00ffcc', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace' }}>
        <h2>VERIFICANDO_CREDENCIALES...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={<LoginScreen onLoginSuccess={handleSetSession} />} 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={currentUser} role={userRole} allowedRoles={['doctor', 'admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          {/* Index = Lo que se carga por defecto al entrar a /dashboard */}
          <Route index element={<DashboardHome />} />
          
          {/* Rutas Hijas */}
          <Route path="pacientes" element={<PacientesList />} />
          <Route path="pacientes/:pacienteId" element={<HistorialClinico />} />
          <Route path="citas" element={<CitasCalendario />} />
          <Route path="mensajes" element={<ChatMedico />} />
        </Route>

        <Route 
          path="/super-admin" 
          element={
            <ProtectedRoute user={currentUser} role={userRole} allowedRoles={['admin']}>
              <div style={{ color: 'white', backgroundColor: '#111', height: '100vh', padding: '20px' }}>
                <h1 style={{ color: '#00ffcc' }}>PANEL SUPER ADMINISTRADOR 👑</h1>
                <p>Aquí se darán de alta nuevas clínicas y se verán las métricas del servidor.</p>
              </div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}