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

    // Get pending emails
    const { data: emails, error: fetchError } = await supabaseClient
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
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
        const msg = createMimeMessage();
        msg.setSender({ addr: "noreply@deephandai.com" });
        msg.setRecipient(email.to_address);
        msg.setSubject(email.subject);
        msg.setMessage(email.body);

        await fetch('https://api.mailchannels.net/tx/v1/send', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: email.to_address }] }],
            from: { email: "noreply@deephandai.com", name: "DeepHand" },
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
          })
          .eq('id', email.id);

      } catch (error) {
        console.error(`Failed to send email ${email.id}:`, error);
        
        // Update attempt count and status
        await supabaseClient
          .from('email_queue')
          .update({ 
            status: 'failed',
            attempts: email.attempts + 1,
            error: error.message
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