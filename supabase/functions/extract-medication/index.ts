import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracting medication information from image...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a medication information extraction AI. Extract medication details from prescription/medication label images and return ONLY a JSON object with these exact fields:
            {
              "name": "medication name",
              "dosage": number (extract numeric value only),
              "unit": "unit of measurement (mg, ml, etc.)",
              "instructions": "dosing instructions",
              "initial_quantity": number (total pills/amount if visible),
              "quantity_unit": "pills, ml, patches, etc."
            }
            
            If any field cannot be determined from the image, use null for that field. Be precise with dosage numbers.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract medication information from this prescription/medication label:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to extract medication information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;
    
    console.log('Raw extraction result:', extractedText);

    try {
      // Try to parse the JSON response
      const medicationData = JSON.parse(extractedText);
      
      // Validate required fields
      if (!medicationData.name) {
        return new Response(
          JSON.stringify({ error: 'Could not extract medication name from image' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Successfully extracted medication data:', medicationData);

      return new Response(
        JSON.stringify({ 
          success: true, 
          medication: medicationData 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (parseError) {
      console.error('Failed to parse extracted data as JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse medication information from image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in extract-medication function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});