# Updating my portfolio

I can update my site from a form in my own browser. ChatGPT isn’t needed, and I don’t need to log in to the editor.

## 1. Open the project

Open a terminal inside the folder containing `package.json`. On Windows, I can open the folder in File Explorer, click the address bar, type `cmd`, and press Enter.

For a fresh download:

```bash
git clone https://github.com/codeby-irFAN/My-Portfolio.git
cd My-Portfolio
```

I need Node.js **24 or newer** and Git installed.

## 2. Get the latest version

```bash
git status
git pull --ff-only
npm ci
```

If `git status` shows edits I want to keep, I commit those first. If the pull reports a conflict or refuses to continue, I resolve it before editing; I don’t overwrite my files or force-push.

If npm asks me to approve esbuild’s install script, the repository already allows the specific esbuild version in `package.json`. I use the current repository files and rerun `npm ci`. I don’t approve unrelated packages just to clear warnings.

## 3. Start the editor

```bash
npm run edit
```

The terminal prints two addresses:

- **Portfolio editor**: normally `http://127.0.0.1:5177`.
- **Website preview**: normally `http://127.0.0.1:5173/`. If that port is busy, the preview uses another available port.

I open the editor address in my browser and keep the terminal running. **Open preview** opens the matching website preview in another tab. Both servers bind to this computer only.

If port 5177 is busy, I close the other editor terminal. Alternatively, in Windows Command Prompt:

```bat
set PORTFOLIO_EDITOR_PORT=5178
npm run edit
```

In PowerShell:

```powershell
$env:PORTFOLIO_EDITOR_PORT = "5178"
npm run edit
```

## 4. Choose what to change

| Editor section       | What I change                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Profile              | Name, handle, role, location, biography, tagline, email, GitHub, LinkedIn                                     |
| Education            | Year/stage, degree, subject, college, university, abbreviations, status, description                          |
| Home                 | Rotating roles and the main introduction                                                                      |
| About & values       | Opening line, paragraphs, and value cards                                                                     |
| Page headings & text | Titles, descriptions, page labels, journey note, README introduction, footer signature                        |
| Projects             | Name, unique ID, year, category, descriptions, tags, features, links, preview, image, featured setting        |
| Skills               | Group titles, subtitles, skill lists, and currently-learning indicators                                       |
| Journey              | Introduction, projects paragraph, next steps                                                                  |
| AI personality       | Guide name, symbol, heading, personality, instructions, welcome, suggestions, model, creativity, reply length |
| Offline answers      | Topic keywords, answer text, and an optional destination page                                                 |
| Résumé               | Automatic generation or an uploaded PDF                                                                       |
| Appearance           | Default theme, logo, browser icon, cursor square size                                                         |
| Site & sharing       | Domain, repository URL, browser title, search/social description                                              |

Text fields are plain text. HTML and React code aren’t evaluated. Layout, animation behavior, new pages, and new functionality still live in the source code.

### Projects and skills

I use **Add entry**, **Remove**, and the arrow buttons to manage lists. New projects use **Auto** preview, which displays their own name and tags. **Travel** and **Board** keep the existing illustrations. An uploaded screenshot overrides those illustrations.

A project ID must be unique, lowercase, and use hyphens, such as `my-new-app`. Categories appear in the project filters automatically; `All` is reserved. **Show on the home page** controls the featured list. Empty GitHub/live links hide the corresponding project buttons.

For images, I choose a PNG, JPEG, or WebP file under 8 MB, then click **Upload image**. The editor stores it in `public/uploads/` and fills in the path. Uploaded files are local until committed and pushed. Removing a reference doesn’t delete the file, so I can reuse it. I only delete an old upload after checking no field still uses it.

### AI personality and offline answers

For personality, I can write something like: “Friendly, concise, lightly humorous. Explain technical terms simply.” Instructions describe how I want visitors helped. The guide still uses the published facts and won’t gain the ability to browse, send messages, or run commands through a personality change.

I can set a response target of 30–300 words and creativity from 0–1. Leaving the model blank uses the default. A `GROQ_MODEL` value in `.env` or Vercel overrides this field.

**Offline answers** take priority over the default topic answers when their keywords match. They don’t need Groq. They are also included in the facts sent to the AI guide. Personality affects AI responses; offline replies use the exact text I enter.

All content in the editor is public website content. I keep API keys and private instructions out of these fields. For local AI, my key stays in `.env` or `.env.local` beside `package.json`. For production AI, it stays in Vercel’s environment variables. I restart the local server after changing `.env` and redeploy after changing Vercel variables.

### Résumé

**Generated** creates a PDF from my profile, education, projects, and all skill groups whenever I save or build. **Custom** keeps my own PDF. I choose a PDF under 8 MB and click **Upload PDF**; this sets its file path and switches to custom mode. I then save the changes.

### Appearance

Leaving the logo image empty keeps the permanent monochrome code logo. The built-in monochrome browser icon is `/favicon.svg?v=2`. I can upload replacements. The cursor’s inner square can be 3–16 pixels.

The default theme is for new visitors. Someone who has already chosen a theme keeps their saved browser preference. Browser icon changes can take a refresh or a new tab because browsers cache icons.

## 5. Save and preview

I click **Save changes** or press **Ctrl+S** / **⌘S**. A “Saved locally” message means the file was written successfully. The website preview refreshes automatically; if needed, I refresh its tab after a moment.

Saving updates:

- `content/portfolio.json` — the single source for editable content.
- `public/profile.html` — printable profile.
- `public/<configured PDF path>` — generated résumé, if enabled.
- `public/og-card.svg` and `public/og-card.png` — social preview.

The terminal, contact form, assistant facts, project count, and category filters also use the same content. Page titles, canonical links, and social metadata are generated from it.

If validation fails, the editor lists the fields to fix and keeps my unsaved draft. If I edited the file elsewhere, the editor refuses to overwrite that newer version. **Download draft JSON** saves a backup before I reload and reconcile the changes. To restore a draft manually, I replace `content/portfolio.json` with the downloaded file, run `npm run check`, then restart the editor. I don’t run multiple editors against the same folder.

Uploaded files are saved when uploaded, even before I click Save. They aren’t published until pushed.

## 6. Check the result

I review the website preview, including its mobile layout, project cards, contact links, guide, and PDF download. Then I run this in a second terminal in the same project folder:

```bash
npm run check
```

This validates the content, checks TypeScript, regenerates assets, and creates the production build. No API key or browser installation is needed for this check.

For development changes, I can also run:

```bash
npm run test:content
npm run test:server
npm test
```

Browser tests need Chromium; install it with `npx playwright install chromium` if required. Groq calls are mocked in automated tests. To test my real key, I ask the guide a question in the preview and look for **GROQ AI**.

## 7. Publish to GitHub and Vercel

```bash
git status
git add content/portfolio.json public/
git commit -m "Update portfolio content"
git push origin main
```

I review `git status` before committing. These paths include the content and public uploads/generated files. `.env` files stay ignored. If I made source code changes as well, I review and add those files separately.

If Vercel is connected to this repository with `main` as the production branch, the push starts a deployment. I wait for **Ready** in Vercel, then check `https://www.irfanahmad.xyz`. Social services may cache the previous sharing image for a while.

If `git push` is rejected because GitHub has newer commits, I get and reconcile those changes before trying again. I don’t use force-push.

## 8. Finish

I return to the editor terminal and press **Ctrl+C**. Saved files remain on disk. The next time I want to update the site, I repeat from step 2.

## Editing the file directly

The browser editor is optional. I can edit `content/portfolio.json` in VS Code and run `npm run check`. JSON needs double quotes and no trailing commas. `npm run profile` regenerates only the profile and sharing assets.

Supported placeholders in biography, page copy, introductions, journey text, extra answers, and assistant messages/preferences:

| Placeholders                                                                                                                                                   | Source                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `{name}`, `{firstName}`, `{lastName}`, `{handle}`, `{role}`, `{location}`, `{email}`, `{github}`, `{linkedin}`, `{tagline}`                                    | Profile                         |
| `{degree}`, `{subject}`, `{studyYear}`, `{institution}`, `{institutionShort}`, `{university}`, `{universityShort}`, `{educationLocation}`, `{educationStatus}` | Education                       |
| `{projectNames}`, `{skillNames}`, `{learningNames}`                                                                                                            | Current project and skill lists |

For example, `I'm a {studyYear} student at {institutionShort}.` automatically changes when I update my year or college. Unknown placeholders are reported as validation errors.
