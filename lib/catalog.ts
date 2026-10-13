import catalogJson from "@/data/catalog.json";

export type LessonKind = "lesson" | "walkthrough" | "case";

export type Lesson = {
  code: string;
  title: string;
  slug: string;
  free: boolean;
  codeLab: boolean;
  kind: LessonKind;
};

export type Module = { title: string; lessons: Lesson[] };

export type Course = {
  id: "python-ai" | "inference-eng" | "system";
  path: string;
  name: string;
  eyebrow: string;
  headline: string;
  lede: string;
  modules: Module[];
};

export type Paper = {
  slug: string;
  track: "ai" | "systems" | "ml";
  title: string;
  authors: string;
  year: number;
  brief: string;
  order: number;
  question: string;
};

export type Post = {
  slug: string;
  tag: string;
  title: string;
  dek: string;
  date: string;
  author: string;
  minutes: number;
  body: string[];
};

export type NewsItem = { title: string; dek: string; age: string };
export type Resource = [string, string, string, string];
export type Faq = [string, string];

type Catalog = {
  courses: Course[];
  papers: Paper[];
  posts: Post[];
  news: NewsItem[];
  resources: Resource[];
  faqs: Faq[];
};

export const catalog = catalogJson as Catalog;
export const courses = catalog.courses;
export const papers = catalog.papers;
export const posts = catalog.posts;
export const news = catalog.news;
export const resources = catalog.resources;
export const faqs = catalog.faqs;

export function courseById(id: string) {
  const course = courses.find((item) => item.id === id);
  if (!course) throw new Error(`Unknown course ${id}`);
  return course;
}

export function flatLessons(course: Course) {
  return course.modules.flatMap((mod) => mod.lessons.map((lesson) => ({ ...lesson, module: mod.title, course })));
}

export function allLessons() {
  return courses.flatMap((course) => flatLessons(course));
}

export function findLesson(courseId: string, slug: string) {
  return flatLessons(courseById(courseId)).find((lesson) => lesson.slug === slug) ?? null;
}

export function lessonKey(courseId: string, slug: string) {
  return `${courseId}:${slug}`;
}

export function neighbors(courseId: string, slug: string) {
  const list = flatLessons(courseById(courseId));
  const index = list.findIndex((lesson) => lesson.slug === slug);
  return { prev: index > 0 ? list[index - 1] : null, next: index >= 0 ? list[index + 1] ?? null : null, index };
}

export const stats = {
  lessons: allLessons().length,
  free: allLessons().filter((lesson) => lesson.free).length,
  code: allLessons().filter((lesson) => lesson.codeLab).length,
  walks: allLessons().filter((lesson) => lesson.kind === "walkthrough").length,
  cases: allLessons().filter((lesson) => lesson.kind === "case").length,
  modules: courses.reduce((sum, course) => sum + course.modules.length, 0),
  papers: papers.length,
};

export type SearchGroup = "Python with AI" | "Inference Engineering" | "System Design" | "Papers" | "Daily" | "Labs" | "Tools";

export type SearchHit = { title: string; href: string; group: SearchGroup; hint: string };

export function searchIndex(labTitles: { title: string; slug: string; topic: string }[]): SearchHit[] {
  const hits: SearchHit[] = [];
  for (const course of courses) {
    const group: SearchGroup =
      course.id === "python-ai" ? "Python with AI" : course.id === "inference-eng" ? "Inference Engineering" : "System Design";
    for (const lesson of flatLessons(course)) {
      hits.push({
        title: lesson.title,
        href: `${course.path}/archive/${lesson.slug}/`,
        group,
        hint: `${lesson.code} · ${lesson.module}`,
      });
    }
  }
  for (const paper of papers) {
    hits.push({ title: paper.title, href: `/papers/${paper.slug}/`, group: "Papers", hint: `${paper.year} · ${paper.authors}` });
    hits.push({ title: paper.title, href: `/daily/`, group: "Daily", hint: `Reading order ${paper.order}` });
  }
  for (const lab of labTitles) {
    hits.push({ title: lab.title, href: `/labs/${lab.slug}/`, group: "Labs", hint: lab.topic });
  }
  hits.push(
    { title: "Pricing", href: "/pricing/", group: "Tools", hint: "Plans" },
    { title: "Whiteboard", href: "/board/", group: "Tools", hint: "Tutor" },
    { title: "Dashboard", href: "/dashboard/", group: "Tools", hint: "Progress" },
  );
  return hits;
}
