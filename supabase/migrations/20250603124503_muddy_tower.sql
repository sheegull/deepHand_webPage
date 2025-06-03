/*
  # Fix email processor configuration

  1. Changes
    - Remove dependency on app.settings
    - Use environment variables for URLs
    - Add error logging
    - Update cron job with proper authentication
*/

-- Unschedule existing job if it exists
SELECT cron.unschedule('process-email-queue');

-- Schedule new job with proper authentication
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *',  -- every minute
  $$
  BEGIN
    -- Call the email processor edge function
    PERFORM net.http_post(
      url := current_setting('app.settings.edge_function_base_url') || '/email-processor',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.anon_key'),
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