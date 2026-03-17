import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import logoUrl from '../assets/arasaka-logo.png';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Intentamos iniciar sesión con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      // 2. Si el login es exitoso, buscamos el rol del usuario en la tabla 'profiles'
      const userId = authData.user.id;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const userRole = profileData.role;

      // 3. Le avisamos a App.jsx que la sesión es válida y le pasamos el rol real
      onLoginSuccess(authData.user, userRole);

      // 4. Redirigimos al usuario según su nivel de acceso
      if (userRole === 'admin') {
        navigate('/super-admin');
      } else if (userRole === 'doctor') {
        navigate('/dashboard');
      } else {
        // Si es un paciente o cuidador que intenta entrar a la web por error
        setErrorMsg('Acceso denegado. Esta plataforma es exclusiva para personal médico.');
        // Opcional: supabase.auth.signOut() para cerrar la sesión no autorizada
      }

    } catch (error) {
      console.error('Error en login:', error.message);
      setErrorMsg('Credenciales incorrectas o usuario no encontrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* LOGO HEADER */}
        <div className="brand-header">
          <img src={logoUrl} alt="ArasakaHealth Logo" className="brand-logo" />
          <h1 className="brand-name">ArasakaHealth</h1>
        </div>
        
        <h2 className="title">Acceso al Sistema</h2>
        <p className="subtitle">Solo personal médico autorizado</p>
        
        {/* FORMULARIO */}
        <form onSubmit={handleLogin} className="login-form">
          {errorMsg && <p className="error-message">{errorMsg}</p>}
          
          <div className="input-group">
            <label>Correo electrónico</label>
            <div className="input-wrapper">
              <input 
                type="email" 
                placeholder="nombre@arasakahealth.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="input-icon" size={16} />
            </div>
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="input-icon" size={16} />
            </div>
          </div>

          {/* OPCIONES SECUNDARIAS */}
          <div className="form-options">
            <label className="checkbox-wrapper">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Recordarme
            </label>
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* PIE DE PÁGINA SEGURO */}
        <div className="divider"></div>
        <div className="security-footer">
          <div className="shield-icon-wrapper">
            <ShieldCheck size={18} color="#2b6b94" />
          </div>
          <p>
            Sistema seguro para profesionales médicos.<br/>
            Acceso restringido y monitoreado.
          </p>
        </div>

      </div>
    </div>
  );
}