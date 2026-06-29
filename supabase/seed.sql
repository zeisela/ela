-- Seed para desarrollo local
-- Requiere un usuario ya creado en auth.users

-- Organización de prueba
INSERT INTO organizations (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Agencia Demo', 'agencia-demo')
ON CONFLICT DO NOTHING;

-- Nota: el perfil se crea automáticamente al registrar el usuario en Supabase Auth.
-- Para seeds de prueba, actualiza el profile existente:
-- UPDATE profiles SET role = 'admin', full_name = 'Admin Demo'
-- WHERE id = '<tu-user-id>';
