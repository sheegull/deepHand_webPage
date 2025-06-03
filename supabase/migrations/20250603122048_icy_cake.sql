/*
  # Configure email processor settings and retry functionality

  1. Configuration
    - Add system configuration entries for email processor
    - Set up edge function URL and authentication
  
  2. Email Processing
    - Create cron job for processing email queue
    - Add function for retrying failed emails
*/

-- Add required settings
INSERT INTO system_config (key, value) VALUES
('edge_function_base_url', 'https://deephand.pages.dev/functions/v1'),
('anon_key', '')  -- Will be set via environment variables
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();

-- Create index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config (key);

-- Reschedule cron job with correct settings
SELECT cron.unschedule('process-email-queue');
SELECT cron.schedule(
  'process-email-queue',
  '* * * * *',  -- every minute
  $$
  SELECT net.http_post(
    url := (SELECT value FROM system_config WHERE key = 'edge_function_base_url') || '/email-processor',
    headers := json_build_object(
      'Authorization',
      'Bearer ' || (SELECT value FROM system_config WHERE key = 'anon_key')
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