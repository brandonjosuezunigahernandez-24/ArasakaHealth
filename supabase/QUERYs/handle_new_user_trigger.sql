-- 1. Desconectamos el gatillo viejo por seguridad
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Creamos una versión "a prueba de balas" de la función
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Simplemente tomamos el ID y el Correo (que nunca están vacíos)
  -- y forzamos el rol a 'patient' por defecto. Cero complicaciones.
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id, 
    new.email, 
    'patient'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Volvemos a conectar el gatillo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();