import { createClient } from "npm:@supabase/supabase-js@2";
import { createMimeMessage } from "npm:mimetext";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check queue health first
    const { data: health } = await supabaseClient
      .rpc('check_email_queue_health')
      .single();
    
    console.log('Queue health status:', health);

    // Get pending emails
    const { data: emails, error: fetchError } = await supabaseClient
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)  // Only process messages with less than 3 attempts
      .is('next_attempt_at', null)  // Or where next attempt time has passed
      .or('next_attempt_at.lt.now()')
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;
    if (!emails?.length) {
      return new Response(JSON.stringify({ message: "No pending emails" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process each email
    for (const email of emails) {
      try {
        // Update attempt tracking before sending
        await supabaseClient
          .from('email_queue')
          .update({ 
            attempts: email.attempts + 1,
            last_attempt_at: new Date().toISOString(),
            status: 'processing'
          })
          .eq('id', email.id);

        const msg = createMimeMessage();
        msg.setSender({ addr: "noreply@deephand.pages.dev" });
        msg.setRecipient(email.to_address);
        msg.setSubject(email.subject);
        msg.setMessage(email.body);

        await fetch('https://api.mailchannels.net/tx/v1/send', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: email.to_address }] }],
            from: { email: "noreply@deephand.pages.dev", name: "DeepHand" },
            subject: email.subject,
            content: [{ type: "text/plain", value: email.body }],
          }),
        });

        // Mark as sent
        await supabaseClient
          .from('email_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            error: null,
            last_error_details: null
          })
          .eq('id', email.id);

      } catch (error) {
        console.error(`Failed to send email ${email.id}:`, error);
        
        const nextAttemptDelay = Math.pow(2, email.attempts) * 5 * 60 * 1000; // Exponential backoff
        const nextAttemptAt = new Date(Date.now() + nextAttemptDelay);

        // Update attempt count and status
        await supabaseClient
          .from('email_queue')
          .update({ 
            status: 'failed',
            error: error.message,
            last_error_details: JSON.stringify(error),
            next_attempt_at: nextAttemptAt.toISOString()
          })
          .eq('id', email.id);
      }
    }

    return new Response(
      JSON.stringify({ message: "Processed email queue" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Email processor error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});