// Edit content/portfolio.json for personal content. This module only connects it to the UI.
import content from '../content/portfolio.json' with { type: 'json' }
import { createPortfolio, matchAnswer } from './content/model.ts'
export type { PageId } from './content/model.ts'

export const {
  copy,
  profile,
  education,
  projects,
  skillGroups,
  guideAnswers,
  site,
  home,
  about,
  journey,
  resume,
  assistant,
  appearance,
  easterEggs,
} = createPortfolio(content)
export const findGuideAnswer = (text: string) => matchAnswer(text, guideAnswers)
export type Project = (typeof projects)[number]
export const projectCategories = ['All', ...new Set(projects.map((project) => project.category))]
export const featuredProjects = projects.filter((project) => project.featured)

export const files = [
  { id: 'home', name: 'home.tsx', icon: '⚛', color: '#82c8e6', folder: 'src' },
  { id: 'about', name: 'about.html', icon: '◇', color: '#e9a377', folder: 'src' },
  { id: 'projects', name: 'projects.js', icon: 'JS', color: '#e6cf80', folder: 'src' },
  { id: 'skills', name: 'skills.json', icon: '{}', color: '#c8a1e2', folder: 'data' },
  { id: 'journey', name: 'journey.ts', icon: 'TS', color: '#89b7e4', folder: 'src' },
  { id: 'contact', name: 'contact.css', icon: '#', color: '#93acdf', folder: 'styles' },
  { id: 'readme', name: 'README.md', icon: 'M↓', color: '#a7c796', folder: '' },
] as const
export const themes = [
  { id: 'fern', name: 'Fern Dark', color: '#c4f598' },
  { id: 'tokyo', name: 'Tokyo Night', color: '#9bb5ff' },
  { id: 'rose', name: 'Rosé Pine', color: '#ebbcba' },
  { id: 'nord', name: 'Nord', color: '#88c0d0' },
  { id: 'amber', name: 'Warm Amber', color: '#eac17d' },
  { id: 'paper', name: 'Paper Light', color: '#557044' },
]
