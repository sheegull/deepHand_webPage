import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        }
      }
    );

    // Parse request body
    const data: ContactFormData = await req.json();

    // Start a transaction
    const { data: submission, error: submissionError } = await supabaseClient
      .from("contact_submissions")
      .insert({
        name: data.name,
        email: data.email,
        message: data.message,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
      })
      .select()
      .single();

    if (submissionError) {
      throw submissionError;
    }

    // Queue email
    const { error: emailError } = await supabaseClient
      .from("email_queue")
      .insert({
        to_address: "contact@deephandai.com",
        subject: "New Contact Form Submission",
        body: `
Name: ${data.name}
Email: ${data.email}
Message: ${data.message}

Submission ID: ${submission.id}
        `.trim(),
      });

    if (emailError) {
      console.error("Failed to queue email:", emailError);
      // Don't throw here - the form submission was successful
    }

    return new Response(
      JSON.stringify({ message: "Contact form submitted successfully" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});