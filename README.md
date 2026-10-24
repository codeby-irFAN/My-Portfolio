# Irfan Ahmad — Interactive Portfolio

A personal developer portfolio inspired by a code editor, built independently with React, TypeScript, Vite, and Lenis. Personal details come from [Irfan's public GitHub profile](https://github.com/codeby-irFAN), including education at USAR, GGSIPU and the TraceRisk and Team Board projects.

## Run locally

Use Node.js 24 or newer.

```sh
npm ci
npm run dev
```

The development server uses port 5173. No account, API key, database, or external font request is needed.

```sh
npm run build        # TypeScript checks and production output in dist/
npm run preview      # Serve the production build
npm test             # Chromium browser tests
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
- Local portfolio guide with curated answers about Irfan. It is not a generative AI service and does not send questions to a server.
- Contact form that prepares an email draft in the visitor’s mail app, with message copying as a fallback. It does not send email automatically.
- Downloadable student profile PDF and accessible, keyboard-operated dialogs.
- Mobile explorer and touch layouts, plus reduced-motion support.
- Locally bundled fonts and icons; no runtime third-party scripts or analytics.

The terminal is a portfolio simulation, not a system shell. Project cards use original illustrative interface previews rather than screenshots of the live apps. Live project availability depends on their respective hosts.

## Personalize

Edit `src/data.ts` for the profile, project descriptions, links, skills, themes, and guide answers. The contact address is published with Irfan’s approval. The form opens the visitor’s email app with an encoded draft; messages are not stored or delivered by this website. Automatic delivery would need a configured form provider or backend email service.

After changing profile details, regenerate the PDF and its printable HTML source:

```sh
npm run profile
npm run build
```

`npm run profile` uses Node's TypeScript support and Chromium to generate `public/profile.html` and `public/Irfan-Ahmad-Profile.pdf` from the same data file. The PDF contains public student, education, and project information.

## Deploy

Run `npm run build` and serve `dist/` with any static hosting provider. On Vercel or Netlify, select Vite, the build command `npm run build`, and the output directory `dist`. Navigation uses hashes, so no application route rewrite is required. This repository does not publish or deploy automatically.

## Inspiration and attribution

The editor interaction concept was informed by [Mohit Kuril's portfolio](https://mohitkuril.xyz/) and inspection of his [public repository](https://github.com/Mohitkuril/software-developer-portfolio). The square cursor was requested with [Aahana Bobade's portfolio](https://www.aahanabobade.com/) as inspiration. The reference sites themselves could not be loaded under the cloud environment's network policy, so exact visual and behavioral parity has not been verified. This implementation uses original application code, styling, and artwork; it does not copy their source, assets, or identity.

Fonts: DM Sans, Space Grotesk, and IBM Plex Mono, self-hosted through Fontsource under their supplied font licenses. Icons: Lucide, under the ISC license. Personal and project information belongs to Irfan Ahmad.
