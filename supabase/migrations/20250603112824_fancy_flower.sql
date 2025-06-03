/*
  # Remove email functionality
  
  1. Changes
    - Drop email-related tables
    - Remove email processing functions
    - Keep only contact submissions functionality
*/

-- Drop email-related tables
DROP TABLE IF EXISTS email_queue;
DROP TABLE IF EXISTS email_templates;

-- Remove cron job
SELECT cron.unschedule('process-email-queue');

-- Remove email-related functions
DROP FUNCTION IF EXISTS process_email_template;

-- Remove email-related config
DELETE FROM system_config WHERE key = 'mailchannels_api_key';