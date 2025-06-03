/*
  # Clean up email-related tables and configurations

  1. Changes
    - Drop email_queue table if exists
    - Drop email_templates table if exists
    - Drop email_submissions table if exists
    - Remove email-related system configurations
*/

-- Drop email-related tables
DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_submissions CASCADE;

-- Clean up system_config
DELETE FROM system_config 
WHERE key IN ('mailchannels_api_key', 'admin_email');