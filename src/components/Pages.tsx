import { useState } from 'react'
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Code2,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  MapPin,
  Sparkles,
  TerminalSquare,
} from 'lucide-react'
import { profile, projects, skillGroups, type PageId, type Project } from '../data'
import { HeroArt, Typewriter } from './UI'
import ContactForm from './ContactForm'

export function ProjectVisual({ project }: { project: Project }) {
  return project.id === 'tracerisk' ? (
    <div className="project-visual travel-visual" aria-hidden="true">
      <div className="preview-chrome">
        <span className="tiny-logo">↗</span>
        <b>TraceRisk</b>
        <span className="preview-nav">Your next journey, understood.</span>
        <i>✦</i>
      </div>
      <div className="travel-map">
        <svg viewBox="0 0 500 180" fill="none">
          <path
            className="map-line"
            d="M-20 140Q80 50 150 100T300 50T520 85M0 20Q100 120 170 40T350 100T500 40M80 0Q130 80 80 180M330 0Q260 70 350 180"
          />
          <path className="route-line" d="M130 120Q210 10 330 75" />
          <circle cx="130" cy="120" r="6" fill="currentColor" />
          <circle cx="330" cy="75" r="6" fill="currentColor" />
        </svg>
        <span className="map-label label-delhi">New Delhi</span>
        <span className="map-label label-jaipur">Jaipur</span>
        <div className="travel-insight">
          <span className="pulse-dot" /> YOUR TRIP, IN FOCUS <b>Explore with confidence.</b>
          <span>Routes · Weather · Source-linked insights</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="project-visual board-visual" aria-hidden="true">
      <div className="preview-chrome">
        <span className="tiny-logo purple">▦</span>
        <b>Team Board</b>
        <span className="preview-nav">Workspace / Launch day</span>
        <span className="mini-avatars">
          IA <i>+2</i>
        </span>
      </div>
      <div className="mini-board">
        {[
          { name: 'To do', task: 'A fresh perspective', label: 'DESIGN' },
          { name: 'In progress', task: 'Make it feel effortless', label: 'DEVELOPMENT' },
          { name: 'Completed', task: 'Start something good', label: 'PLANNING' },
        ].map((column, i) => (
          <div className="mini-column" key={column.name}>
            <span>
              <i className={`column-dot dot-${i}`} />
              {column.name}
              <b>1</b>
            </span>
            <div className="mini-task">
              <small>{column.label}</small>
              <strong>{column.task}</strong>
              <div className="task-lines" />
              <footer>
                ↳ {i + 2} <i>IA</i>
              </footer>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProjectCard({
  project,
  onSelect,
  compact = false,
}: {
  project: Project
  onSelect: (p: Project) => void
  compact?: boolean
}) {
  return (
    <button
      className={`project-card ${compact ? 'compact' : ''}`}
      onClick={() => onSelect(project)}
    >
      <ProjectVisual project={project} />
      <div className="project-card-body">
        <div className="project-title-row">
          <h3>{project.name}</h3>
          <ArrowUpRight size={20} />
        </div>
        <p>{project.description}</p>
        <div className="project-card-footer">
          <span>{project.type}</span>
          <span>{project.year}</span>
        </div>
      </div>
    </button>
  )
}

export default function Pages({
  page,
  navigate,
  selectProject,
  notify,
}: {
  page: PageId
  navigate: (p: PageId) => void
  selectProject: (p: Project) => void
  notify: (s: string) => void
}) {
  const [filter, setFilter] = useState('All')
  if (page === 'home')
    return (
      <article className="page home-page">
        <div className="page-topnote">
          <span>
            <i className="pulse-dot" /> A WORK IN PROGRESS. JUST LIKE ME.
          </span>
          <span>PORTFOLIO / 2026</span>
        </div>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">// hello, world. i'm</p>
            <h1>
              Irfan<span className="name-dot">.</span>
              <br />
              <span className="outlined-name">Ahmad</span>
            </h1>
            <div className="hero-role">
              A <Typewriter />
            </div>
            <p className="hero-description">
              Turning curiosity into code.
              <br />
              Exploring the space between <strong>the web</strong>,<br className="desktop-br" />{' '}
              <strong>artificial intelligence</strong>, and what comes next.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => navigate('projects')}>
                Explore my work <ArrowUpRight size={17} />
              </button>
              <button className="text-button" onClick={() => navigate('about')}>
                A little about me <ArrowRight size={16} />
              </button>
            </div>
            <div className="hero-location">
              <MapPin size={13} />
              {profile.location}
              <span />
              B.Tech · AI & ML
            </div>
          </div>
          <HeroArt />
        </section>
        <div className="home-divider">
          <span>GOOD THINGS START WITH CURIOSITY</span>
          <button
            className="text-button"
            onClick={() =>
              document.getElementById('selected-work')?.scrollIntoView({
                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'auto'
                  : 'smooth',
              })
            }
          >
            SCROLL TO EXPLORE <ArrowDown size={12} />
          </button>
        </div>
        <section id="selected-work" className="selected-work">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / SELECTED WORK</p>
              <h2>
                Ideas, made real<span className="name-dot">.</span>
              </h2>
            </div>
            <button className="text-button" onClick={() => navigate('projects')}>
              All projects <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="project-grid">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} onSelect={selectProject} compact />
            ))}
          </div>
        </section>
        <div className="home-note">
          <Braces size={22} />
          <p>
            Learning with curiosity.
            <br />
            <strong>Building with purpose.</strong>
          </p>
          <button
            className="circle-button"
            aria-label="Get in touch"
            onClick={() => navigate('contact')}
          >
            <ArrowUpRight size={24} />
          </button>
        </div>
        <PageFooter navigate={navigate} />
      </article>
    )

  if (page === 'about')
    return (
      <article className="page inner-page">
        <PageHeading
          number="02"
          label="THE PERSON BEHIND THE CODE"
          title={
            <>
              Curious by nature.
              <br />
              <em>Builder by choice.</em>
            </>
          }
        />
        <div className="about-grid">
          <div className="about-text">
            <p className="lead">
              Hi, I'm Irfan. I like figuring things out —<br />
              and then building something with what I learn.
            </p>
            <p>{profile.bio}</p>
            <p>
              I'm developing my skills across programming and web development, focusing on the
              fundamentals and putting them to use through hands-on work. Right now, that means
              exploring full-stack development, machine learning, and intelligent applications.
            </p>
            <p>
              There’s a lot I don't know yet.
              <br />
              <strong>That’s the exciting part.</strong>
            </p>
            <div className="link-row">
              <a href={profile.github} target="_blank" rel="noreferrer">
                <Github size={16} /> GitHub <ArrowUpRight size={13} />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <Linkedin size={16} /> LinkedIn <ArrowUpRight size={13} />
              </a>
              <a href="/Irfan-Ahmad-Profile.pdf" download>
                <ArrowDownToLine size={16} /> Profile PDF
              </a>
            </div>
          </div>
          <div className="identity-card">
            <div className="identity-graphic">
              <span className="identity-cross">+</span>
              <span className="monogram">
                ia<span>_</span>
              </span>
              <div className="identity-grid" />
            </div>
            <div className="identity-details">
              <small>THE CURRENT CHAPTER</small>
              <strong>Irfan Ahmad</strong>
              <span>AI & ML student · Developer</span>
              <p>
                <MapPin size={13} /> New Delhi, India
              </p>
            </div>
            <div className="identity-bottom">
              <span>ALWAYS A STUDENT.</span>
              <Sparkles size={16} />
            </div>
          </div>
        </div>
        <div className="values-grid">
          {[
            {
              icon: Code2,
              title: 'Learn by building',
              text: 'Small experiments, real problems, and one useful project at a time.',
            },
            {
              icon: Sparkles,
              title: 'Stay curious',
              text: 'From interfaces to intelligent applications. There is always another why.',
            },
            {
              icon: Globe,
              title: 'Build in the open',
              text: 'Share the process. Learn from others. Make the next thing a little better.',
            },
          ].map((v) => (
            <div className="value-card" key={v.title}>
              <v.icon size={23} />
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
        <PageFooter navigate={navigate} />
      </article>
    )

  if (page === 'projects')
    return (
      <article className="page inner-page">
        <PageHeading
          number="03"
          label="THINGS I'VE BEEN BUILDING"
          title={
            <>
              From “what if”
              <br />
              to <em>“it works.”</em>
            </>
          }
          description="A few ideas I took beyond the notebook. Real projects, practical problems, and plenty of learning along the way."
        />
        <div className="project-filter">
          <div role="group" aria-label="Filter projects">
            {['All', 'Web', 'AI'].map((f) => (
              <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                {f}
                {f === 'All' && <span>02</span>}
              </button>
            ))}
          </div>
          <span>
            {projects.filter((p) => filter === 'All' || p.category === filter).length} PROJECTS
          </span>
        </div>
        <div className="project-grid full-projects">
          {projects
            .filter((p) => filter === 'All' || p.category === filter)
            .map((p) => (
              <ProjectCard key={p.id} project={p} onSelect={selectProject} />
            ))}
        </div>
        <div className="next-project">
          <span>✳</span>
          <div>
            <h3>The next idea is already brewing.</h3>
            <p>Follow the experiments, commits, and occasional detours.</p>
          </div>
          <a
            className="outline-button"
            href={profile.github + '?tab=repositories'}
            target="_blank"
            rel="noreferrer"
          >
            More on GitHub <ArrowUpRight size={16} />
          </a>
        </div>
        <PageFooter navigate={navigate} />
      </article>
    )

  if (page === 'skills')
    return (
      <article className="page inner-page">
        <PageHeading
          number="04"
          label="MY EVER-GROWING TOOLBOX"
          title={
            <>
              A few tools.
              <br />
              <em>Endless possibilities.</em>
            </>
          }
          description="The technologies I use, the fundamentals I'm building, and the things I'm curious about next."
        />
        <div className="skills-grid">
          {skillGroups.map((group, i) => (
            <section className="skill-card" key={group.title}>
              <div className="skill-card-top">
                <span>0{i + 1}</span>
                {i === 0 ? (
                  <Code2 size={25} />
                ) : i === 1 ? (
                  <Braces size={25} />
                ) : (
                  <Sparkles size={25} />
                )}
              </div>
              <h2>{group.title}</h2>
              <p>{group.subtitle}</p>
              <div className="skill-items">
                {group.items.map((item, j) => (
                  <div key={item}>
                    <span className="skill-symbol">{['⌘', '{}', '↗', '◇', '⊞'][j % 5]}</span>
                    {item}
                    {i === 2 ? (
                      <span className="learning-indicator" title="Currently learning">
                        ↗
                      </span>
                    ) : (
                      <span className="skill-check">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="code-block">
          <div>
            <span className="code-muted">// the most useful skill of all</span>
            <br />
            <span className="code-purple">while</span> (curious) {'{'}
            <br />
            &nbsp;&nbsp;learn(); build(); iterate();
            <br />
            {'}'}
          </div>
          <span className="code-block-label">
            NO PROGRESS BARS.
            <br />
            ALWAYS ROOM TO GROW.
          </span>
        </div>
        <PageFooter navigate={navigate} />
      </article>
    )

  if (page === 'journey')
    return (
      <article className="page inner-page">
        <PageHeading
          number="05"
          label="LEARNING IN PUBLIC"
          title={
            <>
              Just getting started.
              <br />
              <em>Going somewhere.</em>
            </>
          }
          description="No inflated job titles. Just a student, a growing collection of projects, and a lot of curiosity."
        />
        <div className="journey-layout">
          <div className="timeline">
            <section>
              <span className="timeline-marker">
                <GraduationCap size={19} />
              </span>
              <div className="timeline-date">THE CURRENT CHAPTER</div>
              <h2>
                B.Tech · Artificial Intelligence
                <br />& Machine Learning
              </h2>
              <p className="timeline-org">
                University School of Automation & Robotics
                <br />
                Guru Gobind Singh Indraprastha University, Delhi
              </p>
              <p>
                First-year student exploring the foundations of software, mathematics, and
                intelligent systems. Taking concepts from the classroom into hands-on projects.
              </p>
              <span className="small-badge">CURRENTLY STUDYING</span>
            </section>
            <section>
              <span className="timeline-marker">
                <Code2 size={19} />
              </span>
              <div className="timeline-date">LEARNING BY DOING</div>
              <h2>From concepts to working projects</h2>
              <p>
                Building TraceRisk and Team Board has been a way to explore APIs, real-time data,
                full-stack architecture, and the details that make software useful.
              </p>
              <button className="text-button" onClick={() => navigate('projects')}>
                See what I've built <ArrowRight size={16} />
              </button>
            </section>
            <section>
              <span className="timeline-marker">
                <Sparkles size={19} />
              </span>
              <div className="timeline-date">WHAT'S NEXT</div>
              <h2>Keep the questions coming.</h2>
              <p>
                Next.js, data structures, machine learning, AI agents, and retrieval-augmented
                generation. Learning the fundamentals and finding practical ways to apply them.
              </p>
            </section>
          </div>
          <aside className="journey-note">
            <span>NOTE TO SELF</span>
            <h3>
              You don't have to
              <br />
              know everything
              <br />
              to <em>start building.</em>
            </h3>
            <div>↗ ONE COMMIT AT A TIME</div>
          </aside>
        </div>
        <PageFooter navigate={navigate} />
      </article>
    )

  if (page === 'contact')
    return (
      <article className="page inner-page contact-page">
        <PageHeading
          number="06"
          label="GOOD THINGS START WITH A CONVERSATION"
          title={
            <>
              Have an idea?
              <br />
              <em>Let's talk.</em>
            </>
          }
          description="A project, a collaboration, a good question — or just a hello. I'm always happy to meet people who like building things."
        />
        <div className="contact-grid">
          <a className="contact-card" href={profile.linkedin} target="_blank" rel="noreferrer">
            <Linkedin size={28} />
            <ArrowUpRight className="contact-arrow" size={23} />
            <small>LET'S CONNECT</small>
            <h2>Find me on LinkedIn</h2>
            <p>Irfan Ahmad</p>
          </a>
          <a className="contact-card" href={profile.github} target="_blank" rel="noreferrer">
            <Github size={28} />
            <ArrowUpRight className="contact-arrow" size={23} />
            <small>FOLLOW THE JOURNEY</small>
            <h2>Find me on GitHub</h2>
            <p>@codeby-irFAN</p>
          </a>
        </div>
        {profile.email && <ContactForm recipient={profile.email} />}
        <div className="contact-bottom">
          <div>
            <MapPin size={16} />
            <span>
              Based in New Delhi, India
              <br />
              <small>Usually somewhere between learning and building.</small>
            </span>
          </div>
          <button
            className="outline-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(profile.github)
                notify('GitHub profile link copied.')
              } catch {
                notify('Copy this link: ' + profile.github)
              }
            }}
          >
            Copy profile link <ArrowUpRight size={16} />
          </button>
        </div>
        <PageFooter navigate={navigate} />
      </article>
    )

  return (
    <article className="page inner-page readme-page">
      <p className="eyebrow"># README.md</p>
      <h1>
        A portfolio with
        <br />
        <em>a little personality.</em>
      </h1>
      <p className="lead">Welcome to my corner of the internet.</p>
      <p>
        I'm {profile.name}, and this is where I share what I'm building and learning. Open a file in
        the explorer to look around, or use the shortcuts below.
      </p>
      <div className="readme-section">
        <h2>## A quick field guide</h2>
        <ul>
          <li>Open a file in the explorer to discover a different part of my story.</li>
          <li>
            Press <kbd>Ctrl / ⌘</kbd> + <kbd>K</kbd> to jump anywhere.
          </li>
          <li>
            Press <kbd>Ctrl</kbd> + <kbd>`</kbd> to toggle the terminal.
          </li>
          <li>
            Try <code>help</code>, <code>whoami</code>, or <code>open projects.js</code> in the
            terminal.
          </li>
          <li>Change the mood with the theme picker in the status bar.</li>
          <li>Ask the portfolio guide about my work, skills, or education.</li>
        </ul>
      </div>
      <div className="readme-section">
        <h2>## About the guide</h2>
        <p>
          The guide answers questions about my background and projects using the information I've
          shared here and in my project documentation. The portfolio guide uses Groq AI when
          connected, with local answers as a fallback. AI questions are sent to Groq; answers can be
          mistaken. The terminal is an interactive portfolio simulation; it does not run system
          commands.
        </p>
      </div>
      <button className="primary-button" onClick={() => navigate('home')}>
        Back to the beginning <ArrowRight size={17} />
      </button>
      <PageFooter navigate={navigate} />
    </article>
  )
}

function PageHeading({
  number,
  label,
  title,
  description,
}: {
  number: string
  label: string
  title: React.ReactNode
  description?: string
}) {
  return (
    <header className="page-heading">
      <p className="eyebrow">
        {number} / {label}
      </p>
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </header>
  )
}
function PageFooter({ navigate }: { navigate: (p: PageId) => void }) {
  return (
    <footer className="page-footer">
      <span>© {new Date().getFullYear()} IRFAN AHMAD</span>
      <button onClick={() => navigate('readme')}>
        BUILT WITH CURIOSITY <TerminalSquare size={13} />
      </button>
    </footer>
  )
}
