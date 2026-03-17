import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function PacientesList() {
  const { doctorInfo } = useOutletContext(); // Obtenemos el ID del doctor del Layout
  const navigate = useNavigate();
  
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorInfo?.id) return;

    const fetchPacientes = async () => {
      // Buscamos las relaciones activas de este doctor
      const { data, error } = await supabase
        .from('relationships')
        .select(`
          patient_id,
          patient:profiles!relationships_patient_id_fkey(
            id, first_name, last_name, email
          )
        `)
        .eq('agent_id', doctorInfo.id)
        .eq('status', 'active');

      if (!error && data) {
        // Limpiamos el arreglo para dejar solo la info útil del paciente
        const listaLimpia = data.map(rel => rel.patient);
        setPacientes(listaLimpia);
      }
      setLoading(false);
    };

    fetchPacientes();
  }, [doctorInfo]);

  // Filtro en tiempo real para el buscador
  const pacientesFiltrados = pacientes.filter(p => {
    const nombreCompleto = `${p.first_name} ${p.last_name || ''}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase()) || p.email.toLowerCase().includes(busqueda.toLowerCase());
  });

  if (loading) return <div>Cargando directorio de pacientes...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Mis Pacientes</h2>
        
        {/* Buscador de Pacientes */}
        <input 
          type="text" 
          placeholder="Buscar por nombre o correo..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', width: '300px' }}
        />
      </div>

      {/* Tabla de Resultados */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '15px', color: '#666' }}>Nombre del Paciente</th>
            <th style={{ padding: '15px', color: '#666' }}>Contacto</th>
            <th style={{ padding: '15px', color: '#666', textAlign: 'right' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pacientesFiltrados.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                No se encontraron pacientes.
              </td>
            </tr>
          ) : (
            pacientesFiltrados.map(paciente => (
              <tr key={paciente.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>
                  {paciente.first_name} {paciente.last_name}
                </td>
                <td style={{ padding: '15px', color: '#666' }}>
                  {paciente.email}
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  {/* Botón que navega al expediente clínico real */}
                  <button 
                    onClick={() => navigate(`/dashboard/pacientes/${paciente.id}`)}
                    style={{ padding: '8px 16px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Ver Expediente
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
