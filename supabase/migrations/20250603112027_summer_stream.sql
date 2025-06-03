/*
  # Add email processor configuration

  1. Changes
    - Create cron extension if not exists
    - Add cron job for email processor
    - Add MailChannels API key to system config

  2. Notes
    - Cron job runs every minute to process email queue
    - API key will be set via Supabase Dashboard
*/

-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the cron schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS cron;

-- Grant usage to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Add cron job for email processor
SELECT cron.schedule(
  'process-email-queue',  -- job name
  '* * * * *',           -- every minute
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.edge_function_base_url') || '/email-processor',
    headers := '{"Authorization": "Bearer ' || current_setting('app.settings.anon_key') || '"}'::jsonb
  ) AS request_id;
  $$
);

-- Add MailChannels API key to system config
INSERT INTO system_config (key, value)
VALUES ('mailchannels_api_key', '')  -- Set this via Supabase Dashboard
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();