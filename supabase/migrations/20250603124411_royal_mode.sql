/*
  # Fix email processor configuration

  1. Changes
    - Update cron job to include authorization header
    - Add proper error handling
    - Add logging for debugging

  2. Security
    - Use system_config for configuration values
    - Ensure secure headers are passed
*/

-- Unschedule existing job
SELECT cron.unschedule('process-email-queue');

-- Update edge function URL
UPDATE system_config 
SET value = (SELECT current_setting('app.settings.supabase_url') || '/functions/v1')
WHERE key = 'edge_function_base_url';

-- Schedule new job with proper authentication
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *',  -- every minute
  $$
  BEGIN
    PERFORM net.http_post(
      url := (SELECT value || '/email-processor' FROM system_config WHERE key = 'edge_function_base_url'),
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (SELECT value FROM system_config WHERE key = 'anon_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the job
    INSERT INTO system_config (key, value)
    VALUES (
      'email_processor_last_error',
      jsonb_build_object(
        'error', SQLERRM,
        'timestamp', now()::text
      )::text
    )
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = now();
  END;
  $$
);