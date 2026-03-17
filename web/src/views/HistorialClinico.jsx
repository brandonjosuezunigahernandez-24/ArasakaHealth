import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function HistorialClinico() {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const { doctorInfo } = useOutletContext(); // <-- Obtenemos el ID del doctor actual
  
  const [paciente, setPaciente] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Consultas y Notas'); // Por defecto para probar rápido
  
  // ESTADOS PARA EL FORMULARIO
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    const fetchExpediente = async () => {
      const { data: perfil } = await supabase.from('profiles').select('*').eq('id', pacienteId).single();
      const { data: historial } = await supabase.from('clinical_records').select('*').eq('patient_id', pacienteId).order('scheduled_at', { ascending: false });

      setPaciente(perfil);
      setCitas(historial || []);
      setLoading(false);
    };
    fetchExpediente();
  }, [pacienteId]);

  // FUNCIÓN PARA GUARDAR EN BASE DE DATOS
  const handleGuardarObservacion = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setGuardando(true);

    const { data, error } = await supabase
      .from('clinical_records')
      .insert([
        {
          patient_id: pacienteId,
          doctor_id: doctorInfo.id,
          type: 'nota', // Lo marcamos como nota u observación clínica
          title: nuevoRegistro.title,
          description: nuevoRegistro.description,
          scheduled_at: new Date().toISOString() // Se guarda con la fecha y hora exactas de hoy
        }
      ])
      .select(); // Le pedimos a Supabase que nos devuelva el registro recién creado

    if (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar la observación.");
    } else if (data) {
      // Magia de React: Agregamos el nuevo registro al principio de la lista actual en memoria
      setCitas([data[0], ...citas]);
      
      // Limpiamos y cerramos el formulario
      setNuevoRegistro({ title: '', description: '' });
      setMostrarFormulario(false);
    }
    
    setGuardando(false);
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const cumple = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const mes = hoy.getMonth() - cumple.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < cumple.getDate())) edad--;
    return edad;
  };

  if (loading) return <div style={{ padding: '30px' }}>Cargando expediente...</div>;
  if (!paciente) return <div style={{ padding: '30px' }}>Paciente no encontrado.</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <button onClick={() => navigate(-1)} style={{ width: 'fit-content', padding: '8px 15px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}>
        ← Volver al directorio
      </button>

      {/* CABECERA */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', display: 'flex', gap: '30px', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#0056b3', color: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', fontWeight: 'bold' }}>
          {paciente.first_name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 5px 0', color: '#333' }}>{paciente.first_name} {paciente.last_name}</h1>
          <p style={{ margin: 0, color: '#666' }}>{paciente.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', textAlign: 'center' }}>
          <div>
            <span style={{ display: 'block', fontSize: '12px', color: '#888' }}>Edad</span>
            <strong style={{ fontSize: '18px' }}>{calcularEdad(paciente.birth_date)}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '12px', color: '#888' }}>Sangre</span>
            <strong style={{ fontSize: '18px', color: '#ff003c' }}>{paciente.blood_type || 'N/A'}</strong>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '12px', color: '#888' }}>Peso / Altura</span>
            <strong style={{ fontSize: '18px' }}>{paciente.weight_kg || '-'}kg / {paciente.height_cm || '-'}cm</strong>
          </div>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ddd', gap: '20px' }}>
        {['Resumen', 'Monitoreo Dexcom', 'Consultas y Notas'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab ? '3px solid #0056b3' : '3px solid transparent',
              color: activeTab === tab ? '#0056b3' : '#666', fontWeight: activeTab === tab ? 'bold' : 'normal', fontSize: '16px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', minHeight: '400px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        
        {activeTab === 'Resumen' && ( <div><h3>Información Clínica Relevante</h3></div> )}
        {activeTab === 'Monitoreo Dexcom' && ( <div><h3>Evolución de Glucosa (API v3)</h3></div> )}

        {activeTab === 'Consultas y Notas' && (
          <div style={{ position: 'relative' }}>
            {/* BOTÓN PARA ABRIR EL FORMULARIO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Historial de Visitas</h3>
              
              {!mostrarFormulario && (
                <button 
                  onClick={() => setMostrarFormulario(true)}
                  style={{ padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  + Nueva Observación
                </button>
              )}
            </div>

            {/* FORMULARIO DE NUEVA OBSERVACIÓN (Mockup 25) */}
            {mostrarFormulario && (
              <form onSubmit={handleGuardarObservacion} style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '30px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Registrar Nueva Consulta</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Motivo / Título de la consulta</label>
                  <input 
                    type="text" 
                    required
                    value={nuevoRegistro.title}
                    onChange={(e) => setNuevoRegistro({...nuevoRegistro, title: e.target.value})}
                    placeholder="Ej. Revisión mensual por alteraciones de glucosa..." 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Observaciones Clínicas / Receta</label>
                  <textarea 
                    required
                    rows="5"
                    value={nuevoRegistro.description}
                    onChange={(e) => setNuevoRegistro({...nuevoRegistro, description: e.target.value})}
                    placeholder="Escribe los síntomas, diagnóstico, ajustes de dosis de insulina..." 
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }} 
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={() => setMostrarFormulario(false)}
                    style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#666', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={guardando}
                    style={{ padding: '10px 20px', backgroundColor: '#198754', color: 'white', border: 'none', borderRadius: '6px', cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                  >
                    {guardando ? 'Guardando...' : 'Guardar Registro'}
                  </button>
                </div>
              </form>
            )}
            
            {/* LISTA DE CITAS Y NOTAS */}
            {citas.map(cita => (
              <div key={cita.id} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '15px', backgroundColor: cita.type === 'nota' ? '#fdfdfd' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '16px', color: '#333' }}>
                    {cita.type === 'nota' ? '📝 ' : '📅 '}{cita.title}
                  </strong>
                  <span style={{ fontSize: '14px', color: '#888' }}>
                    {new Date(cita.scheduled_at).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#555', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{cita.description}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}