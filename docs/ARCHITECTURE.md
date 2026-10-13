# Architecture

Static Next.js app. The browser is the only runtime that holds user data.

## Request path

GitHub Pages serves the `out/` directory produced by `next build` (`output: "export"` in `next.config.mjs`). There are no API routes and no server components that read a database. `trailingSlash` is on, so routes end in `/`.

`NEXT_PUBLIC_BASE_PATH` is empty locally and `/skillmaxing` in the Pages workflow. Video and other public URLs must include that prefix. Next.js `Link` adds it. A raw `src` must add it itself, as `components/Player.tsx` does.

## Layout

`app/layout.tsx` wraps every page in `components/Chrome.tsx` and `lib/store.tsx`.

Chrome picks a shell from the path:

- `/` renders the marketing home (`components/Home.tsx`): ticker, nav, skewed buttons, course sections.
- `/python-ai`, `/inference-eng`, and `/system` render the course bar and the lesson drawer. Lesson and overview bodies come from `components/Learn.tsx`.
- Other routes use the marketing nav and footer.

`components/Player.tsx` is a native `<video class="lesson-video" controls>` plus a moving watermark. It does not draw the lesson.

## Data

| Data | Where | Mutability |
| --- | --- | --- |
| Courses, lessons, papers, posts, FAQs | `data/gen.mjs` writes `data/catalog.json` | Edit `gen.mjs`. `predev` and `prebuild` regenerate the JSON |
| Lesson prose | `lib/notes.ts` | Hand-written for the first lesson; the rest is generated from the catalog entry |
| Lab math | `lib/labs.ts` | Pure functions, covered by `test/labs.test.ts` |
| Videos | `public/media/<course>/<slug>.mp4` | Committed. Optional regenerator: `scripts/gen-videos.mjs` |
| Accounts and progress | `localStorage` via `lib/store.tsx` | Per browser only |

`lib/catalog.ts` is the typed reader for the JSON. Tests in `test/catalog.test.ts` lock the course sizes (86 / 40 / 217) and require one video file per lesson.

## Account model

`lib/store.tsx` keeps accounts, the session, newsletter addresses, and password-reset codes in one JSON blob. Passwords are stored in that blob as plain strings. That is acceptable only because the blob never leaves the browser. Do not send it to a server without a real password design.

Plans (`free`, `monthly`, `quarterly`, `annual`, `lifetime`) are labels in that blob. Choosing one does not call a payment API.

## UI

Colors and type are CSS variables in `app/globals.css`: background `#e9e9e9`, text `#3b3854`, dark `#2f2c45`, mint `#3fe9a0`, lime `#c6f25a`. Archivo, DM Sans, DM Mono, and Newsreader load from Google Fonts in `app/layout.tsx`.

## What is deliberately missing

No database, queue, object storage, auth provider, or model host. See [DECISIONS.md](DECISIONS.md).
