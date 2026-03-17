-- INSERTAR MÚLTIPLES CITAS EN UN SOLO COMANDO
INSERT INTO public.clinical_records (patient_id, doctor_id, type, title, description, scheduled_at)
VALUES 
  -- 1. Cita para HOY (Para probar tu Dashboard actual)
  (
    '0462b710-4e9d-4a8f-b003-2a777699dd18', 
    'ec0da71f-f221-4fe8-8f03-dc835284da13', 
    'cita', 
    'Revisión Mensual (HOY)', 
    'Cita programada para el día actual.', 
    NOW() 
  ),

  -- 2. Cita para MAÑANA
  (
    '0462b710-4e9d-4a8f-b003-2a777699dd18', 
    'ec0da71f-f221-4fe8-8f03-dc835284da13', 
    'cita', 
    'Lectura de Sensor Dexcom', 
    'Revisión de picos de glucosa de la noche anterior.', 
    NOW() + INTERVAL '1 day' -- Suma exactamente 24 horas a la hora actual
  ),

  -- 3. Cita para la PRÓXIMA SEMANA
  (
    '0462b710-4e9d-4a8f-b003-2a777699dd18', 
    'ec0da71f-f221-4fe8-8f03-dc835284da13', 
    'cita', 
    'Ajuste de Dosis de Insulina', 
    'Evaluar reacción a la nueva dieta.', 
    NOW() + INTERVAL '7 days' 
  ),

  -- 4. Cita para el PRÓXIMO MES (Para probar los filtros largos)
  (
    '0462b710-4e9d-4a8f-b003-2a777699dd18', 
    'ec0da71f-f221-4fe8-8f03-dc835284da13', 
    'cita', 
    'Laboratorios Trimestrales', 
    'Traer estudios de sangre.', 
    NOW() + INTERVAL '1 month'
  );