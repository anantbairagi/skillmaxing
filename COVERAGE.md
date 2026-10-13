# Coverage

Study build of skillmaxing.xyz. Lesson prose, blog posts, and the news desk are original. The reference password is not stored. Lesson videos are original files generated for this copy.

## Implemented

| Area | Status |
| --- | --- |
| Home | Ticker, mono nav, skewed buttons, whiteboard column, blue headline band, four cards, stat rail, path cards, watch/read/build band, account mosaic, eight ways, three plans, FAQ, closing band, footer |
| Python with AI, 15 modules, 86 lessons, 5 free, 78 with code | Catalog matches |
| Inference Engineering, 9 modules, 40 lessons, 5 free, 21 with code | Catalog matches |
| System Design, 31 modules, 217 lessons, 5 free, 5 case files | 32 walkthroughs. Overview filters include Walkthroughs and Case files |
| Lesson page | Course shell with path sidebar (drawer under 1100px). White head card, native `<video class="lesson-video" controls>` on a pale stage, moving `email · date` watermark, notes panel |
| Payments and the course assistant | Left out |
| Labs (6), with live controls | Cache lab checked: 90% hit rate reads 4.8 ms |
| Papers (36), daily calendar, blog (4), sample news | Restyled panels and mono labels. Paper order unchanged |
| Dashboard, settings, account, hire profile | Progress, streak, and continue cards. Reset code still local |
| Sign-in | Local demo `abairagi.driptiv@gmail.com` / `study-local` |

## Checked in the browser

- Home at desktop width against skillmaxing.xyz: two-column tease, sky band, four cards, stat rail
- Lesson URL loaded directly: real video with native controls, watermark `abairagi.driptiv@gmail.com · 2026-10-13`, notes, Answer
- Phone width: Lessons opens the path drawer; the video column fits
- Demo sign-in, then the same lesson after a fresh load
- Cache lab slider
- System Design filters: All, Free lessons, With code 40, Walkthroughs 32, Case files 5

## Not carried over

- The reference site’s lesson mp4s and signed media URLs. Each lesson has its own short original video in `public/media`
- Course assistant, Ask AI, and quiz-me chat
- Dodo Payments, tax invoices, and checkout
- Live AI news wire and X posts
- Admin
- Reference-site account data. This app does not call it
