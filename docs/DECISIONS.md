# Decisions

Short record of choices that later edits should not undo by accident.

## Static export, no server

The product is content and browser state. `output: "export"` lets GitHub Pages host it with no Node server to patch. Adding an API means a new host, not a route dropped into this app.

## No database

Progress, accounts, and newsletter addresses live in `localStorage`. A shared database would be a new system, with real password storage and a privacy policy that matches it. Do not “just add Postgres” inside a lesson task.

## Original lesson media

Reference-site mp4s and signed URLs are out of scope. `public/media/` holds short original files. `scripts/gen-videos.mjs` can rebuild them. It is not a dependency of CI, and it must not download reference media.

## Assistant and payments stay out

`/assistant/` and `/checkout/` exist so links do not 404. They do not call a model or a processor. Building either one is a product decision recorded here first, not a drive-by in a layout PR.

## Catalog is generated

`data/gen.mjs` is the editable course map. `data/catalog.json` is its output and is what the app imports. Change the generator, run it, and commit both.

## Demo sign-in stays in source, not in docs

The local demo account is created in `lib/store.tsx` when those credentials are used. The password is not a hosted secret, but it is still a credential. Docs name the file and the sign-in button. They do not repeat the password.

## One admin, so reviews are not required yet

Checked 2026-10-13: the only collaborator is `anantbairagi` (admin). Requiring an approving review would block every PR, because GitHub does not let the author approve their own pull request.

The ruleset `protect-main` therefore requires a pull request and the `CI / verify` check, and rejects force-pushes and deletion of `main`. It does not require a reviewer. When a second person has Write access, switch the ruleset to require one approval and turn on code-owner review. `CODEOWNERS` already names the owner so that switch is a settings change, not a new file.

Agents do not flip this setting. The owner does.

## CI check name

The required check is the job in `.github/workflows/ci.yml`. GitHub reports it as `CI / verify`. Pages deploy stays a separate workflow so a docs-only discussion is not the deploy itself, but a merge to `main` still deploys.
