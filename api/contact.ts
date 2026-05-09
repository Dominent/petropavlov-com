import { Resend } from 'resend'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const requestCounts = new Map<string, { count: number; reset: number }>()
const HOUR_MS = 60 * 60 * 1000
const MAX_PER_HOUR = 5

function getIp(req: VercelRequest): string {
  const xf = req.headers['x-forwarded-for']
  if (typeof xf === 'string') return xf.split(',')[0].trim()
  if (Array.isArray(xf)) return xf[0]
  return req.socket.remoteAddress || 'unknown'
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error:
        'The contact form isn\'t configured yet. Please email petromilpavlov@gmail.com directly.',
    })
  }

  const ip = getIp(req)
  if (!rateLimit(ip)) {
    return res.status(429).json({
      error:
        'Too many submissions from this address. Please email petromilpavlov@gmail.com directly.',
    })
  }

  const { name, email, message } = (req.body ?? {}) as {
    name?: string
    email?: string
    message?: string
  }

  if (
    !name ||
    !email ||
    !message ||
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string'
  ) {
    return res.status(400).json({ error: 'Please fill in all three fields.' })
  }

  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const trimmedMessage = message.trim()

  if (trimmedName.length < 2 || trimmedName.length > 200) {
    return res.status(400).json({ error: 'Name must be between 2 and 200 characters.' })
  }
  if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 200) {
    return res.status(400).json({ error: 'Please use a valid email address.' })
  }
  if (trimmedMessage.length < 10 || trimmedMessage.length > 5000) {
    return res.status(400).json({ error: 'Message must be between 10 and 5000 characters.' })
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
      return res.status(500).json({
        error: 'Couldn\'t send the message. Email petromilpavlov@gmail.com directly.',
      })
    }

    return res.status(200).json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('contact api error:', msg)
    return res.status(500).json({
      error: 'Couldn\'t send the message. Email petromilpavlov@gmail.com directly.',
    })
  }
}
