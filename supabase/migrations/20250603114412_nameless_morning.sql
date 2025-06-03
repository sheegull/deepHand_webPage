/*
  # Check and update email configuration
  
  1. Verify Tables
    - Check email_queue table status
    - Add missing indexes
    - Add logging columns
  
  2. Add Monitoring
    - Add detailed error logging
    - Add timestamp tracking
*/

-- Add detailed logging columns to email_queue
ALTER TABLE email_queue
ADD COLUMN IF NOT EXISTS last_error_details text,
ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz,
ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz;

-- Add index for better queue processing performance
CREATE INDEX IF NOT EXISTS idx_email_queue_status_created 
ON email_queue (status, created_at) 
WHERE status = 'pending';

-- Create view for monitoring
CREATE OR REPLACE VIEW email_queue_status AS
SELECT 
  status,
  COUNT(*) as count,
  MIN(created_at) as oldest_message,
  MAX(created_at) as newest_message,
  COUNT(*) FILTER (WHERE attempts > 0) as retried_count,
  MAX(attempts) as max_attempts
FROM email_queue
GROUP BY status;

-- Function to check queue health
CREATE OR REPLACE FUNCTION check_email_queue_health()
RETURNS TABLE (
  status text,
  message text,
  details jsonb
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH queue_stats AS (
    SELECT 
      COUNT(*) as total_pending,
      COUNT(*) FILTER (WHERE now() - created_at > interval '1 hour') as stuck_count,
      MAX(attempts) as max_attempts,
      MAX(now() - created_at) as oldest_pending
    FROM email_queue
    WHERE status = 'pending'
  )
  SELECT 
    CASE 
      WHEN total_pending = 0 THEN 'healthy'
      WHEN stuck_count > 0 THEN 'warning'
      ELSE 'active'
    END,
    CASE 
      WHEN total_pending = 0 THEN 'Queue is empty'
      WHEN stuck_count > 0 THEN 'Some messages are stuck'
      ELSE 'Queue is processing normally'
    END,
    jsonb_build_object(
      'pending_count', total_pending,
      'stuck_count', stuck_count,
      'max_attempts', max_attempts,
      'oldest_pending', oldest_pending
    )
  FROM queue_stats;
END;
$$;