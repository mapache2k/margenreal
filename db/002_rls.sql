-- Migración 002 — Schema-per-tenant
-- El schema público contiene las tablas compartidas (users, auth_log).
-- Cada tenant activado recibe su propio schema: tenant_{user_id}
-- Las tablas de datos de usuario (calculations, saved_products, etc.)
-- se crean dentro del schema del tenant, con aislamiento total.

-- Función que crea el schema de un tenant y sus tablas base
CREATE OR REPLACE FUNCTION create_tenant_schema(p_user_id INTEGER)
RETURNS TEXT AS $$
DECLARE
  v_schema TEXT := 'tenant_' || p_user_id;
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema);

  -- Tabla de cálculos guardados del tenant
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.calculations (
      id           SERIAL PRIMARY KEY,
      nombre       TEXT NOT NULL,
      categoria    TEXT NOT NULL,
      precio       NUMERIC(12,2) NOT NULL,
      costo        NUMERIC(12,2) NOT NULL,
      margen_pct   NUMERIC(6,2) NOT NULL,
      detalle      JSONB,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )', v_schema);

  -- Actualizar schema_name en users
  UPDATE users SET schema_name = v_schema WHERE id = p_user_id;

  RETURN v_schema;
END;
$$ LANGUAGE plpgsql;
