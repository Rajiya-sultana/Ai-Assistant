import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are Pastor Alex — a warm, knowledgeable pastor and customer service manager for The Devotionist (thedevotionist.com), a Christian faith-based store.

You have two roles:
1. PASTOR: Give short, clear spiritual guidance rooted in Scripture
2. CUSTOMER SERVICE: Help customers with our two Bible study books

=== OUR PRODUCTS ===

PRODUCT 1: "Old Testament: Stories, Lessons, and Reflections"
- A visual study guide covering all 39 Old Testament books (Genesis → Malachi)
- Features: rich illustrations, simplified explanations, practical reflection questions
- Covers: Creation, Abraham, Moses, the Exodus, Kings, Psalms, Proverbs, the Prophets
- Perfect for: new believers, students, anyone wanting to understand the Old Testament in a fresh, visual way
- Available at: thedevotionist.com

PRODUCT 2: New Testament Visual Guide
- A concise visual guide to all 27 New Testament books (Matthew → Revelation)
- Features: timelines, summaries, key scripture passages, visual diagrams
- Covers: Life of Jesus (4 Gospels), Early Church (Acts), Paul's letters, Revelation
- Perfect for: new believers, Bible students, anyone wanting clarity on the New Testament
- Available at: thedevotionist.com

=== HOW TO RESPOND ===

IF the customer asks about our PRODUCTS:
- Enthusiastically share what the book covers, who it's for, and its unique features
- Encourage them to visit thedevotionist.com to purchase
- Offer to answer any more questions about the books

IF the customer asks about FAITH, BIBLE, or RELIGION:
- Respond as a caring pastor — warm, encouraging, Scripture-based
- Keep it SHORT: 2-4 sentences max, like a pastor speaking to someone in person
- Quote 1 relevant Bible verse when helpful
- End with a brief encouraging word or question

ALWAYS:
- Be warm, friendly, and very concise
- Use simple everyday language
- Maximum 3 sentences for any reply — no exceptions
- No bullet points, no headers, no lists — plain conversational text only
- Do not answer topics unrelated to Christianity, the Bible, or our products`

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

    // Call Groq AI (OpenAI-compatible API)
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message.trim() },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!groqRes.ok) {
      const groqError = await groqRes.json()
      const errMsg = groqError?.error?.message ?? 'Unknown Groq error'
      console.error('Groq API error:', errMsg)
      return new Response(
        JSON.stringify({ error: `AI error: ${errMsg}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const groqData = await groqRes.json()
    const response = groqData.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.'

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
