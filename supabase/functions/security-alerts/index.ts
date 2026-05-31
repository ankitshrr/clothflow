import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    const { type } = await req.json()

    let subject = ''
    let html = ''

    if (type === 'login') {
      subject = 'New Login Alert - Reeback Fashion'
      html = `
        <h2>New Login Detected</h2>
        <p>Hi there,</p>
        <p>We just noticed a new login to your Reeback Fashion account.</p>
        <p>If this was you, you can safely ignore this email.</p>
        <p>If this wasn't you, please reset your password immediately.</p>
      `
    } else if (type === 'signup') {
      subject = 'Welcome to Reeback Fashion!'
      html = `
        <h2>Welcome to Reeback Fashion! 🎉</h2>
        <p>Hi there,</p>
        <p>We are so excited to have you join us! Your account has been successfully created.</p>
        <p>You can now save products to your wishlist, securely store your shipping addresses, and breeze through checkout.</p>
        <p>Happy shopping!</p>
        <p>- The Reeback Fashion Team</p>
      `
    } else if (type === 'password_change') {
      subject = 'Security Alert: Password Changed - Reeback Fashion'
      html = `
        <h2>Password Changed Successfully</h2>
        <p>Hi there,</p>
        <p>Your password for your Reeback Fashion account was just changed.</p>
        <p>If you did this, no further action is required.</p>
        <p>If you did not do this, please contact support immediately.</p>
      `
    } else {
      throw new Error('Invalid alert type')
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Reeback Fashion <onboarding@resend.dev>', // You should verify your own domain in Resend later
        to: user.email,
        subject: subject,
        html: html,
      }),
    })

    if (!resendRes.ok) {
      const errorData = await resendRes.json()
      throw new Error(`Resend Error: ${errorData.message}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
