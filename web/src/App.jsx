import { useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) alert('Error al iniciar sesion: ' + error.message)
    else alert('Inicio de sesion exitoso')
  }

  return (
    <div style={{ backgroundColor: '#050a0e', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#ff003c' }}>ARASAKA_HEALTH // LOGIN</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        <input 
          type="email" 
          placeholder="Correo Electrónico" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', background: '#1a1a1a', border: '1px solid #ff003c', color: 'white' }}
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', background: '#1a1a1a', border: '1px solid #ff003c', color: 'white' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#ff003c', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          ACCEDER_SISTEMA
        </button>
      </form>
    </div>
  )
}

export default App