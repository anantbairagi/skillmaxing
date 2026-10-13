import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const files = {
  "app/page.tsx": "import { Home } from '@/components/Home';\nexport default function Page(){ return <Home />; }\n",
  "app/not-found.tsx": "import { NotFoundPage } from '@/components/Account';\nexport default function NotFound(){ return <NotFoundPage />; }\n",
  "app/labs/page.tsx": "import { LabsIndex } from '@/components/Learn';\nexport default function Page(){ return <LabsIndex />; }\n",
  "app/labs/[slug]/page.tsx": "import { LabView } from '@/components/Learn';\nimport { labs } from '@/lib/labs';\nexport function generateStaticParams(){ return labs.map((lab) => ({ slug: lab.slug })); }\nexport default function Page(){ return <LabView />; }\n",
  "app/papers/page.tsx": "import { PapersIndex } from '@/components/Learn';\nexport default function Page(){ return <PapersIndex />; }\n",
  "app/papers/[slug]/page.tsx": "import { PaperView } from '@/components/Learn';\nimport { papers } from '@/lib/catalog';\nexport function generateStaticParams(){ return papers.map((paper) => ({ slug: paper.slug })); }\nexport default function Page(){ return <PaperView />; }\n",
  "app/blog/page.tsx": "import { BlogIndex } from '@/components/Learn';\nexport default function Page(){ return <BlogIndex />; }\n",
  "app/blog/[slug]/page.tsx": "import { BlogPost } from '@/components/Learn';\nimport { posts } from '@/lib/catalog';\nexport function generateStaticParams(){ return posts.map((post) => ({ slug: post.slug })); }\nexport default function Page(){ return <BlogPost />; }\n",
  "app/news/page.tsx": "import { NewsPage } from '@/components/Learn';\nexport default function Page(){ return <NewsPage />; }\n",
  "app/daily/page.tsx": "import { DailyPage } from '@/components/Learn';\nexport default function Page(){ return <DailyPage />; }\n",
  "app/pricing/page.tsx": "import { PricingPage } from '@/components/Account';\nexport default function Page(){ return <PricingPage />; }\n",
  "app/hire-me/page.tsx": "import { HirePage } from '@/components/Account';\nexport default function Page(){ return <HirePage />; }\n",
  "app/board/page.tsx": "import { BoardPage } from '@/components/Account';\nexport default function Page(){ return <BoardPage />; }\n",
  "app/assistant/page.tsx": "import { AssistantPage } from '@/components/Account';\nexport default function Page(){ return <AssistantPage />; }\n",
  "app/login/page.tsx": "import { LoginForm } from '@/components/Account';\nexport default function Page(){ return <LoginForm />; }\n",
  "app/signup/page.tsx": "import { SignupForm } from '@/components/Account';\nexport default function Page(){ return <SignupForm />; }\n",
  "app/forgot-password/page.tsx": "import { ForgotForm } from '@/components/Account';\nexport default function Page(){ return <ForgotForm />; }\n",
  "app/reset-password/page.tsx": "import { ResetForm } from '@/components/Account';\nexport default function Page(){ return <ResetForm />; }\n",
  "app/dashboard/page.tsx": "import { Dashboard } from '@/components/Account';\nexport default function Page(){ return <Dashboard />; }\n",
  "app/account/page.tsx": "import { AccountPage } from '@/components/Account';\nexport default function Page(){ return <AccountPage />; }\n",
  "app/settings/page.tsx": "import { SettingsPage } from '@/components/Account';\nexport default function Page(){ return <SettingsPage />; }\n",
  "app/checkout/page.tsx": "import { CheckoutPage } from '@/components/Account';\nexport default function Page(){ return <CheckoutPage />; }\n",
  "app/terms/page.tsx": "import { Legal } from '@/components/Account';\nexport default function Page(){ return <Legal kind=\"terms\" />; }\n",
  "app/privacy/page.tsx": "import { Legal } from '@/components/Account';\nexport default function Page(){ return <Legal kind=\"privacy\" />; }\n",
  "app/refunds/page.tsx": "import { Legal } from '@/components/Account';\nexport default function Page(){ return <Legal kind=\"refunds\" />; }\n",
  "app/newsletter/page.tsx": "import { NewsletterPage } from '@/components/Account';\nexport default function Page(){ return <NewsletterPage />; }\n",
  "app/unsubscribe/page.tsx": "import { UnsubscribePage } from '@/components/Account';\nexport default function Page(){ return <UnsubscribePage />; }\n",
  "app/agent-harness/page.tsx": "import { AgentPage } from '@/components/Account';\nexport default function Page(){ return <AgentPage />; }\n",
  "app/roadmap/page.tsx": "import { SimplePage } from '@/components/Account';\nexport default function Page(){ return <SimplePage title=\"Roadmap\" body=\"Agent harness is the next course: the loop, sandboxes, evals, and traces. The three current tracks stay the work you can do today.\" href=\"/agent-harness/\" action=\"Read the preview\" />; }\n",
  "app/kiit/page.tsx": "import { SimplePage } from '@/components/Account';\nexport default function Page(){ return <SimplePage title=\"KIIT students\" body=\"On the reference product, a verified KIIT account gets the course assistant on any plan. Here, turn on the KIIT flag in settings to unlock the local assistant. It does not contact a campus directory.\" href=\"/settings/\" action=\"Open settings\" />; }\n",
  "app/styles/page.tsx": "import { StylesPage } from '@/components/Account';\nexport default function Page(){ return <StylesPage />; }\n",
  "app/python-ai/resources/page.tsx": "import { ResourcesPage } from '@/components/Learn';\nexport default function Page(){ return <ResourcesPage />; }\n",
  "app/inference-eng/resources/page.tsx": "import { ResourcesPage } from '@/components/Learn';\nexport default function Page(){ return <ResourcesPage />; }\n",
  "app/system/resources/page.tsx": "import { ResourcesPage } from '@/components/Learn';\nexport default function Page(){ return <ResourcesPage />; }\n",
};

for (const id of ["python-ai", "inference-eng", "system"]) {
  files[`app/${id}/overview/page.tsx`] = `import { CourseOverview } from '@/components/Learn';\nexport default function Page(){ return <CourseOverview courseId="${id}" />; }\n`;
  files[`app/${id}/archive/page.tsx`] = `import { ArchiveIndex } from '@/components/Learn';\nexport default function Page(){ return <ArchiveIndex courseId="${id}" />; }\n`;
  files[`app/${id}/archive/[slug]/page.tsx`] = `import { LessonView } from '@/components/Learn';\nimport { courseById, flatLessons } from '@/lib/catalog';\nexport function generateStaticParams(){ return flatLessons(courseById('${id}')).map((lesson) => ({ slug: lesson.slug })); }\nexport default function Page(){ return <LessonView courseId="${id}" />; }\n`;
}

for (const [path, body] of Object.entries(files)) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
}
console.log(Object.keys(files).length);
