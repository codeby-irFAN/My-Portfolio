export const copyFields = {
  home: ['topNote', 'greeting', 'divider', 'selectedLabel', 'selectedTitle'],
  about: ['label', 'title', 'subtitle', 'identityCaption', 'identityFooter'],
  projects: ['label', 'title', 'subtitle', 'description', 'nextTitle', 'nextDescription'],
  skills: ['label', 'title', 'subtitle', 'description', 'codeComment', 'codeFooter'],
  journey: [
    'label',
    'title',
    'subtitle',
    'currentLabel',
    'projectLabel',
    'projectTitle',
    'nextLabel',
    'nextTitle',
    'noteLabel',
    'noteText',
    'noteFooter',
  ],
  contact: ['label', 'title', 'subtitle', 'description', 'locationNote'],
  readme: ['title', 'subtitle', 'lead', 'intro', 'guideTitle', 'guideText'],
  footer: ['signature'],
} as const
export type PageId = 'home' | 'about' | 'projects' | 'skills' | 'journey' | 'contact' | 'readme'
export type PortfolioContent = {
  copy: {
    [Group in keyof typeof copyFields]: { [Key in (typeof copyFields)[Group][number]]: string }
  }
  site: { url: string; repository: string; title: string; description: string }
  profile: {
    name: string
    handle: string
    location: string
    role: string
    github: string
    linkedin: string
    email: string
    bio: string
    tagline: string
  }
  education: {
    degree: string
    subject: string
    studyYear: string
    institution: string
    institutionShort: string
    university: string
    universityShort: string
    location: string
    status: string
    description: string
  }
  home: { roles: string[]; intro: string }
  about: { lead: string; paragraphs: string[]; values: { title: string; text: string }[] }
  journey: { intro: string; projectText: string; nextText: string }
  projects: {
    id: string
    name: string
    description: string
    category?: string
    type?: string
    year?: string
    tagline?: string
    detail?: string
    tags?: string[]
    features?: string[]
    github?: string
    live?: string
    preview?: 'auto' | 'travel' | 'board'
    image?: string
    featured?: boolean
  }[]
  skillGroups: { title: string; subtitle?: string; items: string[]; learning?: boolean }[]
  extraAnswers: { terms: string[]; text: string; page?: PageId }[]
  resume: { mode: 'generated' | 'custom'; file: string }
  assistant: {
    name: string
    symbol: string
    heading: string
    personality: string
    instructions: string
    welcome: string
    intro: string
    placeholder: string
    maxWords: number
    temperature: number
    model: string
    suggestions: { label: string; question: string }[]
  }
  appearance: { defaultTheme: string; logo: string; favicon: string; cursorSize: number }
  easterEggs: {
    enabled: boolean
    coffeeMessage: string
    hireMessage: string
    noteTitle: string
    noteMessage: string
    noteFacts: string[]
  }
}

type RecordValue = Record<string, unknown>
export function validateContent(value: unknown): asserts value is PortfolioContent {
  const errors: string[] = []
  function object(input: unknown, path: string): RecordValue {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      errors.push(`${path} must be an object`)
      return {}
    }
    return input as RecordValue
  }
  function text(input: unknown, path: string, required = true) {
    if (typeof input !== 'string' || (required && !input.trim()))
      errors.push(`${path} must be ${required ? 'non-empty ' : ''}text`)
    else if (input.length > 12000) errors.push(`${path} is too long (maximum 12000 characters)`)
  }
  function list(input: unknown, path: string): unknown[] {
    if (!Array.isArray(input)) {
      errors.push(`${path} must be a list`)
      return []
    }
    if (input.length > 100) errors.push(`${path} has too many entries (maximum 100)`)
    return input
  }
  function strings(input: unknown, path: string, optional = false) {
    if (input === undefined && optional) return
    list(input, path).forEach((item, i) => text(item, `${path}[${i}]`))
  }
  function link(input: unknown, path: string, optional = false) {
    if (optional && (input === undefined || input === '')) return
    if (typeof input !== 'string') {
      errors.push(`${path} must be a full https:// URL`)
      return
    }
    try {
      const url = new URL(input)
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error()
    } catch {
      errors.push(`${path} must be a full https:// URL without credentials`)
    }
  }
  const root = object(value, 'content')
  const copy = object(root.copy, 'copy')
  for (const [section, fields] of Object.entries(copyFields)) {
    const group = object(copy[section], `copy.${section}`)
    for (const field of fields) text(group[field], `copy.${section}.${field}`, false)
  }
  const profile = object(root.profile, 'profile')
  for (const field of ['name', 'handle', 'location', 'role', 'bio', 'tagline'])
    text(profile[field], `profile.${field}`)
  for (const field of ['github', 'linkedin']) {
    text(profile[field], `profile.${field}`, false)
    link(profile[field], `profile.${field}`, true)
  }
  text(profile.email, 'profile.email', false)
  if (
    typeof profile.email === 'string' &&
    profile.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
  )
    errors.push('profile.email must be an email address or empty')
  const site = object(root.site, 'site')
  link(site.url, 'site.url')
  link(site.repository, 'site.repository', true)
  text(site.repository, 'site.repository', false)
  text(site.title, 'site.title')
  text(site.description, 'site.description')
  const education = object(root.education, 'education')
  for (const field of [
    'degree',
    'subject',
    'studyYear',
    'institution',
    'institutionShort',
    'university',
    'universityShort',
    'location',
    'status',
    'description',
  ])
    text(education[field], `education.${field}`)
  const home = object(root.home, 'home')
  strings(home.roles, 'home.roles')
  text(home.intro, 'home.intro')
  if (Array.isArray(home.roles) && !home.roles.length)
    errors.push('home.roles needs at least one role')
  const about = object(root.about, 'about')
  text(about.lead, 'about.lead')
  strings(about.paragraphs, 'about.paragraphs')
  list(about.values, 'about.values').forEach((item, i) => {
    const entry = object(item, `about.values[${i}]`)
    text(entry.title, `about.values[${i}].title`)
    text(entry.text, `about.values[${i}].text`)
  })
  const journey = object(root.journey, 'journey')
  for (const field of ['intro', 'projectText', 'nextText']) text(journey[field], `journey.${field}`)
  const ids = new Set<string>()
  list(root.projects, 'projects').forEach((item, i) => {
    const entry = object(item, `projects[${i}]`)
    for (const field of ['id', 'name', 'description']) text(entry[field], `projects[${i}].${field}`)
    if (typeof entry.id === 'string') {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id))
        errors.push(`projects[${i}].id needs lowercase words separated by hyphens`)
      if (ids.has(entry.id)) errors.push(`projects[${i}].id duplicates '${entry.id}'`)
      ids.add(entry.id)
    }
    for (const field of ['category', 'type', 'year', 'tagline', 'detail'])
      if (entry[field] !== undefined) text(entry[field], `projects[${i}].${field}`, false)
    if (entry.category === 'All')
      errors.push(`projects[${i}].category cannot be 'All'; it is reserved for the filter`)
    strings(entry.tags, `projects[${i}].tags`, true)
    strings(entry.features, `projects[${i}].features`, true)
    link(entry.github, `projects[${i}].github`, true)
    link(entry.live, `projects[${i}].live`, true)
    if (entry.preview !== undefined && !['auto', 'travel', 'board'].includes(String(entry.preview)))
      errors.push(`projects[${i}].preview must be auto, travel, or board`)
    if (entry.image !== undefined) text(entry.image, `projects[${i}].image`, false)
    if (entry.image) {
      if (
        typeof entry.image !== 'string' ||
        (!/^\/(?!\/)/.test(entry.image) && !/^https:\/\//.test(entry.image))
      )
        errors.push(`projects[${i}].image must be a /local-path or https:// URL`)
    }
    if (entry.featured !== undefined && typeof entry.featured !== 'boolean')
      errors.push(`projects[${i}].featured must be true or false`)
  })
  list(root.skillGroups, 'skillGroups').forEach((item, i) => {
    const entry = object(item, `skillGroups[${i}]`)
    text(entry.title, `skillGroups[${i}].title`)
    strings(entry.items, `skillGroups[${i}].items`)
    if (entry.subtitle !== undefined) text(entry.subtitle, `skillGroups[${i}].subtitle`, false)
    if (entry.learning !== undefined && typeof entry.learning !== 'boolean')
      errors.push(`skillGroups[${i}].learning must be true or false`)
  })
  list(root.extraAnswers, 'extraAnswers').forEach((item, i) => {
    const entry = object(item, `extraAnswers[${i}]`)
    strings(entry.terms, `extraAnswers[${i}].terms`)
    text(entry.text, `extraAnswers[${i}].text`)
    if (!Array.isArray(entry.terms) || !entry.terms.length)
      errors.push(`extraAnswers[${i}].terms needs at least one search term`)
    if (
      entry.page !== undefined &&
      !['home', 'about', 'projects', 'skills', 'journey', 'contact', 'readme'].includes(
        String(entry.page),
      )
    )
      errors.push(`extraAnswers[${i}].page must name an existing page`)
  })
  const resume = object(root.resume, 'resume')
  if (!['generated', 'custom'].includes(String(resume.mode)))
    errors.push('resume.mode must be generated or custom')
  if (
    typeof resume.file !== 'string' ||
    !/^[A-Za-z0-9][A-Za-z0-9._/-]*\.pdf$/.test(resume.file) ||
    resume.file.split('/').some((part) => part === '..' || part === '.')
  )
    errors.push(
      'resume.file must be a safe PDF path inside public, for example Profile.pdf or uploads/Profile.pdf',
    )
  const assistant = object(root.assistant, 'assistant')
  for (const field of [
    'name',
    'symbol',
    'heading',
    'personality',
    'instructions',
    'welcome',
    'intro',
    'placeholder',
  ])
    text(assistant[field], `assistant.${field}`)
  text(assistant.model, 'assistant.model', false)
  if (
    typeof assistant.maxWords !== 'number' ||
    !Number.isInteger(assistant.maxWords) ||
    assistant.maxWords < 30 ||
    assistant.maxWords > 300
  )
    errors.push('assistant.maxWords must be a whole number between 30 and 300')
  if (
    typeof assistant.temperature !== 'number' ||
    assistant.temperature < 0 ||
    assistant.temperature > 1
  )
    errors.push('assistant.temperature must be between 0 and 1')
  list(assistant.suggestions, 'assistant.suggestions').forEach((item, i) => {
    const entry = object(item, `assistant.suggestions[${i}]`)
    text(entry.label, `assistant.suggestions[${i}].label`)
    text(entry.question, `assistant.suggestions[${i}].question`)
  })
  const eggs = object(root.easterEggs, 'easterEggs')
  if (typeof eggs.enabled !== 'boolean') errors.push('easterEggs.enabled must be true or false')
  for (const field of ['coffeeMessage', 'hireMessage', 'noteTitle', 'noteMessage'])
    text(eggs[field], `easterEggs.${field}`)
  strings(eggs.noteFacts, 'easterEggs.noteFacts')
  const appearance = object(root.appearance, 'appearance')
  if (
    !['fern', 'tokyo', 'rose', 'nord', 'amber', 'paper'].includes(String(appearance.defaultTheme))
  )
    errors.push('appearance.defaultTheme must name one of the six themes')
  for (const field of ['logo', 'favicon']) {
    text(appearance[field], `appearance.${field}`, field === 'favicon')
    const url = appearance[field]
    if (typeof url === 'string' && url && !/^\/(?!\/)/.test(url) && !/^https:\/\//.test(url))
      errors.push(`appearance.${field} must be a /local-path or https:// URL`)
  }
  if (
    typeof appearance.cursorSize !== 'number' ||
    appearance.cursorSize < 3 ||
    appearance.cursorSize > 16
  )
    errors.push('appearance.cursorSize must be between 3 and 16')
  if (errors.length) throw new Error(`Fix content/portfolio.json:\n- ${errors.join('\n- ')}`)
}

export function createPortfolio(value: unknown) {
  validateContent(value)
  const content = value
  const nameParts = content.profile.name.trim().split(/\s+/)
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')
  const projectNames =
    new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(
      content.projects.map((p) => p.name),
    ) || 'my projects'
  const skillNames = content.skillGroups
    .filter((g) => !g.learning)
    .flatMap((g) => g.items)
    .join(', ')
  const learningNames =
    content.skillGroups
      .filter((g) => g.learning)
      .flatMap((g) => g.items)
      .join(', ') || 'new ideas'
  const vars: Record<string, string> = {
    ...content.profile,
    firstName,
    lastName,
    studyYear: content.education.studyYear,
    degree: content.education.degree,
    subject: content.education.subject,
    institution: content.education.institution,
    institutionShort: content.education.institutionShort,
    university: content.education.university,
    universityShort: content.education.universityShort,
    educationLocation: content.education.location,
    educationStatus: content.education.status,
    projectNames,
    skillNames,
    learningNames,
  }
  const format = (text: string) =>
    text.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (_match, key: string) => {
      if (!(key in vars)) throw new Error(`Unknown placeholder {${key}} in content/portfolio.json`)
      return vars[key]
    })
  const profile = {
    ...content.profile,
    bio: format(content.profile.bio),
    firstName,
    lastName,
    initials: nameParts
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toLowerCase(),
    education: `${content.education.institution} · ${content.education.universityShort}`,
    resumeUrl: `/${content.resume.file}`,
  }
  const education = { ...content.education, description: format(content.education.description) }
  const projects = content.projects.map((project) => ({
    ...project,
    category: project.category || 'Web',
    type: project.type || 'PROJECT',
    year: project.year || String(new Date().getFullYear()),
    tagline: project.tagline || project.name,
    detail: project.detail || project.description,
    tags: project.tags ?? [],
    features: project.features ?? [],
    github: project.github ?? '',
    live: project.live ?? '',
    preview: project.preview ?? 'auto',
    image: project.image ?? '',
    featured: project.featured !== false,
  }))
  const skillGroups = content.skillGroups.map((group) => ({
    ...group,
    subtitle: group.subtitle || '',
    learning: !!group.learning,
  }))
  const educationAnswer = `${profile.name}'s education: ${education.degree} in ${education.subject} at ${education.institution} (${education.institutionShort}), ${education.universityShort}, ${education.location}. ${education.studyYear}; ${education.status}.`
  const guideAnswers: { terms: string[]; text: string; page?: PageId }[] = [
    ...content.extraAnswers.map((answer) => ({ ...answer, text: format(answer.text) })),
    {
      terms: [
        'project',
        'build',
        'built',
        'work',
        ...projects.flatMap((p) => [p.id, p.name.toLowerCase()]),
      ],
      text: projects.length
        ? `${profile.name}'s projects include ${projectNames}. ${projects.map((p) => `${p.name}: ${p.description}`).join(' ')} Open projects.js to explore the details.`
        : `${profile.name} hasn't listed any projects yet.`,
      page: 'projects',
    },
    {
      terms: ['skill', 'stack', 'react', 'python', 'language', 'tech'],
      text: `${profile.name}'s toolkit includes ${skillNames || 'the technologies listed on the skills page'}. Currently learning: ${learningNames}.`,
      page: 'skills',
    },
    {
      terms: ['contact', 'email', 'connect', 'hire', 'linkedin'],
      text: `${profile.email ? `You can email ${profile.firstName} at ${profile.email}. ` : ''}Open contact.css for ${profile.firstName}'s public contact links.`,
      page: 'contact',
    },
    {
      terms: ['education', 'college', 'study', 'studying', 'university', 'student'],
      text: educationAnswer,
      page: 'journey',
    },
    {
      terms: ['about', 'who', 'hello', 'hi', firstName.toLowerCase()],
      text: `${profile.name} — ${profile.role}. ${profile.bio} ${profile.tagline}`,
      page: 'about',
    },
  ]
  return {
    copy: Object.fromEntries(
      Object.entries(content.copy).map(([key, group]) => [
        key,
        Object.fromEntries(Object.entries(group).map(([field, text]) => [field, format(text)])),
      ]),
    ) as PortfolioContent['copy'],
    profile,
    education,
    projects,
    skillGroups,
    guideAnswers,
    site: {
      ...content.site,
      title: format(content.site.title),
      description: format(content.site.description),
    },
    home: { ...content.home, intro: format(content.home.intro) },
    about: {
      lead: format(content.about.lead),
      paragraphs: content.about.paragraphs.map(format),
      values: content.about.values.map((item) => ({
        title: format(item.title),
        text: format(item.text),
      })),
    },
    journey: {
      intro: format(content.journey.intro),
      projectText: format(content.journey.projectText),
      nextText: format(content.journey.nextText),
    },
    resume: content.resume,
    assistant: {
      ...content.assistant,
      name: format(content.assistant.name),
      heading: format(content.assistant.heading),
      personality: format(content.assistant.personality),
      instructions: format(content.assistant.instructions),
      welcome: format(content.assistant.welcome),
      intro: format(content.assistant.intro),
      placeholder: format(content.assistant.placeholder),
      suggestions: content.assistant.suggestions.map((item) => ({
        label: format(item.label),
        question: format(item.question),
      })),
    },
    appearance: content.appearance,
    easterEggs: {
      ...content.easterEggs,
      coffeeMessage: format(content.easterEggs.coffeeMessage),
      hireMessage: format(content.easterEggs.hireMessage),
      noteTitle: format(content.easterEggs.noteTitle),
      noteMessage: format(content.easterEggs.noteMessage),
      noteFacts: content.easterEggs.noteFacts.map(format),
    },
  }
}

export function matchAnswer(
  text: string,
  answers: ReturnType<typeof createPortfolio>['guideAnswers'],
) {
  return answers.find((answer) =>
    answer.terms.some((term) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(`(?:^|\\W)${escaped}s?(?=$|\\W)`, 'i').test(text)
    }),
  )
}
