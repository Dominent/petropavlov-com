// Contact form submit — POST /api/contact.
//
// Validates the three fields (name, email, message), rate-limits the
// caller, then ships the message via Resend to petromilpavlov@gmail.com
// (or whatever CONTACT_TO_EMAIL is set to).

import { Resend } from 'resend'

const requestCounts = new Map<string, { count: number; reset: number }>()
const HOUR_MS = 60 * 60 * 1000
const MAX_PER_HOUR = 5

function getIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = requestCounts.get(ip)
  if (!entry || now > entry.reset) {
    requestCounts.set(ip, { count: 1, reset: now + HOUR_MS })
    return true
  }
  if (entry.count >= MAX_PER_HOUR) return false
  entry.count++
  return true
}

const ESCAPE_MAP: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&#39;',
  '"': '&quot;',
}

function escapeHtml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ESCAPE_MAP[c] ?? c)
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return Response.json(
      {
        error:
          "The contact form isn't configured yet. Please email petromilpavlov@gmail.com directly.",
      },
      { status: 503 },
    )
  }

  const ip = getIp(req)
  if (!rateLimit(ip)) {
    return Response.json(
      {
        error:
          'Too many submissions from this address. Please email petromilpavlov@gmail.com directly.',
      },
      { status: 429 },
    )
  }

  let body: { name?: string; email?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const { name, email, message } = body

  if (
    !name ||
    !email ||
    !message ||
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string'
  ) {
    return Response.json({ error: 'Please fill in all three fields.' }, { status: 400 })
  }

  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const trimmedMessage = message.trim()

  if (trimmedName.length < 2 || trimmedName.length > 200) {
    return Response.json(
      { error: 'Name must be between 2 and 200 characters.' },
      { status: 400 },
    )
  }
  if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 200) {
    return Response.json({ error: 'Please use a valid email address.' }, { status: 400 })
  }
  if (trimmedMessage.length < 10 || trimmedMessage.length > 5000) {
    return Response.json(
      { error: 'Message must be between 10 and 5000 characters.' },
      { status: 400 },
    )
  }

  try {
    const resend = new Resend(apiKey)
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>'
    const toAddress = process.env.CONTACT_TO_EMAIL || 'petromilpavlov@gmail.com'

    const result = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      replyTo: trimmedEmail,
      subject: `Portfolio contact · ${trimmedName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #09090b;">New message from your portfolio</h2>
          <p style="color: #52525b; font-size: 14px;">
            <strong>From:</strong> ${escapeHtml(trimmedName)} &lt;${escapeHtml(trimmedEmail)}&gt;
          </p>
          <div style="white-space: pre-wrap; padding: 16px; background: #fafafa; border-left: 3px solid #f59e0b; margin: 20px 0; font-size: 15px; line-height: 1.6;">${escapeHtml(trimmedMessage)}</div>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;"/>
          <p style="font-size: 12px; color: #71717a;">
            Reply directly to this email to respond. Sender IP: ${escapeHtml(ip)}
          </p>
        </div>
      `,
      text: `From: ${trimmedName} <${trimmedEmail}>\n\n${trimmedMessage}\n\n---\nReply directly to this email to respond.`,
    })

    if (result.error) {
      console.error('resend error:', result.error)
      return Response.json(
        {
          error: "Couldn't send the message. Email petromilpavlov@gmail.com directly.",
        },
        { status: 500 },
      )
    }

    return Response.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('contact api error:', msg)
    return Response.json(
      {
        error: "Couldn't send the message. Email petromilpavlov@gmail.com directly.",
      },
      { status: 500 },
    )
  }
}
