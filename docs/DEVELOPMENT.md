# Development

## Setup

Node.js 22 and npm. From a clean clone:

```bash
npm ci
npm test
npm run dev
```

The dev server prints a local URL, usually http://localhost:3000/. The first run executes `data/gen.mjs`, which rewrites `data/catalog.json` if the generator output changed. Commit that JSON when you change the generator.

## Commands

| Command | Effect |
| --- | --- |
| `npm test` | Catalog counts, one video per lesson, lab math, required docs |
| `npm run dev` | Next.js dev server |
| `npm run build` | Static export in `out/` |
| `node scripts/gen-videos.mjs` | Optional. Regenerates mp4s. Not part of CI. Needs `ffmpeg-static` installed where the script looks, and a Windows font path. Do not run it unless you intend to replace committed videos |

## Environment

Only `NEXT_PUBLIC_BASE_PATH`. Empty locally. `/skillmaxing` for GitHub Pages. Names are in `.env.example`. No other variables are read.

## Branches and pull requests

1. Update `main`: `git checkout main && git pull`.
2. Branch: `feat/short-name`, `fix/short-name`, `docs/short-name`, or `chore/short-name`.
3. Look at open PRs and issues. If they touch the same files, comment there instead of starting a second edit.
4. Commit on that branch. Do not commit on `main`.
5. Open a pull request. The template is the checklist.
6. Wait for the `CI / verify` check. Fix failures on the same branch.
7. Merge the PR. Do not force-push `main`.

If two branches edit the same lines, rebase or merge `main` into the feature branch and resolve the conflict there. Do not resolve it by deleting the other branch.

## Tests to add

Put behavior tests next to `test/catalog.test.ts` and `test/labs.test.ts`, and add the file to the `test` script in `package.json`. CI runs `npm test` and a production build.

## Definition of done

Matches [AGENTS.md](../AGENTS.md): tests pass, docs that describe the change are updated, and the PR lists anything left unfinished.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Lesson video 404 locally | `public/media/<course>/<slug>.mp4` exists. `npm test` asserts this |
| Video 404 on the live site only | `src` must start with `/skillmaxing` when `NEXT_PUBLIC_BASE_PATH` is set |
| Port already in use | `npm run dev -- --port 3477` |
| `data/catalog.json` shows as modified after dev | You changed `data/gen.mjs`, or line endings differ. Diff it before committing |
| Sign-in state looks empty | It is `localStorage` on that origin. localhost and GitHub Pages do not share it |
