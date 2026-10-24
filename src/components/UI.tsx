import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Dialog({
  title,
  children,
  onClose,
  className = '',
}: {
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const dialog = ref.current!
    dialog.showModal()
    return () => {
      dialog.close()
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault()
        closeRef.current()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRef.current()
      }}
    >
      <div className="dialog-surface">
        <header className="dialog-heading">
          <span>{title}</span>
          <button className="icon-button" aria-label={`Close ${title}`} onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}

export function Cursor({ enabled }: { enabled: boolean }) {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (
      !enabled ||
      !matchMedia('(pointer: fine)').matches ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    let x = -100,
      y = -100,
      fx = -100,
      fy = -100,
      frame = 0
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      document.body.classList.add('custom-cursor')
      const interactive = (e.target as HTMLElement).closest(
        'button,a,input,textarea,summary,[role="tab"]',
      )
      ring.current?.classList.toggle('is-hovering', !!interactive)
      if (ring.current) ring.current.style.opacity = '1'
      if (dot.current) {
        dot.current.style.opacity = '1'
        dot.current.style.transform = `translate3d(${x}px,${y}px,0)`
      }
    }
    const leave = () => {
      if (ring.current) ring.current.style.opacity = '0'
      if (dot.current) dot.current.style.opacity = '0'
      document.body.classList.remove('custom-cursor')
    }
    const animate = () => {
      fx += (x - fx) * 0.18
      fy += (y - fy) * 0.18
      if (ring.current) ring.current.style.transform = `translate3d(${fx}px,${fy}px,0)`
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    window.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
      document.body.classList.remove('custom-cursor')
    }
  }, [enabled])
  return (
    <>
      <div ref={ring} className="square-cursor" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}

export function Typewriter() {
  const words = ['web developer.', 'AI & ML explorer.', 'curious builder.']
  const [word, setWord] = useState(0)
  const [length, setLength] = useState(words[0].length)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const text = words[word]
    const delay = !deleting && length === text.length ? 2300 : deleting ? 45 : 85
    const timer = setTimeout(() => {
      if (!deleting && length === text.length) setDeleting(true)
      else if (deleting && length === 0) {
        setDeleting(false)
        setWord((w) => (w + 1) % words.length)
      } else setLength((l) => l + (deleting ? -1 : 1))
    }, delay)
    return () => clearTimeout(timer)
  }, [word, length, deleting])
  return (
    <span className="typewriter">
      <span className="sr-only">web developer, AI and ML explorer, curious builder</span>
      <span aria-hidden="true">
        {words[word].slice(0, length)}
        <span className="typing-caret">▌</span>
      </span>
    </span>
  )
}

export function HeroArt() {
  return (
    <div
      className="hero-art"
      aria-hidden="true"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--rx', `${(e.clientY - r.y - r.height / 2) / -30}deg`)
        e.currentTarget.style.setProperty('--ry', `${(e.clientX - r.x - r.width / 2) / 30}deg`)
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.setProperty('--rx', '0deg')
        e.currentTarget.style.setProperty('--ry', '0deg')
      }}
    >
      <div className="art-topline">
        <span>IDEA → ITERATE → BUILD</span>
        <span className="art-cross">+</span>
      </div>
      <div className="art-grid" />
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <svg className="art-object" viewBox="0 0 360 350" fill="none">
        <defs>
          <linearGradient id="cube-fill" x1="70" y1="60" x2="270" y2="300">
            <stop stopColor="currentColor" stopOpacity=".14" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".01" />
          </linearGradient>
        </defs>
        <g className="cube-back" stroke="currentColor" strokeWidth=".7" opacity=".24">
          <path d="m180 37 122 70v141l-122 70-122-70V107Z" />
          <path d="m58 107 122 70 122-70M180 177v141" />
        </g>
        <g className="cube-main" stroke="currentColor">
          <path d="m180 75 90 52v104l-90 52-90-52V127Z" fill="url(#cube-fill)" />
          <path d="m90 127 90 52 90-52M180 179v104" />
          <path d="m180 75 0 104M90 231l90-52 90 52" strokeDasharray="3 6" opacity=".45" />
        </g>
        <g
          className="cube-core"
          transform="translate(180 177)"
          stroke="currentColor"
          strokeWidth="5"
        >
          <path d="M0-30v60M-26-15l52 30M-26 15l52-30" />
          <circle r="43" strokeWidth=".5" opacity=".3" />
        </g>
        <circle cx="180" cy="37" r="3" fill="currentColor" />
        <circle cx="302" cy="248" r="3" fill="currentColor" />
        <circle cx="58" cy="248" r="3" fill="currentColor" />
      </svg>
      <div className="code-float code-float-one">
        <span className="code-purple">const</span> curiosity ={' '}
        <span className="code-green">Infinity</span>;<br />
        <span className="code-muted">// keep building.</span>
      </div>
      <div className="code-float code-float-two">
        <span className="pulse-dot" /> imagination.exe <span className="code-muted">running</span>
      </div>
      <div className="art-bottomline">
        <span>01 / ALWAYS IN PROGRESS</span>
        <span>↗</span>
      </div>
    </div>
  )
}
