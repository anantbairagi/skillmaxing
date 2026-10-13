# Skillmaxing study build

Static study site for three engineering courses, labs, papers, and a browser-local account. The visual reference is [skillmaxing.xyz](https://skillmaxing.xyz/). Lesson text and lesson videos in this repo are original.

Live site: https://anantbairagi.github.io/skillmaxing/

New teammate: start with [PRODUCT_HANDOFF.md](PRODUCT_HANDOFF.md).

AI agents: [AGENTS.md](AGENTS.md) is required before any edit.

## Run it

Node.js 22.

```bash
npm ci
npm test
npm run dev
```

Open http://localhost:3000/. Sign in with **Use local demo account** on `/login/`. Progress stays in this browser. Details and the production path prefix are in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## What is in the box

- Python with AI (86), Inference Engineering (40), System Design (217)
- A native lesson video and original notes on every lesson
- Six labs, 36 papers, daily brief, blog, sample news
- Dashboard, settings, and a local plan label

Not included: the course assistant, quiz chat, and card payments. See [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md).

## Change the site

Branch from `main`, open a pull request, and wait for `CI / verify`. Do not push to `main`. [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) has the branch names and the definition of done.
