import assert from 'node:assert/strict'
import { test } from 'node:test'
import content from '../../content/portfolio.json' with { type: 'json' }
import { createPortfolio, matchAnswer, validateContent } from './model.ts'

test('one change to profile facts updates pages, metadata, guide, and AI preferences', () => {
  const next = structuredClone(content)
  next.profile.name = 'Sam Example'
  next.education.studyYear = 'third-year'
  next.education.institutionShort = 'Example College'
  next.projects.push({
    ...next.projects[0],
    id: 'new-app',
    name: 'New App',
    category: 'Design',
    preview: 'auto',
  })
  next.assistant.personality = 'Direct, warm, and interested in {firstName}’s projects.'
  next.extraAnswers = [
    {
      terms: ['availability'],
      text: '{firstName} is open to project discussions.',
      page: 'contact',
    },
  ] as never
  const data = createPortfolio(next)
  assert.equal(data.profile.firstName, 'Sam')
  assert.match(data.profile.bio, /third-year/)
  assert.match(data.profile.bio, /Example College/)
  assert.match(data.site.title, /Sam Example/)
  assert.match(data.copy.readme.intro, /Sam Example/)
  assert.match(data.assistant.welcome, /Sam/)
  assert.match(data.assistant.personality, /Sam/)
  assert.match(data.journey.projectText, /New App/)
  assert.match(data.easterEggs.noteMessage, /Sam/)
  assert.ok(data.easterEggs.noteFacts.some((fact) => fact.includes('New App')))
  assert.match(matchAnswer('What is Sam studying?', data.guideAnswers)!.text, /third-year/)
  assert.match(matchAnswer('Any availability?', data.guideAnswers)!.text, /Sam is open/)
  assert.match(matchAnswer('Tell me about New App', data.guideAnswers)!.text, /New App/)
  assert.equal(matchAnswer('a highlight', data.guideAnswers), undefined)
})

test('invalid IDs, links, file paths, settings, and placeholders fail before saving', () => {
  for (const mutate of [
    (c: typeof content) => {
      c.projects[1].id = c.projects[0].id
    },
    (c: typeof content) => {
      c.profile.github = 'javascript:alert(1)'
    },
    (c: typeof content) => {
      c.resume.file = '../secret.pdf'
    },
    (c: typeof content) => {
      c.resume.file = '/outside.pdf'
    },
    (c: typeof content) => {
      c.projects[0].category = 'All'
    },
    (c: typeof content) => {
      c.home.roles = []
    },
    (c: typeof content) => {
      c.assistant.temperature = 4
    },
    (c: typeof content) => {
      c.appearance.cursorSize = 400
    },
    (c: typeof content) => {
      c.profile.bio = '{unknownFact}'
    },
    (c: typeof content) => {
      c.easterEggs.noteMessage = '{unknownFact}'
    },
    (c: typeof content) => {
      c.easterEggs.noteFacts = [42] as never
    },
  ]) {
    const next = structuredClone(content)
    mutate(next)
    assert.throws(() => createPortfolio(next), /content\/portfolio.json/)
  }
  for (const value of [null, {}, [], { profile: 'bad' }])
    assert.throws(() => validateContent(value), /must be/)
})

test('a minimal new project gets usable defaults without changing React components', () => {
  const next = structuredClone(content)
  next.projects = [
    { id: 'new-project', name: 'New Project', description: 'A useful tool.' },
  ] as never
  next.profile.github = ''
  next.profile.linkedin = ''
  next.profile.email = ''
  const data = createPortfolio(next)
  assert.equal(data.projects[0].preview, 'auto')
  assert.equal(data.projects[0].featured, true)
  assert.deepEqual(data.projects[0].tags, [])
  assert.equal(data.profile.resumeUrl, '/' + next.resume.file)
  assert.equal(data.projects[0].github, '')
})
