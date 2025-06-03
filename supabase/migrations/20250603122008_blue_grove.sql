/*
  # Fix email processor configuration

  1. Changes
    - Add system configuration for edge function URL and anon key
    - Set database-level settings for the email processor
    - Reschedule cron job with correct settings
    - Add function to retry failed emails

  2. Security
    - Uses secure parameter handling for sensitive values
*/

-- Add required settings
INSERT INTO system_config (key, value) VALUES
('edge_function_base_url', 'https://deephand.pages.dev/functions/v1'),
('anon_key', (SELECT current_setting('supabase.anon_key')))
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();

-- Update app settings
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET app.settings.edge_function_base_url = %L',
    current_database(),
    'https://deephand.pages.dev/functions/v1'
  );
  
  EXECUTE format('ALTER DATABASE %I SET app.settings.anon_key = %L',
    current_database(),
    (SELECT current_setting('supabase.anon_key'))
  );
END $$;

-- Reschedule cron job with correct settings
SELECT cron.unschedule('process-email-queue');
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *',  -- every minute
  $$
  SELECT net.http_post(
    url := 'https://deephand.pages.dev/functions/v1/email-processor',
    headers := json_build_object(
      'Authorization',
      'Bearer ' || current_setting('app.settings.anon_key')
    )::jsonb
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