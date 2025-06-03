/*
  # Add email processor cron configuration

  1. New Tables
    - None

  2. Changes
    - Add cron job for email processor
    - Add MailChannels API key to system config
*/

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