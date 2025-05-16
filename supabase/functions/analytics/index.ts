import { corsHeaders } from '../_shared/cors.ts'

interface NavigationEvent {
  from: string;
  to: string;
  element: string;
  timestamp: number;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the navigation event from the request body
    const event: NavigationEvent = await req.json()

    // Here you would typically store the event in your database
    // For now, we'll just log it and return success
    console.log('Navigation event:', event)

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})