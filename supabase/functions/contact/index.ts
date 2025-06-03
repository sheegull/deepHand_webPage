import { createClient } from "npm:@supabase/supabase-js@2";
import { createMimeMessage } from "npm:mimetext@3.0.27";

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

interface RateLimitCheck {
  allowed: boolean;
  wait_time: string;
}

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
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip");

    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "";

    // Check rate limit
    const { data: rateLimitData, error: rateLimitError } = await supabaseClient
      .rpc('check_email_rate_limit', { check_email: data.email })
      .single();

    if (rateLimitError) {
      throw rateLimitError;
    }

    const rateLimit = rateLimitData as RateLimitCheck;
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          waitTime: rateLimit.wait_time
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 429,
        }
      );
    }

    // Record submission attempt
    await supabaseClient
      .from("email_submissions")
      .insert({
        email: data.email,
        ip_address: ipAddress,
      });

    // Insert into contact_submissions table
    const { error } = await supabaseClient
      .from("contact_submissions")
      .insert({
        name: data.name,
        email: data.email,
        message: data.message,
        ip_address: ipAddress,
      });

    if (error) {
      throw error;
    }
    
    // Queue admin notification email
    const { data: adminTemplate } = await supabaseClient
      .from('email_templates')
      .select('id, subject, body')
      .eq('name', 'contact_admin_notification')
      .single();

    if (adminTemplate) {
      const adminEmailBody = await supabaseClient
        .rpc('process_email_template', {
          template_name: 'contact_admin_notification',
          template_data: {
            name: data.name,
            email: data.email,
            message: data.message,
            created_at: new Date().toISOString(),
            ip_address: ipAddress
          }
        })
        .single();

      await supabaseClient
        .from('email_queue')
        .insert({
          to_address: adminEmail,
          subject: adminTemplate.subject,
          body: adminEmailBody.data,
          template_id: adminTemplate.id
        });
    }

    // Queue auto-reply email
    const { data: autoReplyTemplate } = await supabaseClient
      .from('email_templates')
      .select('id, subject, body')
      .eq('name', 'contact_auto_reply')
      .single();

    if (autoReplyTemplate) {
      await supabaseClient
        .from('email_queue')
        .insert({
          to_address: data.email,
          subject: autoReplyTemplate.subject,
          body: autoReplyTemplate.body,
          template_id: autoReplyTemplate.id
        });
    }

    // Mark submission as successful
    await supabaseClient
      .from("email_submissions")
      .update({ success: true })
      .eq("email", data.email)
      .order("created_at", { ascending: false })
      .limit(1);

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