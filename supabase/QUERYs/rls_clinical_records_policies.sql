-- Políticas RLS completas para clinical_records
-- El médico puede VER sus propias citas y notas (ya existe, pero la incluimos por claridad)
CREATE POLICY "Medico ve sus registros clinicos"
ON public.clinical_records FOR SELECT
USING (auth.uid() = doctor_id);

-- El médico puede CREAR nuevas citas y notas para sus pacientes
CREATE POLICY "Medico inserta registros clinicos"
ON public.clinical_records FOR INSERT
WITH CHECK (auth.uid() = doctor_id);

-- El médico puede EDITAR sus propios registros clínicos
CREATE POLICY "Medico actualiza sus registros clinicos"
ON public.clinical_records FOR UPDATE
USING (auth.uid() = doctor_id)
WITH CHECK (auth.uid() = doctor_id);

-- El médico puede ELIMINAR sus propios registros clínicos
CREATE POLICY "Medico elimina sus registros clinicos"
ON public.clinical_records FOR DELETE
USING (auth.uid() = doctor_id);
