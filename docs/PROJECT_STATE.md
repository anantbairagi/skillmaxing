# Project state

Verified against `main` as of the handoff on 2026-10-13. If this file disagrees with the code, the code wins and this file should be corrected.

## Shipped

- Marketing home aligned with the reference layout: ticker, nav, skewed buttons, whiteboard column, blue band, four cards, stat rail, path cards, watch/read/build, mosaic, eight links, three plans, FAQ, footer.
- Catalog: Python with AI 15 modules / 86 lessons, Inference Engineering 9 / 40, System Design 31 / 217. Papers: 36, in generator order.
- Lesson shell: course bar, path sidebar, drawer under 1100px. Native video, pale stage, moving watermark, notes, try-it, check-yourself.
- One original mp4 per lesson under `public/media/`.
- Labs (6) with working controls. Papers, daily calendar, blog (4), sample news.
- Browser account: sign-in, dashboard progress and streak, settings, hire-me profile, local password reset code.
- Static deploy on GitHub Pages.

## Not shipped

- Course assistant, Ask AI, quiz-me. `/assistant/` explains that it is absent.
- Payments. `/checkout/` does not charge a card. Plan changes are local labels.
- Reference-site lesson files, signed URLs, and account data. This app does not call skillmaxing.xyz.
- Live news wire, email delivery, admin tools.
- Staging environment. Production and local are the only environments.

## Known limits

- Lesson videos are about eight seconds. They show the lesson code and title. They are not narrated course recordings.
- Notes for lessons other than `what-an-ai-backend-is` are generated in `lib/notes.ts`, not hand-edited.
- Account passwords sit in `localStorage` as plain text. They never leave the machine. That is not a design to copy onto a server.
- `main` protection: a ruleset named `protect-main` is the intended enforcement (pull request required, `CI / verify` required, no force-push, no deletion). Confirm it with `gh api repos/anantbairagi/skillmaxing/rulesets`. Approving reviews are not required while there is only one admin.
- The local demo password lives in `lib/store.tsx`. It is not a production credential.

## Active work

No feature branch is the assigned next task. New work starts with an issue or a PR that names its branch.
