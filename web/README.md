# ArasakaHealth 

Plataforma web de telemedicina para clínicas endocrinológicas, centrada en el monitoreo continuo de glucosa (CGM) mediante integración IoT con Dexcom. Proyecto Integrador II. UTEQ. Brandon Josue Zuñiga Hernandez. Miguel Angel Duran Molina. Joshua Alejandro Guillen Centeno. 
## Stack

- **Frontend Web:** React + Vite, React Router
- **Backend / DB:** Supabase (PostgreSQL, Auth, Row Level Security)
- **IoT (próximamente):** Dexcom API V3

## Módulos implementados

| Módulo | Estado |
|--------|--------|
| Autenticación (Supabase Auth) | ✅ |
| Dashboard médico | ✅ |
| Directorio de pacientes | ✅ |
| Historial clínico | ✅ |
| Calendario de citas (RQFW06) | ✅ |
| Chat médico-paciente (RQFW09) | ✅ |
| Integración Dexcom | 🔜 |

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/ArasakaHealth.git
cd ArasakaHealth/web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 4. Levantar el servidor de desarrollo
npm run dev
```

## Variables de entorno

Copia `.env.example` como `.env.local` y completa los valores:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Estructura del proyecto

```
web/src/
├── views/          # Pantallas completas (una por ruta)
├── components/
│   ├── layout/     # Sidebar, Topbar, ProtectedRoute
│   ├── home/       # Widgets del dashboard
│   ├── citas/      # Modales del calendario
│   └── chat/       # Componentes del chat
├── hooks/          # Custom hooks de Supabase (en desarrollo)
└── lib/
    └── supabase.js # Cliente de Supabase
```

## Base de datos

Los scripts SQL están en `supabase/QUERYs/`. Ejecutar en el SQL Editor de Supabase en este orden:

1. `esquemas.sql` — Esquema base
2. `handle_new_user_trigger.sql` — Trigger de registro
3. `camposclinicosagregados.sql` — Campos clínicos en profiles
4. `accesoamedicosdedatosregistrados.sql` — Políticas RLS base
5. `rls_clinical_records_policies.sql` — RLS para citas
6. `rls_chat_messages_policies.sql` — RLS para chat
