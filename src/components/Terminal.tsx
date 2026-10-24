import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { files, profile, type PageId } from '../data'

type Line = { text: string; kind: 'output' | 'command' | 'error' }
export default function Terminal({
  visible,
  navigate,
  onClose,
  expanded,
  setExpanded,
}: {
  visible: boolean
  navigate: (p: PageId) => void
  onClose: () => void
  expanded: boolean
  setExpanded: (v: boolean) => void
}) {
  const [lines, setLines] = useState<Line[]>([
    {
      text: "Welcome to my little corner of the terminal. Type 'help' to explore.",
      kind: 'output',
    },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [cwd, setCwd] = useState('~/portfolio')
  const [tab, setTab] = useState('terminal')
  const scroll = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight
  }, [lines, visible])
  function run(e: FormEvent) {
    e.preventDefault()
    const raw = input.trim()
    if (!raw) return
    setInput('')
    setHistory((h) => [...h, raw])
    setHistoryIndex(-1)
    const [command, ...rest] = raw.split(/\s+/)
    const arg = rest.join(' ')
    let output = '',
      error = false
    switch (command.toLowerCase()) {
      case 'help':
        output =
          'Explore: ls · pwd · cd src · cd .. · cat <file> · open <file>\nDiscover: whoami · projects · skills · contact · github\nOther: echo <text> · date · history · clear\nTip: ↑ / ↓ recall commands. Tab completes file names. This is a portfolio terminal, not a system shell.'
        break
      case 'ls':
        output = files.map((f) => f.name).join('   ')
        break
      case 'pwd':
        output = cwd.replace('~', '/home/irfan')
        break
      case 'cd':
        if (['src', 'data', 'styles'].includes(arg)) {
          setCwd('~/portfolio/' + arg)
          output = ''
        } else if (arg === '..' || arg === '~' || arg === '/' || arg === '') setCwd('~/portfolio')
        else {
          output = 'Directory not found. Try src, data, styles, or ..'
          error = true
        }
        break
      case 'cat':
      case 'open': {
        const target = files.find(
          (f) => f.name.toLowerCase() === arg.split('/').pop()?.toLowerCase() || f.id === arg,
        )
        if (target) {
          navigate(target.id)
          output = 'Opened ' + target.name
        } else {
          output = 'File not found. Type ls to see the portfolio files.'
          error = true
        }
        break
      }
      case 'whoami':
        output = profile.name + ' — ' + profile.role + '\n' + profile.bio
        break
      case 'projects':
        navigate('projects')
        output = 'TraceRisk · Team Board'
        break
      case 'skills':
        navigate('skills')
        output = 'JavaScript · Python · C · React · HTML · CSS · Git'
        break
      case 'contact':
        navigate('contact')
        output = profile.linkedin
        break
      case 'github':
        output = profile.github
        break
      case 'echo':
        output = arg
        break
      case 'date':
        output = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }) + ' IST'
        break
      case 'history':
        output = history
          .concat(raw)
          .map((h, i) => `${i + 1}  ${h}`)
          .join('\n')
        break
      case 'clear':
        setLines([])
        return
      default:
        output = `Command not found: ${command}. Type help for available commands.`
        error = true
    }
    setLines((l) =>
      [
        ...l,
        { text: `irfan ${cwd} $ ${raw}`, kind: 'command' as const },
        ...(output
          ? [{ text: output, kind: error ? ('error' as const) : ('output' as const) }]
          : []),
      ].slice(-160),
    )
  }
  return (
    <section
      className={`terminal-panel ${expanded ? 'expanded' : ''}`}
      hidden={!visible}
      aria-label="Portfolio terminal"
    >
      <div className="terminal-header">
        <div className="terminal-tabs">
          <button className={tab === 'terminal' ? 'active' : ''} onClick={() => setTab('terminal')}>
            TERMINAL
          </button>
          <button className={tab === 'output' ? 'active' : ''} onClick={() => setTab('output')}>
            OUTPUT
          </button>
          <span>portfolio — interactive</span>
        </div>
        <div className="terminal-controls">
          <button
            className="icon-button"
            aria-label={expanded ? 'Shrink terminal' : 'Expand terminal'}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
          <button className="icon-button" aria-label="Close terminal" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
      </div>
      {tab === 'terminal' ? (
        <div className="terminal-body" ref={scroll}>
          <div role="log" aria-label="Terminal output">
            {lines.map((l, i) => (
              <div key={i} className={'terminal-line ' + l.kind}>
                {l.text}
              </div>
            ))}
          </div>
          <form onSubmit={run} className="terminal-prompt">
            <label htmlFor="terminal-input">
              <span>irfan</span> {cwd} <b>❯</b>
            </label>
            <input
              id="terminal-input"
              aria-label="Terminal command"
              value={input}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  const i = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1)
                  setHistoryIndex(i)
                  setInput(history[i] ?? '')
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  const i = historyIndex < 0 ? history.length : historyIndex + 1
                  setHistoryIndex(i >= history.length ? -1 : i)
                  setInput(history[i] ?? '')
                }
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const parts = input.split(' ')
                  if (parts.length === 2 && ['open', 'cat'].includes(parts[0])) {
                    const match = files.find((f) => f.name.startsWith(parts[1]))
                    if (match) setInput(parts[0] + ' ' + match.name)
                  }
                }
              }}
            />
          </form>
        </div>
      ) : (
        <div className="terminal-body">
          <div className="terminal-line">
            Portfolio loaded. Navigate with the explorer, tabs, or command palette.
          </div>
          <div className="terminal-line">Personal information: github.com/codeby-irFAN</div>
        </div>
      )}
    </section>
  )
}
