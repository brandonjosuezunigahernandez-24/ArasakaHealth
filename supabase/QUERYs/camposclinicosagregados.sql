-- Agregar campos clínicos SOLO si no existen previamente
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS blood_type VARCHAR(10),
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2);

-- Actualizar a tu paciente de prueba (Asegúrate de que este sea su ID real)
UPDATE public.profiles 
SET 
  birth_date = '1985-06-15',
  blood_type = 'O+',
  allergies = 'Penicilina, Nueces',
  weight_kg = 82.5,
  height_cm = 175.0
WHERE id = '0462b710-4e9d-4a8f-b003-2a777699dd18';