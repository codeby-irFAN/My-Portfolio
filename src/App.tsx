import { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Atom,
  Bell,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Command,
  Files,
  Folder,
  GitBranch,
  Github,
  HelpCircle,
  Menu,
  MoreHorizontal,
  PanelBottom,
  PanelLeft,
  Palette,
  Search,
  Settings,
  Sparkles,
  TerminalSquare,
  X,
} from 'lucide-react'
import Pages from './components/Pages'
import { Cursor, Dialog } from './components/UI'
import Terminal from './components/Terminal'
import Guide from './components/Guide'
import {
  files,
  profile,
  projects,
  themes,
  site,
  appearance,
  type PageId,
  type Project,
} from './data'

const MOBILE_LAYOUT = '(max-width: 760px), (max-width: 950px) and (pointer: coarse)'

function stored(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}
function initialPage(): PageId {
  return files.find((f) => f.id === location.hash.slice(1))?.id ?? 'home'
}

export default function App() {
  const [page, setPage] = useState<PageId>(initialPage)
  const [tabs, setTabs] = useState<PageId[]>(() =>
    Array.from(new Set<PageId>(['home', 'about', 'projects', initialPage()])),
  )
  const [sidebar, setSidebar] = useState(() => !matchMedia(MOBILE_LAYOUT).matches)
  const [terminal, setTerminal] = useState(false)
  const [terminalExpanded, setTerminalExpanded] = useState(false)
  const [guide, setGuide] = useState(false)
  const [theme, setTheme] = useState(() => {
    const t = stored('irfan-theme', appearance.defaultTheme)
    return themes.some((x) => x.id === t) ? t : appearance.defaultTheme
  })
  const [cursor, setCursor] = useState(() => stored('irfan-cursor', 'true') === 'true')
  const [modal, setModal] = useState<'palette' | 'themes' | 'settings' | 'source' | 'help' | null>(
    null,
  )
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [query, setQuery] = useState('')
  const [commandIndex, setCommandIndex] = useState(0)
  const [toast, setToast] = useState('')
  const [folderOpen, setFolderOpen] = useState(true)
  const [menu, setMenu] = useState<string | null>(null)
  const [clock, setClock] = useState('')
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const scroll = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const tabStrip = useRef<HTMLElement>(null)
  const lenis = useRef<Lenis | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const current = files.find((f) => f.id === page)!
  const notify = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 4000)
  }, [])
  const navigate = useCallback((id: PageId) => {
    setPage(id)
    setTabs((t) => (t.includes(id) ? t : [...t, id]))
    setMenu(null)
    if (location.hash !== '#' + id) location.hash = id
    if (matchMedia(MOBILE_LAYOUT).matches) setSidebar(false)
  }, [])
  function toggleExplorer() {
    setSidebar((open) => !open)
    if (matchMedia(MOBILE_LAYOUT).matches) setGuide(false)
  }
  function toggleGuide() {
    setGuide((open) => !open)
    if (matchMedia(MOBILE_LAYOUT).matches) setSidebar(false)
  }
  useEffect(() => {
    const viewport = window.visualViewport
    const resize = () => {
      // Follow the visible space when a phone keyboard opens; preserve pinch zoom.
      if (!viewport || viewport.scale === 1) {
        const height = viewport?.height ?? window.innerHeight
        document.documentElement.style.setProperty('--app-height', `${height}px`)
        document.documentElement.toggleAttribute('data-short-viewport', height < 420)
      }
    }
    resize()
    viewport?.addEventListener('resize', resize)
    window.addEventListener('resize', resize)
    return () => {
      viewport?.removeEventListener('resize', resize)
      window.removeEventListener('resize', resize)
      document.documentElement.style.removeProperty('--app-height')
      document.documentElement.removeAttribute('data-short-viewport')
    }
  }, [])
  useEffect(() => {
    const strip = tabStrip.current
    if (!strip) return
    const revealActiveTab = () => {
      const active = strip.querySelector<HTMLElement>('.editor-tab.active')
      if (!active) return
      const bounds = strip.getBoundingClientRect()
      const tab = active.getBoundingClientRect()
      if (tab.left < bounds.left) strip.scrollLeft -= bounds.left - tab.left
      else if (tab.right > bounds.right) strip.scrollLeft += tab.right - bounds.right
    }
    revealActiveTab()
    const observer = new ResizeObserver(revealActiveTab)
    observer.observe(strip)
    return () => observer.disconnect()
  }, [page, tabs.length])
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!scroll.current || !content.current || reduced) return
    const instance = new Lenis({
      wrapper: scroll.current,
      content: content.current,
      autoRaf: true,
      lerp: 0.12,
      smoothWheel: true,
      anchors: true,
    })
    lenis.current = instance
    return () => {
      instance.destroy()
      lenis.current = null
    }
  }, [reduced])
  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true })
    if (scroll.current) scroll.current.scrollTop = 0
  }, [page])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
      )
    try {
      localStorage.setItem('irfan-theme', theme)
      localStorage.setItem('irfan-cursor', String(cursor))
    } catch {
      /* Storage may be unavailable in private mode. */
    }
  }, [theme, cursor])
  useEffect(() => {
    document.title =
      page === 'home' ? site.title : `${page[0].toUpperCase() + page.slice(1)} — ${site.title}`
    document.querySelector('meta[name="description"]')?.setAttribute('content', site.description)
    document.querySelector('link[rel="icon"]')?.setAttribute('href', appearance.favicon)
    document.documentElement.style.setProperty('--cursor-dot-size', `${appearance.cursorSize}px`)
  }, [page])
  useEffect(() => {
    const update = () => {
      const id = initialPage()
      setPage(id)
      setTabs((t) => (t.includes(id) ? t : [...t, id]))
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    const update = () =>
      setClock(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date()),
      )
    update()
    const timer = setInterval(update, 30000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).matches('input,textarea,[contenteditable="true"]')
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setModal((m) => (m === 'palette' ? null : 'palette'))
        setQuery('')
        setCommandIndex(0)
        setMenu(null)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        setTerminal((t) => !t)
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleExplorer()
      }
      if (e.key === 'Escape') {
        setMenu(null)
        if (matchMedia(MOBILE_LAYOUT).matches && !document.querySelector('dialog[open]')) {
          setSidebar(false)
          setGuide(false)
        }
      }
      if (e.key === '/' && !typing && !document.querySelector('dialog[open]')) {
        e.preventDefault()
        setModal('palette')
        setQuery('')
        setCommandIndex(0)
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])
  function closeTab(id: PageId) {
    const remaining = tabs.filter((t) => t !== id)
    if (!remaining.length) {
      setTabs(['home'])
      navigate('home')
      return
    }
    setTabs(remaining)
    if (page === id) navigate(remaining[Math.max(0, tabs.indexOf(id) - 1)] ?? remaining[0])
  }
  function palette() {
    setQuery('')
    setCommandIndex(0)
    setModal('palette')
    setMenu(null)
    if (matchMedia(MOBILE_LAYOUT).matches) setSidebar(false)
  }
  const commands = [
    ...files.map((f) => ({
      label: f.name,
      detail: 'Open ' + f.id,
      icon: <FileIcon id={f.id} />,
      run: () => navigate(f.id),
    })),
    {
      label: 'Open settings',
      detail: 'Cursor, appearance, and keyboard shortcuts',
      icon: <Settings size={16} />,
      run: () => setModal('settings'),
    },
    {
      label: 'Change color theme',
      detail: 'Personalize your workspace',
      icon: <Palette size={16} />,
      run: () => setModal('themes'),
    },
    {
      label: 'Toggle terminal',
      detail: 'Ctrl / ⌘ + `',
      icon: <TerminalSquare size={16} />,
      run: () => setTerminal((t) => !t),
    },
    {
      label: 'Ask the portfolio guide',
      detail: `Get to know ${profile.firstName}`,
      icon: <Sparkles size={16} />,
      run: toggleGuide,
    },
    {
      label: 'Download profile PDF',
      detail: 'Education, projects & skills',
      icon: <ArrowDownToLine size={16} />,
      run: () => {
        const a = document.createElement('a')
        a.href = profile.resumeUrl
        a.download = profile.resumeUrl.split('/').pop()!
        a.click()
      },
    },
  ].filter((c) => (c.label + ' ' + c.detail).toLowerCase().includes(query.toLowerCase()))
  function executeCommand(index: number) {
    const command = commands[index]
    if (!command) return
    setModal(null)
    command.run()
  }
  const menuItems =
    menu === 'File'
      ? [
          { label: 'Open a file…', run: palette },
          {
            label: 'Download profile',
            run: () => {
              const a = document.createElement('a')
              a.href = profile.resumeUrl
              a.download = profile.resumeUrl.split('/').pop()!
              a.click()
              setMenu(null)
            },
          },
        ]
      : menu === 'View'
        ? [
            { label: 'Toggle explorer', run: toggleExplorer },
            { label: 'Toggle terminal', run: () => setTerminal((t) => !t) },
            { label: 'Color theme…', run: () => setModal('themes') },
            { label: 'Portfolio guide', run: toggleGuide },
          ]
        : [
            { label: 'Keyboard shortcuts', run: () => setModal('help') },
            { label: 'About this portfolio', run: () => navigate('readme') },
          ]

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to content
      </a>
      <header className="titlebar">
        <button className="brand-button" aria-label="Go home" onClick={() => navigate('home')}>
          {appearance.logo ? <img src={appearance.logo} alt="" /> : <Code2 size={22} />}
        </button>
        <div className="desktop-menus">
          {['File', 'View', 'Help'].map((label) => (
            <div className="menu-wrap" key={label}>
              <button
                className={menu === label ? 'is-open' : ''}
                aria-expanded={menu === label}
                onClick={() => setMenu(menu === label ? null : label)}
              >
                {label}
              </button>
              {menu === label && (
                <>
                  <button
                    className="menu-dismiss"
                    aria-label="Dismiss menu"
                    onClick={() => setMenu(null)}
                  />
                  <div className="menu-dropdown">
                    {menuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setMenu(null)
                          item.run()
                        }}
                      >
                        {item.label}
                        <ArrowRight size={13} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <button className="title-search" onClick={palette}>
          <Search size={13} />
          <span>{profile.handle} — portfolio</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="title-actions">
          <button
            className="icon-button"
            aria-label="Toggle explorer"
            aria-expanded={sidebar}
            onClick={toggleExplorer}
          >
            <PanelLeft size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Toggle terminal"
            aria-expanded={terminal}
            onClick={() => setTerminal((t) => !t)}
          >
            <PanelBottom size={16} />
          </button>
          <div className="window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </header>
      <div className="workspace">
        <nav className="activity-bar" aria-label="Workspace tools">
          <div>
            <button
              className={sidebar ? 'active' : ''}
              aria-label="Explorer"
              onClick={toggleExplorer}
            >
              <Files size={22} />
            </button>
            <button aria-label="Search files and commands" onClick={palette}>
              <Search size={22} />
            </button>
            <button aria-label="Source repositories" onClick={() => setModal('source')}>
              <GitBranch size={22} />
            </button>
            <button
              className={guide ? 'active' : ''}
              aria-label="Open portfolio guide"
              onClick={toggleGuide}
            >
              <Sparkles size={22} />
            </button>
          </div>
          <div>
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                aria-label={`${profile.firstName} on GitHub`}
              >
                <Github size={21} />
              </a>
            )}
            <button aria-label="Settings" onClick={() => setModal('settings')}>
              <Settings size={22} />
            </button>
          </div>
        </nav>
        {sidebar && (
          <>
            <button
              className="sidebar-scrim"
              aria-label="Dismiss explorer"
              onClick={() => setSidebar(false)}
            />
            <aside className="explorer" id="file-explorer" aria-label="File explorer">
              <div className="explorer-heading">
                EXPLORER
                <div className="explorer-header-actions">
                  <button className="icon-button" aria-label="Explorer actions" onClick={palette}>
                    <MoreHorizontal size={18} />
                  </button>
                  <button
                    className="icon-button explorer-close"
                    aria-label="Close explorer"
                    onClick={() => setSidebar(false)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="explorer-scroll">
                <button
                  className="folder-heading"
                  aria-expanded={folderOpen}
                  onClick={() => setFolderOpen((s) => !s)}
                >
                  {folderOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}{' '}
                  {profile.name.toUpperCase().replace(/\s+/g, '-')}
                  <span>✦</span>
                </button>
                {folderOpen && (
                  <div className="explorer-files">
                    <div className="folder-label">
                      <ChevronDown size={13} />
                      <Folder size={14} /> portfolio
                    </div>
                    {files.map((f) => (
                      <button
                        key={f.id}
                        className={'file-row ' + (page === f.id ? 'selected' : '')}
                        onClick={() => navigate(f.id)}
                      >
                        <span className="tree-branch" />
                        <FileIcon id={f.id} />
                        <span>{f.name}</span>
                        {page === f.id && <i className="file-active-dot" />}
                      </button>
                    ))}
                  </div>
                )}
                <button className="guide-invite" onClick={toggleGuide}>
                  <Sparkles size={17} />
                  <span>
                    Ask about {profile.firstName}
                    <small>A little help exploring.</small>
                  </span>
                  <ArrowUpRight size={13} />
                </button>
                <div className="explorer-bottom">
                  <div className="explorer-status">
                    <span className="pulse-dot" /> LEARNING. BUILDING. REPEATING.
                  </div>
                  <div className="outline-section">
                    <span>OUTLINE</span>
                    <ChevronDown size={12} />
                  </div>
                  <button onClick={() => navigate('about')}>
                    <Braces size={12} /> A little about me
                  </button>
                  <button onClick={() => navigate('projects')}>
                    <Braces size={12} /> Selected work
                  </button>
                  <button onClick={() => navigate('contact')}>
                    <Braces size={12} /> Let's connect
                  </button>
                  <div className="sidebar-signature">
                    {profile.initials}
                    <span>_</span>
                    <small>MADE OF CURIOSITY.</small>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}
        <div className="editor-area">
          <div className="mobile-toolbar">
            <button
              className="icon-button"
              aria-label="Open mobile explorer"
              aria-expanded={sidebar}
              aria-controls="file-explorer"
              onClick={toggleExplorer}
            >
              <Menu size={19} />
            </button>
            <span>{profile.firstName.toUpperCase()}'S PORTFOLIO</span>
            <button className="icon-button" aria-label="Mobile command palette" onClick={palette}>
              <Search size={18} />
            </button>
          </div>
          <nav className="editor-tabs" aria-label="Open portfolio pages" ref={tabStrip}>
            {tabs.map((id, index) => {
              const f = files.find((x) => x.id === id)!
              return (
                <div className={'editor-tab ' + (page === id ? 'active' : '')} key={id}>
                  <button
                    aria-current={page === id ? 'page' : undefined}
                    aria-controls="portfolio-page"
                    id={'tab-' + id}
                    tabIndex={page === id ? 0 : -1}
                    onClick={() => navigate(id)}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'ArrowRight' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'Home' ||
                        e.key === 'End'
                      ) {
                        e.preventDefault()
                        const i =
                          e.key === 'Home'
                            ? 0
                            : e.key === 'End'
                              ? tabs.length - 1
                              : (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) %
                                tabs.length
                        navigate(tabs[i])
                        document.getElementById('tab-' + tabs[i])?.focus()
                      }
                    }}
                  >
                    <FileIcon id={id} />
                    <span className="tab-label">{f.name}</span>
                    {page === id && <span className="tab-unsaved" aria-hidden="true" />}
                  </button>
                  <button
                    className="tab-close"
                    aria-label={'Close ' + f.name}
                    onClick={() => closeTab(id)}
                  >
                    <X size={12} />
                  </button>
                </div>
              )
            })}
            <div className="tabs-right">
              <button className="icon-button" aria-label="Open a file" onClick={palette}>
                <MoreHorizontal size={17} />
              </button>
            </div>
          </nav>
          <div className="breadcrumbs">
            <span>portfolio</span>
            <ChevronRight size={11} />
            {current.folder && (
              <>
                <span>{current.folder}</span>
                <ChevronRight size={11} />
              </>
            )}
            <FileIcon id={page} />
            <span>{current.name}</span>
            <span className="breadcrumb-right">
              <span className="pulse-dot" /> made with intention
            </span>
          </div>
          <main
            className="editor-scroll"
            id="main-content"
            aria-labelledby={'tab-' + page}
            tabIndex={-1}
            ref={scroll}
          >
            <div ref={content} className="editor-content">
              <div
                className="view-transition"
                id="portfolio-page"
                aria-labelledby={'tab-' + page}
                key={page}
              >
                <Pages
                  page={page}
                  navigate={navigate}
                  selectProject={setSelectedProject}
                  notify={notify}
                />
              </div>
            </div>
          </main>
          <Terminal
            visible={terminal}
            navigate={navigate}
            onClose={() => setTerminal(false)}
            expanded={terminalExpanded}
            setExpanded={setTerminalExpanded}
          />
        </div>
        {guide && <Guide navigate={navigate} close={() => setGuide(false)} />}
      </div>
      <footer className="statusbar">
        <div>
          <button
            className="remote-status"
            aria-label="About this portfolio"
            onClick={() => navigate('readme')}
          >
            <Code2 size={14} />
          </button>
          <button aria-label="View source repositories" onClick={() => setModal('source')}>
            <GitBranch size={12} /> main
          </button>
          <span className="status-desktop">
            <Check size={12} /> portfolio online
          </span>
        </div>
        <div>
          <span className="status-location">{clock} · NEW DELHI</span>
          <button className="status-desktop" onClick={() => setTerminal((t) => !t)}>
            <TerminalSquare size={12} /> Terminal
          </button>
          <button onClick={() => setModal('themes')} aria-label="Choose color theme">
            <Palette size={12} />
            {themes.find((t) => t.id === theme)?.name}
          </button>
          <span className="status-desktop">UTF-8</span>
          <button aria-label="Keyboard shortcuts" onClick={() => setModal('help')}>
            <Bell size={12} />
          </button>
        </div>
      </footer>
      {modal === 'palette' && (
        <Dialog title="Go anywhere" onClose={() => setModal(null)} className="command-dialog">
          <div className="command-input">
            <Search size={19} />
            <input
              autoFocus
              aria-label="Search files and commands"
              placeholder="Search files, commands, little possibilities…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setCommandIndex(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setCommandIndex((i) => (i + 1) % Math.max(1, commands.length))
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setCommandIndex((i) => (i - 1 + commands.length) % Math.max(1, commands.length))
                }
                if (e.key === 'Enter') {
                  e.preventDefault()
                  executeCommand(commandIndex)
                }
              }}
            />
            <kbd>ESC</kbd>
          </div>
          <div className="command-label">FILES & COMMANDS</div>
          <div className="command-results">
            {commands.map((c, i) => (
              <button
                key={c.label}
                className={i === commandIndex ? 'active' : ''}
                onPointerMove={() => setCommandIndex(i)}
                onClick={() => executeCommand(i)}
              >
                {c.icon}
                <span>
                  {c.label}
                  <small>{c.detail}</small>
                </span>
                <ArrowRight size={15} />
              </button>
            ))}
            {!commands.length && (
              <p className="no-results">No matches. Try “projects”, “theme”, or “terminal”.</p>
            )}
          </div>
          <div className="command-footer">
            <span>↑ ↓ to navigate</span>
            <span>↵ to open</span>
            <Command size={13} />
          </div>
        </Dialog>
      )}
      {modal === 'themes' && (
        <Dialog title="Change the atmosphere" onClose={() => setModal(null)}>
          <p className="dialog-description">Same little universe. A different mood.</p>
          <div className="theme-options">
            {themes.map((t) => (
              <button
                key={t.id}
                className={theme === t.id ? 'selected' : ''}
                onClick={() => {
                  setTheme(t.id)
                  setModal(null)
                }}
              >
                <i style={{ background: t.color }} />
                <span>{t.name}</span>
                {theme === t.id && <Check size={16} />}
              </button>
            ))}
          </div>
        </Dialog>
      )}
      {modal === 'settings' && (
        <Dialog title="Make yourself at home" onClose={() => setModal(null)}>
          <div className="settings-row">
            <div>
              <strong>Square cursor</strong>
              <p>A little personality for your pointer.</p>
            </div>
            <button
              className={'toggle ' + (cursor ? 'on' : '')}
              role="switch"
              aria-checked={cursor}
              aria-label="Square cursor"
              onClick={() => setCursor((c) => !c)}
            >
              <span />
            </button>
          </div>
          <div className="settings-row">
            <div>
              <strong>Color theme</strong>
              <p>{themes.find((t) => t.id === theme)?.name}</p>
            </div>
            <button className="outline-button" onClick={() => setModal('themes')}>
              <Palette size={15} /> Change
            </button>
          </div>
          <div className="settings-row">
            <div>
              <strong>Motion</strong>
              <p>
                {reduced
                  ? 'Reduced motion follows your device setting.'
                  : 'Smooth motion enabled. Your device’s reduced-motion preference is respected.'}
              </p>
            </div>
          </div>
          <button className="text-button settings-help" onClick={() => setModal('help')}>
            <HelpCircle size={15} /> Keyboard shortcuts <ArrowRight size={15} />
          </button>
        </Dialog>
      )}
      {modal === 'help' && (
        <Dialog title="A few handy shortcuts" onClose={() => setModal(null)}>
          <div className="shortcut-list">
            {[
              ['Command palette', 'Ctrl / ⌘ + K'],
              ['Toggle terminal', 'Ctrl / ⌘ + `'],
              ['Toggle explorer', 'Ctrl / ⌘ + B'],
              ['Quick search', '/'],
              ['Close dialog', 'Esc'],
              ['Move between tabs', '← / →'],
            ].map(([label, key]) => (
              <div key={label}>
                <span>{label}</span>
                <kbd>{key}</kbd>
              </div>
            ))}
          </div>
        </Dialog>
      )}
      {modal === 'source' && (
        <Dialog title="Built in the open" onClose={() => setModal(null)}>
          <p className="dialog-description">The ideas, experiments, and code behind the work.</p>
          <div className="source-links">
            {[
              { name: 'This portfolio', url: site.repository },
              ...projects.map((p) => ({ name: p.name, url: p.github })),
            ]
              .filter((p) => p.url)
              .map((p) => (
                <a href={p.url} key={p.name} target="_blank" rel="noreferrer">
                  <Github size={19} />
                  <span>
                    {p.name}
                    <small>{p.url.split('/').slice(-2).join(' / ')}</small>
                  </span>
                  <ArrowUpRight size={17} />
                </a>
              ))}
          </div>
        </Dialog>
      )}
      {selectedProject && (
        <Dialog
          title={selectedProject.name}
          onClose={() => setSelectedProject(null)}
          className="project-dialog"
        >
          <div className="project-modal-body">
            <span className="eyebrow">
              {selectedProject.type} / {selectedProject.year}
            </span>
            <h2>{selectedProject.tagline}</h2>
            <p>{selectedProject.detail}</p>
            <div className="tag-list">
              {selectedProject.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <h3>Under the hood</h3>
            <ul>
              {selectedProject.features.map((f) => (
                <li key={f}>
                  <Check size={14} />
                  {f}
                </li>
              ))}
            </ul>
            <div className="project-modal-links">
              {selectedProject.live && (
                <a
                  className="primary-button"
                  href={selectedProject.live}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore live project <ArrowUpRight size={17} />
                </a>
              )}
              {selectedProject.github && (
                <a
                  className="outline-button"
                  href={selectedProject.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github size={16} /> Source code
                </a>
              )}
            </div>
            <small className="project-host-note">
              Hosted independently. First load may take a moment.
            </small>
          </div>
        </Dialog>
      )}
      <div className={'toast ' + (toast ? 'visible' : '')} role="status">
        {toast && (
          <>
            <Check size={16} />
            {toast}
          </>
        )}
      </div>
      <Cursor enabled={cursor} />
    </div>
  )
}
export function FileIcon({ id }: { id: PageId }) {
  const f = files.find((x) => x.id === id)!
  return (
    <span className={'file-icon file-icon-' + id} style={{ color: f.color }} aria-hidden="true">
      {id === 'home' ? <Atom size={16} /> : f.icon}
    </span>
  )
}
