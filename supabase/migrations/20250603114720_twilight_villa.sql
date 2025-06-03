/*
  # Add email queue monitoring view and functions

  1. New Views
    - `email_queue_monitoring`: Detailed view of queue status and performance metrics
  
  2. New Functions
    - `get_queue_metrics`: Function to retrieve current queue metrics
*/

-- Create detailed monitoring view
CREATE OR REPLACE VIEW email_queue_monitoring AS
SELECT 
  eq.status,
  COUNT(*) as message_count,
  MIN(eq.created_at) as oldest_message,
  MAX(eq.created_at) as newest_message,
  AVG(EXTRACT(EPOCH FROM (COALESCE(eq.sent_at, now()) - eq.created_at))) as avg_processing_time_seconds,
  COUNT(*) FILTER (WHERE eq.attempts > 0) as retry_count,
  MAX(eq.attempts) as max_retries,
  COUNT(*) FILTER (WHERE now() - eq.created_at > interval '1 hour') as delayed_count,
  COUNT(*) FILTER (WHERE eq.error IS NOT NULL) as error_count,
  array_agg(DISTINCT eq.error) FILTER (WHERE eq.error IS NOT NULL) as error_types
FROM email_queue eq
GROUP BY eq.status;

-- Function to get current queue metrics
CREATE OR REPLACE FUNCTION get_queue_metrics()
RETURNS TABLE (
  metric_name text,
  metric_value text,
  status text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH metrics AS (
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
      COUNT(*) FILTER (WHERE status = 'processing') as processing_count,
      COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
      COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
      MAX(attempts) as highest_attempts,
      COUNT(*) FILTER (WHERE now() - created_at > interval '1 hour' AND status = 'pending') as stuck_count
    FROM email_queue
  )
  SELECT 'Pending Messages' as metric_name,
         pending_count::text as metric_value,
         CASE WHEN pending_count > 0 THEN 'warning' ELSE 'ok' END as status
  FROM metrics
  UNION ALL
  SELECT 'Processing Messages',
         processing_count::text,
         CASE WHEN processing_count > 0 THEN 'info' ELSE 'ok' END
  FROM metrics
  UNION ALL
  SELECT 'Sent Messages',
         sent_count::text,
         'ok'
  FROM metrics
  UNION ALL
  SELECT 'Failed Messages',
         failed_count::text,
         CASE WHEN failed_count > 0 THEN 'error' ELSE 'ok' END
  FROM metrics
  UNION ALL
  SELECT 'Stuck Messages (>1h)',
         stuck_count::text,
         CASE WHEN stuck_count > 0 THEN 'error' ELSE 'ok' END
  FROM metrics;
END;
$$;