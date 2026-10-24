import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
} from 'lucide-react'
import { findGuideAnswer, profile, projects, assistant, type PageId } from '../data'

type Source = { label: string; url: string }
type Message = {
  role: 'guide' | 'you'
  text: string
  page?: PageId
  source?: 'intro' | 'groq' | 'local'
  sources?: Source[]
}

export default function Guide({
  navigate,
  close,
}: {
  navigate: (p: PageId) => void
  close: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'guide',
      source: 'intro',
      text: assistant.welcome,
    },
  ])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [status, setStatus] = useState('AI when connected. Local answers as a fallback.')
  const hasConversation = messages.some((message) => message.role === 'you')
  const log = useRef<HTMLDivElement>(null)
  const request = useRef<AbortController | null>(null)
  useEffect(() => {
    const container = log.current
    const latest = container?.lastElementChild
    if (container && latest) {
      // Start long replies at their first line instead of jumping to the bottom.
      container.scrollTop +=
        latest.getBoundingClientRect().top - container.getBoundingClientRect().top - 12
    }
  }, [messages, pending])
  useEffect(
    () => () => {
      request.current?.abort()
      request.current = null
    },
    [],
  )

  async function ask(raw: string) {
    const text = raw.trim().slice(0, 500)
    if (!text || request.current) return
    const localAnswer = findGuideAnswer(text)
    const controller = new AbortController()
    request.current = controller
    setPending(true)
    setSuggestionsOpen(false)
    setMessages((previous) => [...previous, { role: 'you', text }])
    setInput('')
    setStatus('Asking the portfolio AI…')
    const timer = setTimeout(() => controller.abort(), 15_000)
    try {
      const history = messages
        .filter((message) => message.source !== 'intro')
        .slice(-4)
        .map((message) => ({
          role: message.role === 'you' ? 'user' : 'assistant',
          content: message.text.slice(0, 1000),
        }))
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, { role: 'user', content: text }] }),
        signal: controller.signal,
      })
      if (!response.ok) throw new Error('ai_unavailable')
      const result = await response.json()
      if (typeof result.answer !== 'string' || !result.answer.trim())
        throw new Error('invalid_answer')
      if (request.current !== controller) return
      // Only display source URLs already approved in this portfolio.
      const allowedSources = new Set([
        profile.github,
        ...projects.map((project) => `${project.github}#readme`),
      ])
      const sources: Source[] = Array.isArray(result.sources)
        ? result.sources
            .filter(
              (source: Source) =>
                source && typeof source.label === 'string' && allowedSources.has(source.url),
            )
            .slice(0, 3)
        : []
      setMessages((previous) => [
        ...previous,
        { role: 'guide', text: result.answer, source: 'groq', sources, page: localAnswer?.page },
      ])
      setStatus(`Groq AI · grounded in ${profile.firstName}’s public portfolio.`)
    } catch {
      if (request.current !== controller) return
      setMessages((previous) => [
        ...previous,
        {
          role: 'guide',
          source: 'local',
          page: localAnswer?.page,
          text:
            localAnswer?.text ??
            `I can help you explore ${profile.firstName}’s projects, skills, education, and contact links. Try the suggested questions below.`,
        },
      ])
      setStatus('AI unavailable. Showing a local portfolio answer.')
    } finally {
      clearTimeout(timer)
      if (request.current === controller) {
        request.current = null
        setPending(false)
      }
    }
  }

  return (
    <aside
      className={`guide-panel${expanded ? ' is-expanded' : ''}${hasConversation ? ' has-conversation' : ''}`}
      aria-label="Portfolio guide"
    >
      <div className="guide-header">
        <span>
          <Sparkles size={16} /> {assistant.name.toUpperCase()}
        </span>
        <div className="guide-header-actions">
          <button
            className="icon-button"
            aria-label={expanded ? 'Restore guide size' : 'Expand portfolio guide'}
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <button className="icon-button" aria-label="Close portfolio guide" onClick={close}>
            <X size={17} />
          </button>
        </div>
      </div>
      {!hasConversation && (
        <div className="guide-intro">
          <div className="guide-symbol">{assistant.symbol}</div>
          <h2>{assistant.heading}</h2>
          <p>{assistant.intro}</p>
        </div>
      )}
      <div
        className="guide-messages"
        ref={log}
        role="log"
        aria-label="Guide conversation"
        aria-busy={pending}
      >
        {messages
          .filter((message) => !hasConversation || message.source !== 'intro')
          .map((message, index) => (
            <div key={index} className={'guide-message ' + message.role}>
              <small>
                {message.role === 'you'
                  ? 'YOU'
                  : message.source === 'groq'
                    ? 'GROQ AI'
                    : message.source === 'local'
                      ? 'LOCAL GUIDE'
                      : 'THE GUIDE'}
              </small>
              <p>{message.text}</p>
              {!!message.sources?.length && (
                <div className="guide-sources" aria-label="Portfolio sources">
                  {message.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                      {source.label} ↗
                    </a>
                  ))}
                </div>
              )}
              {message.page && (
                <button className="text-button" onClick={() => navigate(message.page!)}>
                  Take me there <ArrowRight size={14} />
                </button>
              )}
            </div>
          ))}
        {pending && <div className="guide-thinking">Finding the right words…</div>}
      </div>
      <div className="guide-controls">
        <p className="guide-state" role="status">
          {status}
        </p>
        {hasConversation && (
          <button
            className="guide-suggestions-toggle"
            aria-expanded={suggestionsOpen}
            aria-controls="guide-suggestions"
            onClick={() => setSuggestionsOpen((value) => !value)}
          >
            Suggested questions{' '}
            {suggestionsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
        <div
          className="guide-suggestions"
          id="guide-suggestions"
          hidden={hasConversation && !suggestionsOpen}
        >
          {assistant.suggestions.map(({ question: text, label }) => (
            <button key={text} aria-label={text} disabled={pending} onClick={() => void ask(text)}>
              {label}
              <ArrowUp size={12} />
            </button>
          ))}
        </div>
        <form
          className="guide-form"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            void ask(input)
          }}
        >
          <input
            aria-label="Ask portfolio guide"
            placeholder={assistant.placeholder}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={500}
          />
          <button
            className="icon-button"
            aria-label="Send question"
            disabled={pending || !input.trim()}
          >
            <ArrowUp size={17} />
          </button>
        </form>
        <div className="guide-disclaimer">AI QUESTIONS ARE SENT TO GROQ WHEN CONNECTED</div>
      </div>
    </aside>
  )
}
