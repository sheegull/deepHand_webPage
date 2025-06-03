/*
  # Clean up email functionality

  1. Changes
    - Drop email-related tables and functions
    - Keep only essential contact_submissions functionality
    - Remove rate limiting based on email submissions
    - Simplify system configuration

  2. Security
    - Maintain existing RLS policies for contact_submissions
*/

-- Drop email-related tables
DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_submissions CASCADE;

-- Drop email-related functions
DROP FUNCTION IF EXISTS process_email_template CASCADE;
DROP FUNCTION IF EXISTS check_email_rate_limit CASCADE;

-- Remove cron job if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'unschedule') THEN
    PERFORM cron.unschedule('process-email-queue');
  END IF;
END $$;

-- Clean up system_config
DELETE FROM system_config 
WHERE key IN ('mailchannels_api_key', 'admin_email');