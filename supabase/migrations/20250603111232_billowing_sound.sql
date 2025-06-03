/*
  # Add admin email configuration

  1. New Tables
    - `system_config`
      - `key` (text, primary key)
      - `value` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `system_config` table
    - Add policy for service role to manage configurations
*/

CREATE TABLE IF NOT EXISTS system_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage system config"
  ON system_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert admin email
INSERT INTO system_config (key, value)
VALUES ('admin_email', 'contact@deephandai.com')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();

-- Create function to get config value
CREATE OR REPLACE FUNCTION get_config(config_key text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT value
    FROM system_config
    WHERE key = config_key
  );
END;
$$;