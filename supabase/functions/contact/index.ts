import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';
import { z } from 'npm:zod@3.22.4';
import { createMimeMessage } from 'npm:mimetext@3.0.27';

// Schema validation
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required').max(1000)
});

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check using IP
    const ip = req.headers.get('cf-connecting-ip') || 'unknown';
    const { data: rateLimit } = await supabase
      .from('contact_submissions')
      .select('created_at')
      .eq('ip_address', ip)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
      .order('created_at', { ascending: false });

    if (rateLimit && rateLimit.length >= 5) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const result = contactSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error.issues[0].message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { name, email, message } = result.data;

    // Store in database
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert([
        { 
          name,
          email,
          message,
          ip_address: ip,
          status: 'received'
        }
      ]);

    if (dbError) {
      throw new Error('Failed to store submission');
    }

    // Send confirmation email
    const msg = createMimeMessage();
    msg.setSender({ name: 'DeepHand', addr: 'noreply@deephandai.com' });
    msg.setRecipient(email);
    msg.setSubject('Thank you for contacting DeepHand');
    msg.setMessage(`
Dear ${name},

Thank you for getting in touch with DeepHand. We have received your message and will get back to you shortly.

Best regards,
The DeepHand Team
    `.trim());

    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: {
          email: 'noreply@deephandai.com',
          name: 'DeepHand',
        },
        subject: 'Thank you for contacting DeepHand',
        content: [{
          type: 'text/plain',
          value: msg.asRaw(),
        }],
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});