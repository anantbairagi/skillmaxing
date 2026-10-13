# Skillmaxing study build

An independent, working study build of the Skillmaxing learning product: three course tracks, labs, a paper calendar, a local account, and a simulated checkout. Lesson notes, blog posts, and news items are original. Narrated videos, payment processing, and the hosted course model are not connected.

## Local demo account

Sign in with:

- Email: `abairagi.driptiv@gmail.com`
- Password: `study-local`

Or use **Use local demo account** on the sign-in page. Progress stays in this browser's `localStorage`. The reference site password is not stored in this project.

## Scripts

```bash
npm install
npm test
npm run dev
npm run build
```

`npm run build` writes a static site to `out/`. Set `NEXT_PUBLIC_BASE_PATH` when the site is hosted under a subpath, such as `/skillmaxing` on GitHub Pages.

## What is real here

- Course maps for Python with AI (86), Inference Engineering (40), and System Design (217)
- Free lessons in full, and a local plan switch that unlocks the rest
- Six interactive labs
- Search, dashboard, streaks, bookmarks, papers, daily brief, assistant, and whiteboard sessions

## What is simulated

- Checkout does not charge a card
- The assistant answers from the catalog in the browser
- The whiteboard draws a short scripted lesson
- Password reset shows a code on screen because there is no mail server
- News is a sample desk, not a live wire
