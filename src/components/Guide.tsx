import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUp, Sparkles, X } from 'lucide-react'
import { guideAnswers, type PageId } from '../data'
export default function Guide({
  navigate,
  close,
}: {
  navigate: (p: PageId) => void
  close: () => void
}) {
  const [messages, setMessages] = useState<{ role: string; text: string; page?: PageId }[]>([
    {
      role: 'guide',
      text: "Hey, curious human. I'm your guide to Irfan’s portfolio. Ask me about his projects, skills, or what he’s learning.",
    },
  ])
  const [input, setInput] = useState('')
  const log = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight
  }, [messages])
  function ask(text: string) {
    if (!text.trim()) return
    const answer = guideAnswers.find((a) =>
      a.terms.some((term) => new RegExp('\\b' + term + 's?\\b', 'i').test(text)),
    )
    setMessages((m) => [
      ...m,
      { role: 'you', text },
      {
        role: 'guide',
        text:
          answer?.text ??
          'I can help you explore Irfan’s projects, skills, education, and contact links. Try “What has he built?” or use the suggestions below.',
        page: answer?.page,
      },
    ])
    setInput('')
  }
  return (
    <aside className="guide-panel" aria-label="Portfolio guide">
      <div className="guide-header">
        <span>
          <Sparkles size={16} /> PORTFOLIO GUIDE
        </span>
        <button className="icon-button" aria-label="Close portfolio guide" onClick={close}>
          <X size={17} />
        </button>
      </div>
      <div className="guide-intro">
        <div className="guide-symbol">✳</div>
        <h2>
          A little help
          <br />
          finding your way.
        </h2>
        <p>Local answers. No account needed.</p>
      </div>
      <div className="guide-messages" ref={log} role="log" aria-label="Guide conversation">
        {messages.map((m, i) => (
          <div key={i} className={'guide-message ' + m.role}>
            <small>{m.role === 'you' ? 'YOU' : 'THE GUIDE'}</small>
            <p>{m.text}</p>
            {m.page && (
              <button className="text-button" onClick={() => navigate(m.page!)}>
                Take me there <ArrowRight size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="guide-suggestions">
        {['What has he built?', 'What is he studying?', 'How can I connect?'].map((t) => (
          <button key={t} onClick={() => ask(t)}>
            {t}
            <ArrowUp size={12} />
          </button>
        ))}
      </div>
      <form
        className="guide-form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          ask(input)
        }}
      >
        <input
          aria-label="Ask portfolio guide"
          placeholder="Ask about Irfan…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
        />
        <button className="icon-button" aria-label="Send question" disabled={!input.trim()}>
          <ArrowUp size={17} />
        </button>
      </form>
      <div className="guide-disclaimer">CURATED FROM IRFAN'S PUBLIC PROFILE</div>
    </aside>
  )
}
