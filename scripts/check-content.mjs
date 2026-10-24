import { readPortfolio } from './assets.ts'
const content = readPortfolio()
console.log(
  `Content is valid: ${content.profile.name}; ${content.projects.length} projects; ${content.skillGroups.length} skill groups.`,
)
