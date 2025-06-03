import { createClient } from "npm:@supabase/supabase-js@2";
import { createMimeMessage } from "npm:mimetext@3.0.27";

Deno.serve(async (_req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        }
      }
    );

    // Get pending emails
    const { data: pendingEmails, error: fetchError } = await supabaseClient
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending emails" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Process each email
    for (const email of pendingEmails) {
      try {
        const msg = createMimeMessage();
        msg.setSender({ addr: "noreply@deephandai.com" });
        msg.setRecipient(email.to_address);
        msg.setSubject(email.subject);
        msg.setMessage(email.body);

        await fetch("https://api.mailchannels.net/tx/v1/send", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("MAILCHANNELS_API_KEY")}`,
          },
          body: JSON.stringify(msg.asRaw()),
        });

        // Update email status to sent
        await supabaseClient
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', email.id);

      } catch (error) {
        // Update attempt count and error message
        await supabaseClient
          .from('email_queue')
          .update({
            attempts: email.attempts + 1,
            error: error.message,
            status: email.attempts >= 2 ? 'failed' : 'pending'
          })
          .eq('id', email.id);
      }
    }

    return new Response(
      JSON.stringify({ message: "Processed email queue" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});