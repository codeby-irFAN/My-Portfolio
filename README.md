# My Portfolio

Hi, I'm **Irfan Ahmad**, a B.Tech student in Artificial Intelligence & Machine Learning at USAR, GGSIPU, Delhi. I'm exploring web development, AI, and open source, and learning by building projects I can actually use.

This is my personal portfolio. I wanted it to feel like a developer's workspace, so the pages open as files in an editor. It brings together my projects, the things I'm learning, and ways to get in touch.

## What's inside

- An editor layout with a scrollable mobile explorer, closable tabs, and keyboard navigation.
- Pages for my background, projects, skills, learning journey, and contact details.
- A square cursor that follows the selected theme, smooth scrolling, and animated transitions.
- Six color themes, including a light theme, with preferences saved in the browser.
- A fixed monochrome logo and browser icon across all themes.
- A command palette and an interactive portfolio terminal.
- An expandable chat panel with an optional Groq-powered assistant.
- A contact form that prepares an email draft, plus a downloadable profile PDF.
- Portrait and landscape layouts, controls that fit smaller phone screens, and support for reduced motion.

The terminal is a way to explore the portfolio; it doesn't run commands on a computer. The project cards use illustrated previews, with links to the actual apps and source code.

## Featured projects

**[TraceRisk](https://github.com/codeby-irFAN/TraceRisk)** — A travel workspace for trips in India, bringing together routes, weather, travel updates, and source-linked insights. [Live project](https://tracerisk.onrender.com/).

**[Team Board](https://github.com/codeby-irFAN/Team_Board)** — A collaborative task board for student teams, built with React and Supabase. It supports real-time updates, drag-and-drop tasks, and checks for simultaneous edits. [Live project](https://team-board-ashen.vercel.app).

## Stack

React, TypeScript, Vite, and Lenis on the frontend. The AI guide uses a Node.js endpoint and the Groq API. Fonts are hosted locally through Fontsource, and the icons are from Lucide.

## Run locally

You'll need **Node.js 24 or newer** and Git.

```bash
git clone https://github.com/codeby-irFAN/My-Portfolio.git
cd My-Portfolio
npm ci
npm run dev
```

Open the address printed in the terminal. The default port is `5173`.

The portfolio runs without an API key. The guide uses local answers until Groq is configured.

## Connect the AI guide

Create a `.env` file beside `package.json` and add your key:

```dotenv
GROQ_API_KEY=your_actual_key_here
```

Restart the dev server after saving the file. AI replies are labeled **GROQ AI**. If the service is unavailable or a limit is reached, the guide switches to answers labeled **LOCAL GUIDE**.

The default model is `openai/gpt-oss-20b`. To use another model available in your Groq account, add:

```dotenv
GROQ_MODEL=your_supported_model_id
```

`.env` and `.env.local` are both supported and ignored by Git. Use one of them for your local key. The key belongs on the server, so don't put it in `src/` or give it a `VITE_` prefix. `.env.example` lists the available settings without any credentials.

The assistant answers from the profile and project information in `src/data.ts`. It keeps a short conversation history for follow-up questions and links to my public project sources. It doesn't fetch GitHub updates live, send email, or take actions on my behalf. Questions are sent to Groq when AI is enabled; the app doesn't save conversations on the server.

If you still see the old “Local answers. No account needed.” heading, pull the latest code, restart the server, and refresh the browser. Make sure you're opening the address printed by the current server.

## Contact

The contact page links to my [GitHub](https://github.com/codeby-irFAN) and [LinkedIn](https://www.linkedin.com/in/irfan-ahmad-55597a444), and includes a form for **irfanahmad25136@gmail.com**.

The form opens a filled-in draft in the visitor's email app. They still need to review and send it there. There's also a copy-message option if no email app opens. The website doesn't deliver or store those messages itself.

## Update the content

My profile, project descriptions, links, skills, and local guide answers live in `src/data.ts`.

After changing profile details, regenerate the printable profile and PDF:

```bash
npm run profile
npm run build
```

The generated files are `public/profile.html` and `public/Irfan-Ahmad-Profile.pdf`.

## Project structure

```text
api/chat.ts                Vercel API entry point
server/chat.ts             Groq requests, validation, and request limits
server/chat.test.ts        API tests
src/data.ts                Profile and project content
src/components/            Portfolio pages and interactive UI
src/style.css              Layout, themes, and animations
public/                    Icons and downloadable profile
scripts/generate-profile.mjs
                           Generates the profile HTML and PDF
tests/portfolio.spec.ts     Browser tests
vite.config.ts             Local frontend and API setup
```

## Development commands

```bash
npm run dev           # Local development server
npm run build         # TypeScript checks and production build
npm run preview       # Preview the build with the local API handler
npm test              # Browser tests
npm run test:server   # API tests
npm run format:check  # Check formatting
```

The browser tests and profile generator need Chromium. If it isn't installed, run:

```bash
npx playwright install chromium
```

The tools also support a system browser at `/usr/bin/chromium` or a custom `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Tests use mocked Groq responses, so they don't need a real key or use API quota. To check a live connection, ask the guide a question after configuring the key and look for the **GROQ AI** label.

## Deploy on Vercel

1. Import this repository into Vercel.
2. Choose **Vite**, with `npm run build` as the build command and `dist` as the output directory.
3. Add `GROQ_API_KEY` in **Project Settings → Environment Variables**. Add `GROQ_MODEL` only if you want to override the default.
4. Deploy. Redeploy after changing environment variables.

Vercel runs `api/chat.ts` as a server function. Locally, Vite serves the same `/api/chat` endpoint. A purely static host can serve the portfolio, but needs a compatible backend for AI replies; otherwise the guide uses its local answers.

The API validates incoming messages, limits conversation length and output, and times out requests to Groq. It also has an in-memory limit of 12 requests per minute per IP per instance. That limit isn't shared between serverless instances, and Groq's own model availability and quotas still apply.

## Fonts and icons

Fonts: DM Sans, Space Grotesk, and IBM Plex Mono, self-hosted through Fontsource under their supplied font licenses. Icons: Lucide, under the ISC license.
