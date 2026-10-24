import { useCallback, useEffect, useRef, type CSSProperties } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { easterEggs, profile } from '../data'
import { Dialog } from './UI'

export function Coffee({ message }: { message: string }) {
  return (
    <div className="terminal-easter-egg coffee-egg">
      <pre className="coffee-cup" aria-hidden="true">
        <span className="coffee-steam">{'  )  )  )'}</span>
        {'\n .-------.\n |       |] \n |       |\n  \\_____/\n  -------'}
      </pre>
      <p>{message}</p>
    </div>
  )
}

export function Hire({ message, onContact }: { message: string; onContact: () => void }) {
  return (
    <div className="terminal-easter-egg hire-egg">
      <p>{message}</p>
      <div className="egg-contact-links">
        {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
        {profile.linkedin && (
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={12} />
          </a>
        )}
        <button onClick={onContact}>
          Open contact.css <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  )
}

export function SecretNote({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title={easterEggs.noteTitle} onClose={onClose} className="secret-note-dialog">
      <div className="secret-note">
        <p className="eyebrow">.hidden / README.md</p>
        <p className="content-lines">{easterEggs.noteMessage}</p>
        {easterEggs.noteFacts.length > 0 && (
          <ul>
            {easterEggs.noteFacts.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        )}
        <p className="secret-signature">— {profile.firstName}</p>
        <button className="outline-button" onClick={onClose}>
          Back to exploring <ArrowUpRight size={15} />
        </button>
      </div>
    </Dialog>
  )
}

const code = '01{}[]<>/0101const_build_repeat_1010function_return_0101'
export function Matrix({ reduced, onClose }: { reduced: boolean; onClose: () => void }) {
  const controls = useRef<HTMLDivElement>(null)
  const finish = useCallback(() => {
    // Restore focus before removing the focused exit button from the DOM.
    if (controls.current?.contains(document.activeElement)) {
      const input = document.getElementById('terminal-input')
      if (input?.getClientRects().length) input.focus()
      else document.getElementById('main-content')?.focus()
    }
    onClose()
  }, [onClose])
  useEffect(() => {
    const timer = window.setTimeout(finish, 10000)
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) finish()
    }
    const hide = () => {
      if (document.hidden) finish()
    }
    window.addEventListener('keydown', escape)
    document.addEventListener('visibilitychange', hide)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', escape)
      document.removeEventListener('visibilitychange', hide)
    }
  }, [finish])
  return (
    <div className={`matrix-overlay${reduced ? ' is-still' : ''}`}>
      <div className="matrix-rain" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span
            className="matrix-column"
            key={index}
            style={
              {
                '--column': index,
                '--fall-time': `${6 + (index % 5)}s`,
                '--fall-delay': `${(index % 7) * -1.3}s`,
              } as CSSProperties
            }
          >
            {code.slice(index) + code.slice(0, index)}
          </span>
        ))}
      </div>
      <div className="matrix-controls" ref={controls}>
        <span role="status">{reduced ? 'Matrix · still mode' : 'Matrix · 10 seconds'}</span>
        <button onClick={finish} aria-label="Exit matrix">
          Exit matrix <X size={14} />
        </button>
      </div>
    </div>
  )
}
