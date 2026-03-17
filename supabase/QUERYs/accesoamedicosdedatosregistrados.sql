-- 1. Permitir al médico ver a sus pacientes vinculados
CREATE POLICY "Medico ve sus relaciones" 
ON public.relationships FOR SELECT 
USING (auth.uid() = agent_id);

-- 2. Permitir al médico ver las citas de su agenda
CREATE POLICY "Medico ve sus citas" 
ON public.clinical_records FOR SELECT 
USING (auth.uid() = doctor_id);

-- 3. Permitir al médico leer los nombres en los perfiles de SUS pacientes 
-- (Esto es vital para que funcione el JOIN que trae el "first_name" de Carlos)
CREATE POLICY "Medico ve perfiles de sus pacientes" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.relationships 
    WHERE agent_id = auth.uid() 
    AND patient_id = profiles.id 
    AND status = 'active'
  )
);

-- 4. Permitir que cualquier usuario (médico o paciente) lea su propia fila en 'profiles'
CREATE POLICY "Usuario ve su propio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);
