# Irfan Ahmad — Interactive Portfolio

A personal developer portfolio inspired by a code editor, built independently with React, TypeScript, Vite, and Lenis. Personal details come from [Irfan's public GitHub profile](https://github.com/codeby-irFAN), including education at USAR, GGSIPU and the TraceRisk and Team Board projects.

## Run locally

Use Node.js 24 or newer.

```sh
npm ci
npm run dev
```

The development server uses port 5173. The portfolio works without credentials using local guide answers. Groq AI is optional and requires a server-side API key; no database or external font request is needed.

```sh
npm run build        # TypeScript checks and production output in dist/
npm run preview      # Serve the production build
npm test             # Chromium browser tests (mocked AI requests)
npm run test:server  # API tests (mocked Groq provider)
npm run format:check
```

Browser tests use the installed Chromium at `/usr/bin/chromium` when available. Otherwise run `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to your browser executable.

## Features

- File explorer, closable tabs, arrow-key tab navigation, URL hashes, and browser history.
- Home, about, projects, skills, learning journey, contact, and README views.
- Smooth wheel scrolling, animated page transitions, typewriter roles, floating geometric artwork, and hover states.
- Square cursor with an 8px center dot and synchronized tracking, theme-matched colors and interactive hover response; can be disabled in settings.
- Six persisted color themes, including a light theme.
- Searchable command palette with keyboard navigation (`Ctrl/Command + K` or `/`).
- Interactive portfolio terminal with commands, history, file completion, and simulated directory navigation (`Ctrl/Command + backtick`).
- Project filters, project details, and links to actual source repositories and live projects.
- Portfolio guide with optional Groq AI, grounded in curated public profile and project information, approved source links, follow-up context, and clearly labeled local fallback answers. AI questions are sent through the server to Groq.
- Contact form that prepares an email draft in the visitor’s mail app, with message copying as a fallback. It does not send email automatically.
- Downloadable student profile PDF and accessible, keyboard-operated dialogs.
- Mobile explorer and touch layouts, plus reduced-motion support.
- Locally bundled fonts and icons; no third-party browser scripts or analytics. The optional AI backend calls Groq.

The terminal is a portfolio simulation, not a system shell. Project cards use original illustrative interface previews rather than screenshots of the live apps. Live project availability depends on their respective hosts.

## Personalize

Edit `src/data.ts` for the profile, project descriptions, links, skills, themes, and guide answers. The contact address is published with Irfan’s approval. The form opens the visitor’s email app with an encoded draft; messages are not stored or delivered by this website. Automatic delivery would need a configured form provider or backend email service.

After changing profile details, regenerate the PDF and its printable HTML source:

```sh
npm run profile
npm run build
```

`npm run profile` uses Node's TypeScript support and Chromium to generate `public/profile.html` and `public/Irfan-Ahmad-Profile.pdf` from the same data file. The PDF contains public student, education, and project information.

## Enable Groq locally

1. Pull the latest code with `git pull origin main` and run `npm ci`.
2. Create a file named `.env.local` in the project root (beside `package.json`). Use `.env.example` as a template and enter your actual key locally:

   ```dotenv
   GROQ_API_KEY=your_actual_key_here
   GROQ_MODEL=openai/gpt-oss-20b
   ```

3. Stop an existing dev server with Ctrl+C, then run `npm run dev` again.
4. Open the portfolio guide and ask a question. AI replies display **GROQ AI**; when the provider cannot be reached, replies display **LOCAL GUIDE**.

`.env.local` is ignored by Git. Never put the key in `src/`, chat, a committed file, or a variable beginning with `VITE_`. Only the server reads `GROQ_API_KEY`. Model availability and free quotas depend on your Groq account; the default is from Groq's official TypeScript SDK examples. Override `GROQ_MODEL` with a model your account supports if needed. Do not use an API-key value as a model name.

The assistant uses facts in `src/data.ts`, curated from the public GitHub profile and project READMEs. It does not browse GitHub live. It can explain the portfolio and draft an enquiry; it cannot send emails, run shell commands, or book meetings. AI answers can be mistaken. Questions and a short conversation history are sent to Groq when enabled; this app does not persist conversations on its server.

## Deploy with Groq on Vercel

1. Import this GitHub repository into Vercel. Select **Vite**, build command `npm run build`, and output directory `dist`.
2. In **Project Settings → Environment Variables**, add **GROQ_API_KEY** with the real key. Select Production and any preview environments where you want AI enabled.
3. Optionally add **GROQ_MODEL**. Otherwise the server uses its default model.
4. Deploy or redeploy after changing environment variables.

`api/chat.ts` is the Vercel server function. `server/chat.ts` contains the shared handler; Vite serves the same endpoint during development and production preview. The server holds the key, validates requests, caps history/output, times out provider calls, and applies a best-effort limit of 12 requests per minute per IP per instance. This in-memory limit is not shared between serverless instances; add a shared limiter before relying on it for strong abuse protection. Provider quotas still apply. The AI route has no administrative or account tools.

Pure static hosting can serve `dist`, but cannot run the Groq backend. It will use local guide answers unless you provide a compatible same-origin `/api/chat` endpoint. No route rewrite is required for the hash-based page navigation. This repository does not deploy automatically.

## Validation

`npm run build`, `npm run test:server`, `npm test`, and `npm run format:check` cover the build, API validation, credential isolation, provider failures, rate limits, browser UI, AI response labels, follow-up context, and fallback behavior. Tests mock Groq and never require or spend a real API key. A passing mocked suite does not establish that your live key, model, quota, or hosting configuration works; verify a labeled AI reply after setting your key.

## Inspiration and attribution

The editor interaction concept was informed by [Mohit Kuril's portfolio](https://mohitkuril.xyz/) and inspection of his [public repository](https://github.com/Mohitkuril/software-developer-portfolio). The square cursor was requested with [Aahana Bobade's portfolio](https://www.aahanabobade.com/) as inspiration. The reference sites themselves could not be loaded under the cloud environment's network policy, so exact visual and behavioral parity has not been verified. This implementation uses original application code, styling, and artwork; it does not copy their source, assets, or identity.

Fonts: DM Sans, Space Grotesk, and IBM Plex Mono, self-hosted through Fontsource under their supplied font licenses. Icons: Lucide, under the ISC license. Personal and project information belongs to Irfan Ahmad.
