import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { persistSession: false },
      }
    );

    // Get pending emails
    const { data: emails, error: fetchError } = await supabaseClient
      .from("email_queue")
      .select("*")
      .in("status", ["pending", "failed"])
      .lt("attempts", MAX_RETRIES)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      throw fetchError;
    }

    if (!emails?.length) {
      return new Response(
        JSON.stringify({ message: "No pending emails" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          await fetch("https://api.mailchannels.net/tx/v1/send", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("MAILCHANNELS_API_KEY")}`,
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: email.to_address }] }],
              from: { email: "noreply@deephandai.com", name: "DeepHand" },
              subject: email.subject,
              content: [{ type: "text/plain", value: email.body }],
            }),
          });

          // Update email status to sent
          await supabaseClient
            .from("email_queue")
            .update({
              status: "sent",
              last_attempt: new Date().toISOString(),
            })
            .eq("id", email.id);

          return { id: email.id, status: "sent" };
        } catch (error) {
          // Update attempt count and status
          await supabaseClient
            .from("email_queue")
            .update({
              status: "failed",
              attempts: email.attempts + 1,
              last_attempt: new Date().toISOString(),
              error: error.message,
            })
            .eq("id", email.id);

          return { id: email.id, status: "failed", error: error.message };
        }
      })
    );

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});