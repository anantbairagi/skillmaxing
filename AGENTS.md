# AGENTS.md

Mandatory rulebook for every human and every coding agent (Cursor, Claude Code, Codex, Copilot, or anything else) working in this repository. If a tool-specific file disagrees with this document, this document wins.

Read this file before changing code. Then read the one doc that matches the task:

| Task | Read |
| --- | --- |
| What the product is and how to get access | [PRODUCT_HANDOFF.md](PRODUCT_HANDOFF.md) |
| How the app is built | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Local commands and tests | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| Hosting and rollback | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| What is actually shipped | [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) |
| Why a choice was made | [docs/DECISIONS.md](docs/DECISIONS.md) |

## Current product

Skillmaxing study build: a static Next.js site that mirrors the learning product at a visual and catalog level. Three courses (86 / 40 / 217 lessons), labs, papers, daily, blog, news, and a browser-local account. There is no server, no database, and no hosted API.

Do not add these, unless the owner changes [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) first:

- Course assistant, Ask AI, or quiz-me chat
- Checkout, card charges, tax, or a billing provider
- The reference site’s lesson mp4s, signed media URLs, or account data

Lesson videos in `public/media/` are original files committed in git. Notes in `lib/notes.ts` are original.

## Rules

1. Read this file and the relevant doc above before editing.
2. Inspect the tree you are on. Do not assume another agent’s branch is merged. `git status`, `git pull`, and open PRs are the source of truth.
3. Do not overwrite or discard another person’s commits, stashes, or uncommitted files.
4. Match existing names and layout. UI tokens live in `app/globals.css`. Routes live under `app/`. Shared UI lives in `components/`.
5. Use a branch: `feat/`, `fix/`, `docs/`, or `chore/` plus a short name. Do not commit to `main`.
6. One branch, one task. If you find an open PR or issue touching the same files, stop and coordinate instead of editing those files.
7. Before you finish, update every doc this change makes stale, including this file when architecture, conventions, or doc links change.
8. Describe the merged code, not a plan. If it is not in the tree, it is not shipped.
9. Record architecture, catalog, env, or dependency changes in [docs/DECISIONS.md](docs/DECISIONS.md) and [docs/CHANGELOG.md](docs/CHANGELOG.md).
10. Run `npm test` and, for UI or route changes, `npm run build`. Say what you could not run.
11. In the PR, list unfinished work, known issues, and follow-ups.
12. No secrets in source, docs, or git history. Local demo sign-in is a client constant in `lib/store.tsx`. Do not copy that password into Markdown, issues, or logs.

## Collaboration

- Claim work with a GitHub issue or a PR that states scope, branch, and status.
- Sync with `origin/main` before you start and again before you open or update the PR.
- Do not push to someone else’s branch unless they asked.
- Do not force-push `main`. Do not bypass the ruleset, even if GitHub lets an admin do it.
- Merge via pull request after `verify` is green. Review is requested from the owner. A second maintainer is not required yet, because the repo has one admin. See [docs/DECISIONS.md](docs/DECISIONS.md).

## Definition of done

- The change is on its own branch and the PR describes the behavior.
- `npm test` passes.
- Docs listed above match the code you touched.
- No new secret, reference-site media URL, assistant, or payment integration.
- Known gaps are written in the PR, not left implied.

## Repo map

```
app/                routes (static export)
components/         Chrome, Home, Learn, Player, Account, Marks
lib/                catalog, notes, labs, browser store
data/gen.mjs        writes data/catalog.json
public/media/       one original mp4 per lesson
test/               node:test
.github/workflows/  CI on pull requests, Pages on main
```
