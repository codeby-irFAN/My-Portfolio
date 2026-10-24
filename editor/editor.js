const config = JSON.parse(document.querySelector('#editor-config').textContent)
const sections = {
  copy: [
    'Page headings & text',
    'Edit page titles, descriptions, decorative text, and the README introduction.',
  ],
  profile: ['Profile', 'Your name, role, biography, contact details, and public links.'],
  education: ['Education', 'Update your year, course, institution, and study status here.'],
  home: ['Home', 'The rotating roles and introduction visitors see first.'],
  about: ['About & values', 'Your story, paragraphs, and the principles you work by.'],
  projects: [
    'Projects',
    'Add, remove, or reorder projects. Use Auto preview for new projects, or upload a screenshot.',
  ],
  skillGroups: ['Skills', 'Group your tools and mark any groups you are currently learning.'],
  journey: ['Journey', 'The text around your education, projects, and next steps.'],
  assistant: [
    'AI personality',
    'Change the guide’s voice, instructions, welcome message, suggested questions, and reply settings.',
  ],
  extraAnswers: [
    'Offline answers',
    'Add answers for specific topics. These work even when Groq is unavailable.',
  ],
  resume: ['Résumé', 'Generate a PDF from your content automatically, or upload your own PDF.'],
  appearance: ['Appearance', 'The default theme, logo, browser icon, and square cursor size.'],
  easterEggs: [
    'Easter eggs',
    'Personalize the hidden terminal messages and developer note. Turn this off to disable all four secrets.',
  ],
  site: [
    'Site & sharing',
    'Your domain, source repository, browser title, search description, and social preview text.',
  ],
}
const labels = {
  enabled: 'Enable Easter eggs',
  coffeeMessage: 'Coffee message',
  hireMessage: 'Hiring reply',
  noteTitle: 'Hidden note title',
  noteMessage: 'Hidden note message',
  noteFacts: 'Hidden note facts',
  heading: 'Opening heading',
  name: 'Name',
  handle: 'Handle',
  location: 'Location',
  role: 'Role',
  github: 'GitHub URL',
  linkedin: 'LinkedIn URL',
  email: 'Email',
  bio: 'Biography',
  tagline: 'Tagline',
  degree: 'Degree',
  subject: 'Subject',
  studyYear: 'Study year / stage',
  institution: 'Institution',
  institutionShort: 'Institution abbreviation',
  university: 'University',
  universityShort: 'University abbreviation',
  status: 'Status',
  description: 'Description',
  roles: 'Rotating roles',
  intro: 'Introduction',
  lead: 'Opening line',
  paragraphs: 'Paragraphs',
  values: 'Values',
  title: 'Title',
  text: 'Text',
  projectText: 'Projects paragraph',
  nextText: 'Next steps paragraph',
  id: 'Unique project ID',
  category: 'Category',
  type: 'Type label',
  year: 'Year',
  detail: 'Full description',
  tags: 'Technologies / tags',
  features: 'Features',
  live: 'Live URL',
  preview: 'Preview style',
  image: 'Preview image',
  featured: 'Show on the home page',
  subtitle: 'Subtitle',
  items: 'Skills',
  learning: 'Currently learning',
  terms: 'Matching words or phrases',
  page: 'Page to open',
  mode: 'Résumé mode',
  file: 'PDF file path',
  symbol: 'Symbol',
  personality: 'Personality',
  instructions: 'Instructions',
  welcome: 'Welcome message',
  placeholder: 'Question input hint',
  maxWords: 'Maximum reply words',
  temperature: 'Creativity',
  model: 'Groq model',
  suggestions: 'Suggested questions',
  label: 'Short label',
  question: 'Question',
  defaultTheme: 'Default theme',
  logo: 'Logo image',
  favicon: 'Browser icon',
  cursorSize: 'Inner square size (pixels)',
  url: 'Website URL',
  repository: 'Portfolio repository URL',
}
const help = {
  'profile.handle': 'Used in the editor-style title, explorer, and terminal prompt.',
  'profile.github': 'Full https:// URL. Leave empty to hide the link.',
  'profile.linkedin': 'Full https:// URL. Leave empty to hide the link.',
  'profile.email':
    'Public address for your contact form and guide. Leave empty to hide the email form.',
  'education.studyYear': 'For example: second-year, final-year, or graduate.',
  'home.roles': 'Each line becomes one phrase in the typing animation.',
  'assistant.personality':
    'Describe the voice and tone, for example: friendly, direct, concise, with occasional humor.',
  'assistant.instructions':
    'Describe how the guide should answer visitors. Published facts remain its source of truth. Do not paste API keys or private information here.',
  'assistant.maxWords': '30–300. Longer answers use more tokens.',
  'assistant.temperature': '0–1. Lower values are more consistent; higher values are more varied.',
  'assistant.model':
    'Leave empty for the default model. GROQ_MODEL in .env or Vercel takes priority.',
  'assistant.welcome': 'The first message shown when someone opens the guide.',
  'appearance.defaultTheme': 'Visitors who already chose a theme keep their saved preference.',
  'appearance.logo': 'Leave empty for the permanent monochrome code logo. Or upload an image.',
  'appearance.favicon':
    'A /local-path or https:// image URL. The built-in monochrome icon is /favicon.svg?v=2.',
  'resume.file':
    'Relative to public/, such as Profile.pdf. Uploading your own PDF fills this automatically.',
  'resume.mode':
    'Generated uses your current profile, education, projects, and skills. Custom keeps your uploaded PDF.',
  'site.url': 'Your full https:// domain, used for canonical links and the social preview.',
}
const templates = {
  projects: {
    id: '',
    name: '',
    description: '',
    category: 'Web',
    type: 'PROJECT',
    year: String(new Date().getFullYear()),
    tagline: '',
    detail: '',
    tags: [],
    features: [],
    github: '',
    live: '',
    preview: 'auto',
    image: '',
    featured: true,
  },
  skillGroups: { title: '', subtitle: '', items: [], learning: false },
  extraAnswers: { terms: [], text: '', page: 'about' },
  values: { title: '', text: '' },
  suggestions: { label: '', question: '' },
}
const choices = {
  preview: ['auto', 'travel', 'board'],
  mode: ['generated', 'custom'],
  defaultTheme: ['fern', 'tokyo', 'rose', 'nord', 'amber', 'paper'],
  page: ['home', 'about', 'projects', 'skills', 'journey', 'contact', 'readme'],
}
const longFields = new Set([
  'coffeeMessage',
  'hireMessage',
  'noteMessage',
  'noteFacts',
  'bio',
  'intro',
  'lead',
  'text',
  'description',
  'detail',
  'personality',
  'instructions',
  'welcome',
  'projectText',
  'nextText',
  'paragraphs',
])
let content,
  revision,
  active = 'profile',
  dirty = false,
  saving = false
const fields = document.querySelector('#fields')
const status = document.querySelector('#status')
const save = document.querySelector('#save')
const errorBox = document.querySelector('#error')
const el = (tag, text, className) => {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (className) node.className = className
  return node
}
const get = (path) => path.reduce((value, key) => value[key], content)
function set(path, value) {
  const parent = get(path.slice(0, -1))
  parent[path.at(-1)] = value
  changed()
}
function changed() {
  dirty = true
  save.disabled = saving
  status.textContent = 'Unsaved changes · stays on your computer until you push to GitHub.'
}
function showError(error) {
  errorBox.textContent = error.message
  errorBox.hidden = false
  errorBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}
function button(text, action, className = 'secondary') {
  const node = el('button', text, className)
  node.type = 'button'
  node.addEventListener('click', action)
  return node
}
async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'X-Editor-Token': config.token, ...options.headers },
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Could not complete the request.')
  return result
}
function uploadControl(path, kind) {
  const wrapper = el('div', undefined, 'upload')
  const picker = document.createElement('input')
  picker.type = 'file'
  picker.accept =
    kind === 'resume'
      ? '.pdf,application/pdf'
      : '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp'
  picker.setAttribute(
    'aria-label',
    `Choose ${kind === 'resume' ? 'résumé PDF' : labels[path.at(-1)] || 'image'}`,
  )
  const upload = button(`Upload ${kind === 'resume' ? 'PDF' : 'image'}`, async () => {
    const file = picker.files[0]
    if (!file) return showError(new Error('Choose a file first.'))
    if (file.size > 8 * 1024 * 1024) return showError(new Error('Choose a file smaller than 8 MB.'))
    upload.disabled = true
    try {
      const result = await api(`/api/upload?kind=${kind}`, { method: 'POST', body: file })
      set(path, result.path)
      if (kind === 'resume') content.resume.mode = 'custom'
      render()
      status.textContent = 'Uploaded locally. Save changes to use this file.'
    } catch (error) {
      showError(error)
    } finally {
      upload.disabled = false
    }
  })
  wrapper.append(picker, upload)
  return wrapper
}
function field(value, path) {
  const key = String(path.at(-1)),
    full = path.join('.')
  if (Array.isArray(value)) return array(value, path)
  if (value && typeof value === 'object') {
    const group = el('div')
    if (path[0] === 'copy' && path.length > 1)
      group.append(el('h3', sections[key]?.[0] || labels[key] || key))
    for (const [name, item] of Object.entries(value)) group.append(field(item, [...path, name]))
    return group
  }
  const wrapper = el('div'),
    label = el('label', undefined, 'field')
  const title =
    typeof path.at(-1) === 'number'
      ? `${labels[path.at(-2)] || 'Entry'} ${path.at(-1) + 1}`
      : labels[key] ||
        key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase())
  const caption = el('span', title)
  caption.id = 'label-' + path.join('-')
  label.append(caption)
  let input
  if (choices[key]) {
    input = el('select')
    for (const option of choices[key]) {
      const node = el('option', option)
      node.value = option
      input.append(node)
    }
    input.value = value
  } else if (longFields.has(key) || longFields.has(String(path.at(-2)))) {
    input = el('textarea')
    input.rows = ['personality', 'instructions'].includes(key) ? 5 : 3
    input.value = value
  } else {
    input = el('input')
    input.type =
      typeof value === 'boolean' ? 'checkbox' : typeof value === 'number' ? 'number' : 'text'
    if (input.type === 'checkbox') input.checked = value
    else input.value = value ?? ''
    if (key === 'temperature') {
      input.min = '0'
      input.max = '1'
      input.step = '0.05'
    }
    if (key === 'maxWords') {
      input.min = '30'
      input.max = '300'
    }
    if (key === 'cursorSize') {
      input.min = '3'
      input.max = '16'
    }
    if (key === 'email') input.autocomplete = 'email'
  }
  input.id = 'field-' + path.join('-')
  input.setAttribute('aria-labelledby', caption.id)
  input.name = full
  input.addEventListener('input', () =>
    set(
      path,
      typeof value === 'boolean'
        ? input.checked
        : typeof value === 'number'
          ? input.valueAsNumber
          : input.value,
    ),
  )
  label.append(input)
  const description =
    help[full] ||
    (key === 'id'
      ? 'A unique lowercase name with hyphens, for example: my-new-app.'
      : key === 'image'
        ? 'Upload a screenshot, or enter a /local-path or https:// URL. Leave empty for the illustrated preview.'
        : key === 'preview'
          ? 'Auto adapts to any project. Travel and Board keep the existing illustrated designs.'
          : '')
  if (description) {
    const note = el('small', description)
    note.id = 'help-' + path.join('-')
    input.setAttribute('aria-describedby', note.id)
    label.append(note)
  }
  wrapper.append(label)
  if (key === 'image' || (path[0] === 'appearance' && ['logo', 'favicon'].includes(key)))
    wrapper.append(uploadControl(path, 'image'))
  if (full === 'resume.file') wrapper.append(uploadControl(path, 'resume'))
  return wrapper
}
function array(items, path) {
  const key = path.at(-1),
    container = el('div')
  container.append(el('p', labels[key] || sections[key]?.[0] || key, 'array-label'))
  if (help[path.join('.')]) container.append(el('p', help[path.join('.')], 'section-description'))
  if (!items.length) container.append(el('p', 'No entries yet. Add one below.', 'empty'))
  items.forEach((item, index) => {
    const card = el('section', undefined, 'item')
    const head = el('div', undefined, 'item-head')
    head.append(
      el(
        'strong',
        `${index + 1}. ${typeof item === 'object' ? item.name || item.title || item.label || 'New entry' : 'Entry'}`,
      ),
    )
    const actions = el('div', undefined, 'item-actions')
    const move = (step) => {
      ;[items[index], items[index + step]] = [items[index + step], items[index]]
      changed()
      render()
    }
    const up = button('↑', () => move(-1))
    up.disabled = index === 0
    up.setAttribute('aria-label', `Move entry ${index + 1} up`)
    const down = button('↓', () => move(1))
    down.disabled = index === items.length - 1
    down.setAttribute('aria-label', `Move entry ${index + 1} down`)
    actions.append(
      up,
      down,
      button(
        'Remove',
        () => {
          items.splice(index, 1)
          changed()
          render()
        },
        'remove',
      ),
    )
    head.append(actions)
    card.append(head, field(item, [...path, index]))
    container.append(card)
  })
  container.append(
    button(
      '＋ Add entry',
      () => {
        const template = templates[key]
        items.push(template ? structuredClone(template) : '')
        changed()
        render()
        document
          .getElementById(
            'field-' +
              [...path, items.length - 1, ...(template ? [Object.keys(template)[0]] : [])].join(
                '-',
              ),
          )
          ?.focus()
      },
      'secondary add',
    ),
  )
  return container
}
function render() {
  fields.replaceChildren(
    el('h2', sections[active][0]),
    el('p', sections[active][1], 'section-description'),
    field(content[active], [active]),
  )
  for (const node of document.querySelectorAll('#sections button')) {
    if (node.dataset.section === active) node.setAttribute('aria-current', 'page')
    else node.removeAttribute('aria-current')
  }
}
document.querySelector('#content-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!dirty || saving) return
  saving = true
  fields.inert = true
  save.disabled = true
  save.textContent = 'Saving…'
  errorBox.hidden = true
  try {
    const result = await api('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, revision }),
    })
    revision = result.revision
    dirty = false
    status.textContent = result.message
  } catch (error) {
    showError(error)
    status.textContent = 'Not saved. Your changes are still in this form.'
  } finally {
    saving = false
    fields.inert = false
    save.disabled = !dirty
    save.textContent = 'Save changes'
  }
})
document.querySelector('#download').addEventListener('click', () => {
  if (!content) return
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(content, null, 2) + '\n'], { type: 'application/json' }),
  )
  const anchor = el('a')
  anchor.href = url
  anchor.download = 'portfolio.json'
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
})
window.addEventListener('beforeunload', (event) => {
  if (dirty) {
    event.preventDefault()
    event.returnValue = ''
  }
})
window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    document.querySelector('#content-form').requestSubmit()
  }
})
async function init() {
  save.disabled = true
  try {
    const result = await api('/api/content')
    content = result.content
    revision = result.revision
    const preview = document.querySelector('#preview')
    if (config.previewUrl) preview.href = config.previewUrl
    else preview.hidden = true
    for (const [key, [name]] of Object.entries(sections)) {
      const node = button(name, () => {
        active = key
        render()
      })
      node.dataset.section = key
      document.querySelector('#sections').append(node)
    }
    render()
    status.textContent = 'Up to date locally · saving here does not publish your site.'
  } catch (error) {
    showError(error)
    status.textContent = 'Could not load your content.'
  }
}
init()
