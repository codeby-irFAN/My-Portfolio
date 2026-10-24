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
import {
  copy,
  site,
  profile,
  projects,
  skillGroups,
  education,
  home,
  about,
  journey,
  featuredProjects,
  projectCategories,
  type PageId,
  type Project,
} from '../data'
import { HeroArt, Typewriter } from './UI'
import ContactForm from './ContactForm'

export function ProjectVisual({ project }: { project: Project }) {
  if (project.image || !['travel', 'board'].includes(project.preview))
    return (
      <div className="project-visual project-auto-visual" aria-hidden="true">
        <div className="project-auto-copy">
          <span>{project.type}</span>
          <strong>{project.name}</strong>
          <p>{project.tagline}</p>
          <small>{project.tags.join(' · ')}</small>
        </div>
        {project.image && (
          <img
            src={project.image}
            alt=""
            loading="lazy"
            onError={(event) => {
              event.currentTarget.hidden = true
            }}
          />
        )}
      </div>
    )
  return project.preview === 'travel' ? (
    <div className="project-visual travel-visual" aria-hidden="true">
      <div className="preview-chrome">
        <span className="tiny-logo">↗</span>
        <b>{project.name}</b>
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
        <b>{project.name}</b>
        <span className="preview-nav">Workspace / Launch day</span>
        <span className="mini-avatars">
          {profile.initials.toUpperCase()} <i>+2</i>
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
                ↳ {i + 2} <i>{profile.initials.toUpperCase()}</i>
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
            <i className="pulse-dot" /> {copy.home.topNote}
          </span>
          <span>PORTFOLIO / {new Date().getFullYear()}</span>
        </div>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">{copy.home.greeting}</p>
            <h1>
              {profile.firstName}
              <span className="name-dot">.</span>
              <br />
              <span className="outlined-name">{profile.lastName}</span>
            </h1>
            <div className="hero-role">
              <Typewriter />
            </div>
            <p className="hero-description content-lines">{home.intro}</p>
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
              {education.degree} · {education.subject}
            </div>
          </div>
          <HeroArt />
        </section>
        <div className="home-divider">
          <span>{copy.home.divider}</span>
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
              <p className="eyebrow">01 / {copy.home.selectedLabel}</p>
              <h2>
                {copy.home.selectedTitle}
                <span className="name-dot">.</span>
              </h2>
            </div>
            <button className="text-button" onClick={() => navigate('projects')}>
              All projects <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="project-grid">
            {featuredProjects.map((p) => (
              <ProjectCard key={p.id} project={p} onSelect={selectProject} compact />
            ))}
          </div>
        </section>
        <div className="home-note">
          <Braces size={22} />
          <p>{profile.tagline}</p>
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
          label={copy.about.label}
          title={
            <>
              {copy.about.title}
              <br />
              <em>{copy.about.subtitle}</em>
            </>
          }
        />
        <div className="about-grid">
          <div className="about-text">
            <p className="lead content-lines">{about.lead}</p>
            <p>{profile.bio}</p>
            {about.paragraphs.map((paragraph, index) => (
              <p className="content-lines" key={index}>
                {paragraph}
              </p>
            ))}
            <div className="link-row">
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noreferrer">
                  <Github size={16} /> GitHub <ArrowUpRight size={13} />
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin size={16} /> LinkedIn <ArrowUpRight size={13} />
                </a>
              )}
              <a href={profile.resumeUrl} download>
                <ArrowDownToLine size={16} /> Profile PDF
              </a>
            </div>
          </div>
          <div className="identity-card">
            <div className="identity-graphic">
              <span className="identity-cross">+</span>
              <span className="monogram">
                {profile.initials}
                <span>_</span>
              </span>
              <div className="identity-grid" />
            </div>
            <div className="identity-details">
              <small>{copy.about.identityCaption}</small>
              <strong>{profile.name}</strong>
              <span>{profile.role}</span>
              <p>
                <MapPin size={13} /> {profile.location}
              </p>
            </div>
            <div className="identity-bottom">
              <span>{copy.about.identityFooter}</span>
              <Sparkles size={16} />
            </div>
          </div>
        </div>
        <div className="values-grid">
          {about.values.map((value, index) => {
            const Icon = [Code2, Sparkles, Globe][index % 3]
            return (
              <div className="value-card" key={value.title}>
                <Icon size={23} />
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            )
          })}
        </div>
        <PageFooter navigate={navigate} />
      </article>
    )

  if (page === 'projects')
    return (
      <article className="page inner-page">
        <PageHeading
          number="03"
          label={copy.projects.label}
          title={
            <>
              {copy.projects.title}
              <br />
              <em>{copy.projects.subtitle}</em>
            </>
          }
          description={copy.projects.description}
        />
        <div className="project-filter">
          <div role="group" aria-label="Filter projects">
            {projectCategories.map((f) => (
              <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                {f}
                {f === 'All' && <span>{String(projects.length).padStart(2, '0')}</span>}
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
            <h3>{copy.projects.nextTitle}</h3>
            <p>{copy.projects.nextDescription}</p>
          </div>
          {profile.github && (
            <a
              className="outline-button"
              href={profile.github + '?tab=repositories'}
              target="_blank"
              rel="noreferrer"
            >
              More on GitHub <ArrowUpRight size={16} />
            </a>
          )}
        </div>
        <PageFooter navigate={navigate} />
      </article>
    )

  if (page === 'skills')
    return (
      <article className="page inner-page">
        <PageHeading
          number="04"
          label={copy.skills.label}
          title={
            <>
              {copy.skills.title}
              <br />
              <em>{copy.skills.subtitle}</em>
            </>
          }
          description={copy.skills.description}
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
                    {group.learning ? (
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
            <span className="code-muted">{copy.skills.codeComment}</span>
            <br />
            <span className="code-purple">while</span> (curious) {'{'}
            <br />
            &nbsp;&nbsp;learn(); build(); iterate();
            <br />
            {'}'}
          </div>
          <span className="code-block-label content-lines">{copy.skills.codeFooter}</span>
        </div>
        <PageFooter navigate={navigate} />
      </article>
    )

  if (page === 'journey')
    return (
      <article className="page inner-page">
        <PageHeading
          number="05"
          label={copy.journey.label}
          title={
            <>
              {copy.journey.title}
              <br />
              <em>{copy.journey.subtitle}</em>
            </>
          }
          description={journey.intro}
        />
        <div className="journey-layout">
          <div className="timeline">
            <section>
              <span className="timeline-marker">
                <GraduationCap size={19} />
              </span>
              <div className="timeline-date">{copy.journey.currentLabel}</div>
              <h2>
                {education.degree} · {education.subject}
              </h2>
              <p className="timeline-org">
                {education.institution}
                <br />
                {education.university}, {education.location}
              </p>
              <p className="sentence-case">{education.description}</p>
              <span className="small-badge">{education.status.toUpperCase()}</span>
            </section>
            <section>
              <span className="timeline-marker">
                <Code2 size={19} />
              </span>
              <div className="timeline-date">{copy.journey.projectLabel}</div>
              <h2>{copy.journey.projectTitle}</h2>
              <p>{journey.projectText}</p>
              <button className="text-button" onClick={() => navigate('projects')}>
                See what I've built <ArrowRight size={16} />
              </button>
            </section>
            <section>
              <span className="timeline-marker">
                <Sparkles size={19} />
              </span>
              <div className="timeline-date">{copy.journey.nextLabel}</div>
              <h2>{copy.journey.nextTitle}</h2>
              <p>{journey.nextText}</p>
            </section>
          </div>
          <aside className="journey-note">
            <span>{copy.journey.noteLabel}</span>
            <h3 className="content-lines">{copy.journey.noteText}</h3>
            <div>{copy.journey.noteFooter}</div>
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
          label={copy.contact.label}
          title={
            <>
              {copy.contact.title}
              <br />
              <em>{copy.contact.subtitle}</em>
            </>
          }
          description={copy.contact.description}
        />
        <div className="contact-grid">
          {profile.linkedin && (
            <a className="contact-card" href={profile.linkedin} target="_blank" rel="noreferrer">
              <Linkedin size={28} />
              <ArrowUpRight className="contact-arrow" size={23} />
              <small>LET'S CONNECT</small>
              <h2>Find me on LinkedIn</h2>
              <p>{profile.name}</p>
            </a>
          )}
          {profile.github && (
            <a className="contact-card" href={profile.github} target="_blank" rel="noreferrer">
              <Github size={28} />
              <ArrowUpRight className="contact-arrow" size={23} />
              <small>FOLLOW THE JOURNEY</small>
              <h2>Find me on GitHub</h2>
              <p>@{profile.handle}</p>
            </a>
          )}
        </div>
        {profile.email && <ContactForm recipient={profile.email} />}
        <div className="contact-bottom">
          <div>
            <MapPin size={16} />
            <span>
              Based in {profile.location}
              <br />
              <small>{copy.contact.locationNote}</small>
            </span>
          </div>
          <button
            className="outline-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(profile.github || site.url)
                notify(profile.github ? 'GitHub profile link copied.' : 'Profile link copied.')
              } catch {
                notify('Copy this link: ' + (profile.github || site.url))
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
        {copy.readme.title}
        <br />
        <em>{copy.readme.subtitle}</em>
      </h1>
      <p className="lead">{copy.readme.lead}</p>
      <p className="content-lines">{copy.readme.intro}</p>
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
        <h2>## {copy.readme.guideTitle}</h2>
        <p className="content-lines">{copy.readme.guideText}</p>
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
      <span>
        © {new Date().getFullYear()} {profile.name.toUpperCase()}
      </span>
      <button onClick={() => navigate('readme')}>
        {copy.footer.signature} <TerminalSquare size={13} />
      </button>
    </footer>
  )
}
