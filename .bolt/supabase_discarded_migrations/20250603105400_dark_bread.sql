/*
  # Add email queue table for reliable email delivery

  1. New Tables
    - `email_queue`
      - `id` (uuid, primary key)
      - `to_address` (text)
      - `subject` (text)
      - `body` (text)
      - `attempts` (integer)
      - `status` (text)
      - `created_at` (timestamp)
      - `last_attempt` (timestamp)
      - `error` (text)

  2. Security
    - Enable RLS on `email_queue` table
    - Add policies for service role
*/

CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_address text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  attempts integer DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  last_attempt timestamptz,
  error text
);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage email queue"
  ON email_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);