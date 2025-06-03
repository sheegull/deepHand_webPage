/*
  # Create email submissions table

  1. New Tables
    - `email_submissions`
      - `id` (uuid, primary key)
      - `email` (text, not null)
      - `ip_address` (text, not null)
      - `created_at` (timestamptz, not null)
      - `success` (boolean, not null)

  2. Security
    - Enable RLS on `email_submissions` table
    - Add policy for service role to manage submissions
*/

CREATE TABLE IF NOT EXISTS public.email_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.email_submissions ENABLE ROW LEVEL SECURITY;

-- Add policy for service role to manage submissions
CREATE POLICY "Service role can manage email submissions"
  ON public.email_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);