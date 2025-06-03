/*
  # Add email notifications system

  1. New Tables
    - `email_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `subject` (text)
      - `body` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `email_queue`
      - `id` (uuid, primary key)
      - `to_address` (text)
      - `subject` (text)
      - `body` (text)
      - `template_id` (uuid, foreign key)
      - `status` (text)
      - `attempts` (integer)
      - `created_at` (timestamp)
      - `sent_at` (timestamp)
      - `error` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for service role
*/

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage email templates"
  ON email_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_address text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  template_id uuid REFERENCES email_templates(id),
  status text DEFAULT 'pending',
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  error text
);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage email queue"
  ON email_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default email templates
INSERT INTO email_templates (name, subject, body) VALUES
(
  'contact_admin_notification',
  '新規お問い合わせ通知',
  '新しいお問い合わせが届きました。

送信者情報:
名前: {{name}}
メール: {{email}}

メッセージ:
{{message}}

送信日時: {{created_at}}
IP: {{ip_address}}'
),
(
  'contact_auto_reply',
  'お問い合わせありがとうございます',
  'お問い合わせいただき、ありがとうございます。

内容を確認の上、担当者よりご連絡させていただきます。

今後ともDeepHandをよろしくお願いいたします。'
);

-- Create function to process email templates
CREATE OR REPLACE FUNCTION process_email_template(
  template_name text,
  template_data jsonb
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  template_body text;
  key text;
  value text;
BEGIN
  -- Get template body
  SELECT body INTO template_body
  FROM email_templates
  WHERE name = template_name;

  -- Replace placeholders
  FOR key, value IN SELECT * FROM jsonb_each_text(template_data)
  LOOP
    template_body := replace(template_body, '{{' || key || '}}', value);
  END LOOP;

  RETURN template_body;
END;
$$;