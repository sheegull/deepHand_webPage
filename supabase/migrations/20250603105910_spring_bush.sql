/*
  # Add email rate limiting table and functions

  1. New Tables
    - `email_submissions`
      - `id` (uuid, primary key)
      - `email` (text)
      - `ip_address` (text)
      - `created_at` (timestamp)
      - `success` (boolean)

  2. Functions
    - `check_email_rate_limit` - Checks if an email has exceeded the rate limit
    
  3. Security
    - Enable RLS on `email_submissions` table
    - Add policies for service role
*/

-- Create email submissions tracking table
CREATE TABLE IF NOT EXISTS email_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  created_at timestamptz DEFAULT now(),
  success boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can manage email submissions"
  ON email_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION check_email_rate_limit(check_email text)
RETURNS TABLE (
  allowed boolean,
  wait_time interval
) 
LANGUAGE plpgsql
AS $$
DECLARE
  submission_count integer;
  last_submission timestamptz;
BEGIN
  -- Count successful submissions in the last hour
  SELECT 
    COUNT(*),
    MAX(created_at)
  INTO 
    submission_count,
    last_submission
  FROM email_submissions
  WHERE 
    email = check_email
    AND success = true
    AND created_at > NOW() - INTERVAL '1 hour';

  IF submission_count >= 10 THEN
    -- Calculate wait time until oldest submission expires
    RETURN QUERY
    SELECT 
      false AS allowed,
      (last_submission + INTERVAL '1 hour' - NOW()) AS wait_time;
  ELSE
    RETURN QUERY
    SELECT 
      true AS allowed,
      INTERVAL '0' AS wait_time;
  END IF;
END;
$$;