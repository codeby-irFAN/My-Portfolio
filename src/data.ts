// Personal information sourced from github.com/codeby-irFAN and project READMEs.
// Add an email or resume here only when you want to publish it.
export const profile = {
  name: 'Irfan Ahmad',
  handle: 'codeby-irFAN',
  location: 'New Delhi, India',
  role: 'Developer & AI explorer',
  github: 'https://github.com/codeby-irFAN',
  linkedin: 'https://www.linkedin.com/in/irfan-ahmad-55597a444',
  email: 'irfanahmad25136@gmail.com',
  bio: "I'm a first-year B.Tech student studying Artificial Intelligence & Machine Learning at USAR, GGSIPU, Delhi. I enjoy building for the web and exploring how software and AI can solve practical problems.",
  tagline: 'Learning with curiosity. Building with purpose.',
  education: 'University School of Automation & Robotics · GGSIPU',
}
export const files = [
  { id: 'home', name: 'home.tsx', icon: '⚛', color: '#82c8e6', folder: 'src' },
  { id: 'about', name: 'about.html', icon: '◇', color: '#e9a377', folder: 'src' },
  { id: 'projects', name: 'projects.js', icon: 'JS', color: '#e6cf80', folder: 'src' },
  { id: 'skills', name: 'skills.json', icon: '{}', color: '#c8a1e2', folder: 'data' },
  { id: 'journey', name: 'journey.ts', icon: 'TS', color: '#89b7e4', folder: 'src' },
  { id: 'contact', name: 'contact.css', icon: '#', color: '#93acdf', folder: 'styles' },
  { id: 'readme', name: 'README.md', icon: 'M↓', color: '#a7c796', folder: '' },
] as const
export type PageId = (typeof files)[number]['id']
export const themes = [
  { id: 'fern', name: 'Fern Dark', color: '#c4f598' },
  { id: 'tokyo', name: 'Tokyo Night', color: '#9bb5ff' },
  { id: 'rose', name: 'Rosé Pine', color: '#ebbcba' },
  { id: 'nord', name: 'Nord', color: '#88c0d0' },
  { id: 'amber', name: 'Warm Amber', color: '#eac17d' },
  { id: 'paper', name: 'Paper Light', color: '#557044' },
]
export const projects = [
  {
    id: 'tracerisk',
    name: 'TraceRisk',
    type: 'AI + WEB',
    category: 'AI',
    year: '2026',
    tagline: 'A little clarity. A better journey.',
    description:
      'An AI-assisted travel workspace for India. Plan trips, explore disruptions, and follow source-linked insights before heading out.',
    detail:
      'Combines local news, travel advisories, weather, and route information in one workspace. Travelers can plan multi-stop trips, compare options, inspect original evidence, and share a trip briefing.',
    tags: ['React', 'Express', 'AI', 'SQLite'],
    features: [
      'Multi-stop trip planning',
      'Source-linked travel insights',
      'Weather and route information',
      'Shareable trip briefings',
    ],
    github: 'https://github.com/codeby-irFAN/TraceRisk',
    live: 'https://tracerisk.onrender.com/',
  },
  {
    id: 'teamboard',
    name: 'Team Board',
    type: 'FULL-STACK',
    category: 'Web',
    year: '2026',
    tagline: 'Less catching up. More creating.',
    description:
      'A real-time task board that keeps student teams in sync, from the first idea to the final handoff.',
    detail:
      'A collaborative workspace built with React and Supabase. Tasks stay synchronized across clients without a refresh. Version checks, editing indicators, and locks help teams handle simultaneous changes.',
    tags: ['React', 'Supabase', 'PostgreSQL', 'Vite'],
    features: [
      'Real-time synchronization',
      'Drag-and-drop task management',
      'Simultaneous-edit conflict detection',
      'Persistent PostgreSQL storage',
    ],
    github: 'https://github.com/codeby-irFAN/Team_Board',
    live: 'https://team-board-ashen.vercel.app',
  },
]
export type Project = (typeof projects)[number]
export const skillGroups = [
  {
    title: 'The languages',
    subtitle: 'How I talk to computers',
    items: ['JavaScript', 'Python', 'C', 'HTML5', 'CSS3'],
  },
  {
    title: 'The toolkit',
    subtitle: 'Turning ideas into interfaces',
    items: ['React', 'Git', 'GitHub', 'API integration'],
  },
  {
    title: 'The next chapter',
    subtitle: 'Currently learning & exploring',
    items: ['Next.js', 'NumPy & pandas', 'scikit-learn', 'AI agents & RAG', 'Data structures'],
  },
]
export const guideAnswers = [
  {
    terms: ['project', 'build', 'built', 'work', 'tracerisk', 'team'],
    text: 'Irfan’s featured projects are TraceRisk, an AI-assisted travel workspace for India, and Team Board, a real-time collaboration app. Open projects.js to explore the details and live demos.',
    page: 'projects' as PageId,
  },
  {
    terms: ['skill', 'stack', 'react', 'python', 'language', 'tech'],
    text: 'Irfan works with JavaScript, Python, C, HTML, CSS, React, and Git. He is currently learning Next.js, data tools, machine learning, and AI agents. See skills.json for the full picture.',
    page: 'skills' as PageId,
  },
  {
    terms: ['contact', 'email', 'connect', 'hire', 'linkedin'],
    text: 'You can email Irfan at irfanahmad25136@gmail.com or connect on LinkedIn and GitHub. Open contact.css to prepare an email draft or find his verified profiles.',
    page: 'contact' as PageId,
  },
  {
    terms: ['education', 'college', 'study', 'studying', 'university', 'student'],
    text: 'Irfan is a first-year B.Tech student in Artificial Intelligence & Machine Learning at the University School of Automation & Robotics, GGSIPU, Delhi.',
    page: 'journey' as PageId,
  },
  {
    terms: ['about', 'who', 'irfan', 'hello', 'hi'],
    text: 'Meet Irfan Ahmad, an aspiring developer in New Delhi exploring web development, AI, and open source. His philosophy: learning with curiosity, building with purpose.',
    page: 'about' as PageId,
  },
]
