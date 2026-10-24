import { useRef, useState, type FormEvent } from 'react'
import { ArrowUpRight, Copy, Mail } from 'lucide-react'
import { prepareEmail } from '../contact'
import { profile } from '../data'

export default function ContactForm({ recipient }: { recipient: string }) {
  const form = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState('')

  function draft() {
    if (!form.current?.reportValidity()) return null
    const values = new FormData(form.current)
    const fields = {
      name: String(values.get('name') ?? ''),
      email: String(values.get('email') ?? ''),
      subject: String(values.get('subject') ?? ''),
      message: String(values.get('message') ?? ''),
    }
    if (!fields.name.trim() || !fields.message.trim()) {
      setStatus('Please add your name and a message before preparing an email.')
      return null
    }
    return prepareEmail(recipient, fields)
  }

  function openDraft(event: FormEvent) {
    event.preventDefault()
    const email = draft()
    if (!email) return
    const link = document.createElement('a')
    link.href = email.mailto
    document.body.append(link)
    link.click()
    link.remove()
    setStatus('Draft prepared. Complete sending in your email app, or use Copy message.')
  }

  async function copyMessage() {
    const email = draft()
    if (!email) return
    try {
      await navigator.clipboard.writeText(email.body)
      setStatus(`Message copied. Paste it into an email to ${recipient}.`)
    } catch {
      setStatus('Copy was unavailable. Select your message and copy it manually.')
    }
  }

  return (
    <section className="email-section" aria-labelledby="email-form-heading">
      <div className="email-section-heading">
        <div>
          <p className="eyebrow">OR, THE GOOD OLD INBOX</p>
          <h2 id="email-form-heading">
            Leave me a note<span className="name-dot">.</span>
          </h2>
        </div>
        <a className="email-address" href={`mailto:${recipient}`}>
          <Mail size={15} />
          {recipient}
        </a>
      </div>
      <form
        ref={form}
        onSubmit={openDraft}
        className="email-form"
        aria-label={`Email ${profile.firstName}`}
      >
        <div className="email-fields">
          <label>
            Your name
            <input
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              placeholder="What should I call you?"
            />
          </label>
          <label>
            Your email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
            />
          </label>
        </div>
        <label>
          Subject <span className="optional-label">(optional)</span>
          <input name="subject" maxLength={150} placeholder="A project, an idea, a hello…" />
        </label>
        <label>
          Your message
          <textarea
            name="message"
            required
            maxLength={4000}
            rows={5}
            placeholder="Tell me what you have in mind."
          />
        </label>
        <p className="email-form-note" id="email-form-note">
          Opens a draft in your email app. Review it and press Send there. This form does not
          deliver messages automatically.
        </p>
        <div className="email-form-actions">
          <button className="primary-button" type="submit" aria-describedby="email-form-note">
            Open email draft <ArrowUpRight size={17} />
          </button>
          <button type="button" className="outline-button" onClick={copyMessage}>
            <Copy size={15} />
            Copy message
          </button>
        </div>
        <p className="email-form-status" role="status">
          {status}
        </p>
      </form>
    </section>
  )
}
