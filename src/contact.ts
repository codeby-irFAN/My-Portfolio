import { profile } from './data'
export type ContactMessage = {
  name: string
  email: string
  subject: string
  message: string
}

export function prepareEmail(recipient: string, fields: ContactMessage) {
  const name = fields.name.trim().replace(/[\r\n]+/g, ' ')
  const email = fields.email.trim().replace(/[\r\n]+/g, ' ')
  const subject = fields.subject.trim().replace(/[\r\n]+/g, ' ') || `Portfolio enquiry from ${name}`
  const body = `Hi ${profile.firstName},\n\n${fields.message.trim()}\n\nFrom: ${name}\nReply to: ${email}`
  return {
    body,
    mailto: `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  }
}
