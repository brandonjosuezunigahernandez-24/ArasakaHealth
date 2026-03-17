-- Políticas RLS para chat_messages
-- El usuario (médico o paciente) puede VER mensajes donde es sender o receiver
CREATE POLICY "Usuario ve sus mensajes"
ON public.chat_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- El usuario puede ENVIAR mensajes (siempre es el sender)
CREATE POLICY "Usuario envia mensajes"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- El receptor puede marcar mensajes como leídos (is_read = true)
CREATE POLICY "Receptor marca mensajes como leidos"
ON public.chat_messages FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);
