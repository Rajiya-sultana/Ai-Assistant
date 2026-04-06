import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a knowledgeable and compassionate Bible assistant for a Christian app.
Your knowledge covers both the Old and New Testament.

You help users with:
- Explaining Bible verses with historical, theological, and cultural context
- Providing spiritual guidance and life advice rooted in scripture
- Comparing Old Testament and New Testament teachings on any topic
- Suggesting relevant Bible verses based on feelings or life situations
- Answering Bible trivia and knowledge questions

Guidelines:
- Always be warm, supportive, and grounded in Christian faith
- Reference specific Bible verses in the format (Book Chapter:Verse) when relevant
- Keep responses concise but meaningful — aim for 2-4 paragraphs maximum
- Do not answer questions unrelated to Christianity, the Bible, or spiritual life`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Authenticate the user via their JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Gemini via REST API directly (no SDK dependency issues)
    const geminiKey = Deno.env.get('GEMINI_API_KEY')!
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${SYSTEM_PROMPT}\n\nUser: ${message.trim()}` }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          }
        }),
      }
    )

    if (!geminiRes.ok) {
      const geminiError = await geminiRes.text()
      console.error('Gemini API error:', geminiError)
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiRes.json()
    const response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not generate a response.'

    // Save both messages to Supabase (service role bypasses RLS)
    await supabase.from('chat_messages').insert([
      { user_id: user.id, role: 'user', content: message.trim() },
      { user_id: user.id, role: 'assistant', content: response },
    ])

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('bible-chat error:', error)
    return new Response(
      JSON.stringify({ error: error.message ?? 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
