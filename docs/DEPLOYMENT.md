# Deployment

Production is GitHub Pages for https://github.com/anantbairagi/skillmaxing. There is no staging environment and no second host.

## How a deploy happens

Pushing to `main` starts `.github/workflows/pages.yml`:

1. `npm ci`
2. `npm test`
3. `npm run build` with `NEXT_PUBLIC_BASE_PATH=/skillmaxing`
4. Upload `out/` as a Pages artifact
5. `actions/deploy-pages` publishes it

The Pages API reports `build_type: workflow` and `html_url: https://anantbairagi.github.io/skillmaxing/`. HTTPS is enforced. No custom domain is set.

Pull requests run `.github/workflows/ci.yml` (`verify`): the same install, test, and build, without deploying.

## Watch a deploy

```bash
gh run list --workflow=pages.yml --limit 3
gh run watch <run-id> --exit-status
```

Then open https://anantbairagi.github.io/skillmaxing/python-ai/archive/what-an-ai-backend-is/ and confirm the page has `video.lesson-video`.

GitHub’s CDN can lag the green workflow by a minute.

## Rollback

Pages keeps previous deployments in the GitHub UI: Settings → Pages → Deployments, or:

```bash
gh api repos/anantbairagi/skillmaxing/pages/deployments
```

To roll back, revert the bad commit on a branch, merge the revert, and let `pages.yml` publish `main` again. Do not republish an old artifact by hand unless you are the owner and the workflow is broken.

There is no database migration to undo. User data is in each browser’s `localStorage`. A deploy does not change it. Changing the storage key in `lib/store.tsx` (`skillmaxing.study.v1`) orphans existing local accounts. Treat that as a breaking change and write it in the changelog.

## Environment variables in CI

The only one is `NEXT_PUBLIC_BASE_PATH=/skillmaxing`, set on the build step in `pages.yml` and `ci.yml`. It is not a secret. Do not add GitHub Actions secrets for this app unless a real external service is introduced, and do not put secret values in the workflow file.

## Local production build

```bash
npm run build
npx serve out
```

Local `out/` is built without the `/skillmaxing` prefix unless you set `NEXT_PUBLIC_BASE_PATH`. The live site always has the prefix.
