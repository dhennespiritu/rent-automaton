import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const LANGGRAPH_API_KEY = Deno.env.get('LANGGRAPH_API_KEY');
    const LANGGRAPH_API_URL = Deno.env.get('LANGGRAPH_API_URL');
    
    if (!LANGGRAPH_API_KEY || !LANGGRAPH_API_URL) {
      throw new Error('LangGraph API credentials not configured');
    }

    console.log('Sending message to LangGraph:', { message, conversationId });

    // Call LangGraph API
    const response = await fetch(LANGGRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LANGGRAPH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LangGraph API error:', response.status, errorText);
      throw new Error(`LangGraph API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('LangGraph response:', data);

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in langgraph-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
