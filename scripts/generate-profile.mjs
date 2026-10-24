import { generateAssets, readPortfolio } from './assets.ts'
await generateAssets(readPortfolio())
console.log(
  'Updated the profile PDF, printable HTML, and sharing images from content/portfolio.json.',
)
