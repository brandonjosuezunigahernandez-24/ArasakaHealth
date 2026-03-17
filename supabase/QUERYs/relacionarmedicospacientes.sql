-- 1. VINCULAR AL PACIENTE CON EL MÉDICO
INSERT INTO public.relationships (patient_id, agent_id, type, status)
VALUES 
  ('0462b710-4e9d-4a8f-b003-2a777699dd18', 'ec0da71f-f221-4fe8-8f03-dc835284da13', 'doctor_patient', 'active');

-- 2. CREAR UNA CITA PARA EL DÍA DE HOY
INSERT INTO public.clinical_records (patient_id, doctor_id, type, title, description, scheduled_at)
VALUES 
  (
    '0462b710-4e9d-4a8f-b003-2a777699dd18', 
    'ec0da71f-f221-4fe8-8f03-dc835284da13', 
    'cita', 
    'Revisión Mensual de Glucosa', 
    'Paciente reporta mareos matutinos', 
    NOW() -- Esto programa la cita exactamente para el día y hora actual
  );