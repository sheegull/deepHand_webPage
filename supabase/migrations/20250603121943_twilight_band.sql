/*
  # Fix email processor configuration

  1. Changes
    - Add required settings to system_config
    - Update cron job with correct Edge Function URL
    - Add monitoring functions
*/

-- Add required settings
INSERT INTO system_config (key, value) VALUES
('edge_function_base_url', 'https://deephand.pages.dev/functions/v1'),
('anon_key', current_setting('supabase.anon_key'))
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();

-- Update app settings
ALTER DATABASE postgres SET "app.settings.edge_function_base_url" = 'https://deephand.pages.dev/functions/v1';
ALTER DATABASE postgres SET "app.settings.anon_key" = current_setting('supabase.anon_key');

-- Reschedule cron job with correct settings
SELECT cron.unschedule('process-email-queue');
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *',  -- every minute
  $$
  SELECT net.http_post(
    url := 'https://deephand.pages.dev/functions/v1/email-processor',
    headers := '{"Authorization": "Bearer ' || current_setting('supabase.anon_key') || '"}'::jsonb
  ) AS request_id;
  $$
);

-- Function to retry failed emails
CREATE OR REPLACE FUNCTION retry_failed_emails()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE email_queue
  SET 
    status = 'pending',
    attempts = 0,
    error = NULL,
    last_error_details = NULL,
    next_attempt_at = NULL
  WHERE 
    status = 'failed'
    AND attempts < 3;
END;
$$;