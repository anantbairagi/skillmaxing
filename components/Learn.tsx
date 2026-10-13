"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Figure } from "@/components/Marks";
import { allLessons, courseById, findLesson, lessonKey, neighbors, papers, posts, resources, type Course } from "@/lib/catalog";
import { batchTradeoff, cacheLatency, concurrencyThroughput, labs, latencyBudget, loadBalance, tailFanout, type LabSpec } from "@/lib/labs";
import { lessonNote } from "@/lib/notes";
import { hasFullAccess, useStore } from "@/lib/store";

export function CourseOverview({ courseId }: { courseId: Course["id"] }) {
  const course = courseById(courseId);
  const lessons = course.modules.flatMap((mod) => mod.lessons);
  const [filter, setFilter] = useState<"all" | "free" | "code">("all");
  const [grid, setGrid] = useState(false);
  const shown = lessons.filter((lesson) => (filter === "free" ? lesson.free : filter === "code" ? lesson.codeLab : true));
  return (
    <div className="course-shell">
      <aside className="sidebar">
        <p className="kicker">{course.modules.length} modules</p>
        {course.modules.map((mod) => (
          <a key={mod.title} href={`#${cssId(mod.title)}`} className="side-link">{mod.title}<span className="pro">{mod.lessons.length}</span></a>
        ))}
      </aside>
      <div>
        <p className="kicker">{course.eyebrow}</p>
        <h1>{course.headline}</h1>
        <p className="lede">{course.lede}</p>
        <div className="row">
          <Link className="skew" href={`${course.path}/archive/${course.modules[0].lessons[0].slug}/`}><span>Start: {course.modules[0].lessons[0].title}</span></Link>
          <Link className="btn ghost" href="/login/">Sign in to keep your place</Link>
        </div>
        <div className="chips" style={{ display: "flex", gap: 8, margin: "18px 0" }}>
          <button type="button" data-on={filter === "all"} onClick={() => setFilter("all")}>All {lessons.length}</button>
          <button type="button" data-on={filter === "free"} onClick={() => setFilter("free")}>Free lessons {lessons.filter((lesson) => lesson.free).length}</button>
          <button type="button" data-on={filter === "code"} onClick={() => setFilter("code")}>With code {lessons.filter((lesson) => lesson.codeLab).length}</button>
          <button type="button" data-on={!grid} onClick={() => setGrid(false)}>List</button>
          <button type="button" data-on={grid} onClick={() => setGrid(true)}>Grid</button>
        </div>
        {course.modules.map((mod) => {
          const items = mod.lessons.filter((lesson) => shown.includes(lesson));
          if (!items.length) return null;
          return (
            <section key={mod.title} id={cssId(mod.title)} style={{ marginTop: 22 }}>
              <h2 style={{ fontSize: 28 }}>{mod.title}</h2>
              <div className={grid ? "grid-2" : ""}>
                {items.map((lesson) => (
                  <Link key={lesson.slug} className={grid ? "card" : "side-link"} href={`${course.path}/archive/${lesson.slug}/`}>
                    <span>{lesson.code} {lesson.title}</span>
                    <span className="pro">{lesson.free ? "Free" : "Pro"}{lesson.kind !== "lesson" ? ` · ${lesson.kind}` : ""}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        <p className="muted">The free lessons are complete lessons, not teasers. A paid plan on this build unlocks the rest locally. No card is charged.</p>
        <Link href={`${course.path}/resources/`}>Resources</Link>
      </div>
    </div>
  );
}

export function ArchiveIndex({ courseId }: { courseId: Course["id"] }) {
  return <CourseOverview courseId={courseId} />;
}

export function LessonView({ courseId }: { courseId: Course["id"] }) {
  const params = useParams<{ slug: string }>();
  const course = courseById(courseId);
  const lesson = findLesson(courseId, params.slug);
  const store = useStore();
  const [tab, setTab] = useState<"Watch" | "Read" | "Build">("Read");
  const [choice, setChoice] = useState<number | null>(null);
  const [listOpen, setListOpen] = useState(false);
  if (!lesson) return <p>That lesson is not in this catalog.</p>;
  const note = lessonNote(course.name, lesson.module, lesson);
  const locked = !lesson.free && !hasFullAccess(store.profile);
  const key = lessonKey(courseId, lesson.slug);
  const { prev, next } = neighbors(courseId, lesson.slug);
  const understood = store.profile?.understood.includes(key);

  return (
    <div className="course-shell">
      <button className="btn ghost mobile-only" type="button" onClick={() => setListOpen((open) => !open)}>Open the lesson list</button>
      <aside className="sidebar" data-closed={listOpen ? "false" : "true"}>
        <p className="kicker">The path</p>
        {course.modules.map((mod) => (
          <div key={mod.title}>
            <strong>{mod.title}</strong>
            {mod.lessons.map((item) => (
              <Link key={item.slug} className="side-link" data-on={item.slug === lesson.slug} href={`${course.path}/archive/${item.slug}/`}>
                <span>{item.code} {item.title}</span>
                {!item.free && <span className="pro">Pro</span>}
              </Link>
            ))}
          </div>
        ))}
      </aside>
      <article className="lesson">
        <p className="kicker">{lesson.code} · {lesson.module}{lesson.free ? " · Free" : " · Pro"}</p>
        <h1>{lesson.title}</h1>
        <div className="tabs lesson-tabs">
          {(["Watch", "Read", "Build"] as const).map((name) => (
            <button key={name} type="button" data-on={tab === name} onClick={() => setTab(name)}>{name}</button>
          ))}
        </div>
        <Figure kind={note.figure} />
        <p className="muted">{note.caption}</p>
        {tab === "Watch" && (
          <div className="prose">
            {note.watch.map((line) => <p key={line}>{line}</p>)}
            <p className="muted">The reference lesson is a narrated video. This build plays the same beats as text beside the figure.</p>
          </div>
        )}
        {tab === "Read" && (
          <div className="prose">
            <p>{note.paragraphs[0]}</p>
            {locked ? (
              <div className="lock">
                <h3>The rest of this lesson is on a paid plan</h3>
                <p>Free lessons are complete. This one continues for Monthly, Annual, Quarterly, or Lifetime. Checkout on this build only updates the plan in your browser.</p>
                <Link className="btn" href="/pricing/">See pricing</Link>
              </div>
            ) : (
              note.paragraphs.slice(1).map((line) => <p key={line}>{line}</p>)
            )}
            {!locked && note.code && <pre className="code">{note.code}</pre>}
          </div>
        )}
        {tab === "Build" && (
          <div className="prose">
            {locked ? <p>The exercise unlocks with the rest of the lesson.</p> : (
              <>
                <p>{note.tryIt}</p>
                <fieldset>
                  <legend>{note.quiz.prompt}</legend>
                  {note.quiz.choices.map((item, index) => (
                    <label key={item} style={{ display: "block", margin: "6px 0" }}>
                      <input type="radio" name="quiz" checked={choice === index} onChange={() => setChoice(index)} /> {item}
                    </label>
                  ))}
                </fieldset>
                {choice !== null && <p className={choice === note.quiz.answer ? "ok" : "error"}>{choice === note.quiz.answer ? "That is the move." : "Not that one. Make the promise explicit first."}</p>}
              </>
            )}
          </div>
        )}
        <div className="row" style={{ marginTop: 16 }}>
          {store.profile ? (
            <button className="btn" type="button" onClick={() => store.toggleUnderstood(key)}>{understood ? "Marked understood" : "Mark understood"}</button>
          ) : (
            <Link className="btn" href="/login/">Sign in to keep your place</Link>
          )}
          {store.profile && <button className="btn ghost" type="button" onClick={() => store.toggleSaved(key)}>{store.profile.saved.includes(key) ? "Saved" : "Save for later"}</button>}
          {prev && <Link href={`${course.path}/archive/${prev.slug}/`}>Previous</Link>}
          {next && <Link href={`${course.path}/archive/${next.slug}/`}>Next: {next.title}</Link>}
        </div>
      </article>
    </div>
  );
}

export function ResourcesPage() {
  return (
    <>
      <p className="kicker">Curated shelf</p>
      <h1>Docs, books and talks</h1>
      <p className="lede">A short shelf for the three tracks. Links leave this site when they point at public docs.</p>
      <div className="grid-2" style={{ marginTop: 16 }}>
        {resources.map(([title, href, tag, dek]) => (
          <a key={title} className="card" href={href}>
            <span className="kicker">{tag}</span>
            <h3>{title}</h3>
            <p className="muted">{dek}</p>
          </a>
        ))}
      </div>
    </>
  );
}

export function LabsIndex() {
  const [topic, setTopic] = useState("All");
  const [q, setQ] = useState("");
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("topic");
    if (value) setTopic(value);
  }, []);
  const topics = ["All", "Caching", "Concurrency", "Latency", "Scaling", "Throughput"];
  const shown = labs.filter((lab) => (topic === "All" || lab.topic === topic) && lab.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <h1>Change one number. Watch the system answer.</h1>
      <p className="lede">Every lab is a single control over a drawing that redraws as you move it. No setup, no account, nothing to install.</p>
      <div className="chips" style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
        {topics.map((item) => <button key={item} type="button" data-on={topic === item} onClick={() => setTopic(item)}>{item}</button>)}
      </div>
      <form className="news-form" onSubmit={(event) => event.preventDefault()} style={{ marginBottom: 16 }}>
        <input aria-label="Search labs" placeholder="Search labs" value={q} onChange={(event) => setQ(event.target.value)} />
        <button type="submit">Search</button>
      </form>
      <div className="grid-2">
        {shown.map((lab) => (
          <Link key={lab.slug} className="card" href={`/labs/${lab.slug}/`}>
            <span className="kicker">{lab.number} {lab.level} · {lab.topic}</span>
            <h2 style={{ fontSize: 28 }}>{lab.title}</h2>
            <p>{lab.dek}</p>
            <strong>Open lab</strong>
          </Link>
        ))}
        {shown.length === 0 && <p>No lab has that in its title.</p>}
      </div>
    </>
  );
}

export function LabView() {
  const params = useParams<{ slug: string }>();
  const lab = labs.find((item) => item.slug === params.slug);
  if (!lab) return <p>That lab is not on the shelf.</p>;
  return (
    <>
      <p className="kicker">{lab.number} · {lab.level} · {lab.topic}</p>
      <h1>{lab.title}</h1>
      <p className="lede">{lab.dek}</p>
      <LabControls lab={lab} />
      <p><Link href="/labs/">All labs</Link></p>
    </>
  );
}

function LabControls({ lab }: { lab: LabSpec }) {
  const [a, setA] = useState(40);
  const [b, setB] = useState(30);
  const [c, setC] = useState(50);
  const [d, setD] = useState(20);
  const view = useMemo(() => compute(lab.slug, a, b, c, d), [lab.slug, a, b, c, d]);
  return (
    <div className="lab-layout" style={{ marginTop: 18 }}>
      <div className="card">
        {view.controls.map((control) => (
          <label key={control.label} style={{ display: "block", marginBottom: 12 }}>
            {control.label}: <strong>{control.value}</strong>
            <input type="range" min={control.min} max={control.max} value={control.value} onChange={(event) => control.set(Number(event.target.value))} style={{ width: "100%" }} />
          </label>
        ))}
      </div>
      <div className="card">
        <Figure kind={view.figure} />
        <p className="price">{view.headline}</p>
        <p>{view.detail}</p>
        <div className="meter" aria-hidden="true"><span style={{ width: `${Math.min(100, view.meter)}%` }} /></div>
      </div>
    </div>
  );

  function compute(slug: string, dns: number, tls: number, app: number, db: number) {
    if (slug === "latency-budget") {
      const result = latencyBudget([dns, tls, app, db]);
      return {
        figure: "bars" as const,
        headline: `${result.total} ms`,
        detail: result.ok ? `Inside a ${200} ms budget by ${-result.over} ms.` : `Over the ${200} ms budget by ${result.over} ms.`,
        meter: (result.total / 400) * 100,
        controls: [
          { label: "DNS", value: dns, min: 1, max: 120, set: setA },
          { label: "TLS", value: tls, min: 1, max: 120, set: setB },
          { label: "App", value: app, min: 1, max: 200, set: setC },
          { label: "Database", value: db, min: 1, max: 200, set: setD },
        ],
      };
    }
    if (slug === "cache-hit-rate") {
      const result = cacheLatency(dns / 100, 2, tls);
      return {
        figure: "cache" as const,
        headline: `${result.avg.toFixed(1)} ms`,
        detail: `A hit is 2 ms and a miss is ${tls} ms. This hit rate is ${result.speedup.toFixed(2)}× faster than always missing.`,
        meter: dns,
        controls: [
          { label: "Hit rate %", value: dns, min: 0, max: 100, set: setA },
          { label: "Miss ms", value: tls, min: 5, max: 200, set: setB },
        ],
      };
    }
    if (slug === "concurrency-vs-threads") {
      const result = concurrencyThroughput(dns, tls, app);
      return {
        figure: "queue" as const,
        headline: `${result.rps.toFixed(1)} rps`,
        detail: `${result.waiting} requests wait. Utilization is ${(result.util * 100).toFixed(0)}% of ${app} workers.`,
        meter: result.util * 100,
        controls: [
          { label: "Concurrency", value: dns, min: 1, max: 64, set: setA },
          { label: "Work ms", value: tls, min: 5, max: 200, set: setB },
          { label: "Workers", value: app, min: 1, max: 32, set: setC },
        ],
      };
    }
    if (slug === "load-balancer-fanout") {
      const result = loadBalance(dns, tls, app);
      return {
        figure: "queue" as const,
        headline: result.saturated ? "Queue grows" : `${result.response?.toFixed(0)} ms`,
        detail: result.saturated ? `Arrival ${tls} rps is past capacity ${result.capacity.toFixed(1)} rps.` : `Utilization ${(result.util * 100).toFixed(0)}%. Capacity ${result.capacity.toFixed(1)} rps.`,
        meter: Math.min(100, result.util * 100),
        controls: [
          { label: "Servers", value: dns, min: 1, max: 12, set: setA },
          { label: "Arrival rps", value: tls, min: 1, max: 200, set: setB },
          { label: "Service ms", value: app, min: 5, max: 100, set: setC },
        ],
      };
    }
    if (slug === "batching-tradeoff") {
      const result = batchTradeoff(dns, tls, app);
      return {
        figure: "bars" as const,
        headline: `${result.latency.toFixed(1)} ms`,
        detail: `${result.perRow.toFixed(2)} ms per row. Startup is paid once; each extra row adds ${app} µs.`,
        meter: Math.min(100, result.latency),
        controls: [
          { label: "Batch", value: dns, min: 1, max: 128, set: setA },
          { label: "Startup ms", value: tls, min: 1, max: 40, set: setB },
          { label: "Row µs", value: app, min: 10, max: 500, set: setC },
        ],
      };
    }
    const result = tailFanout(dns, tls, app);
    return {
      figure: "bars" as const,
      headline: `${result.expectedMax.toFixed(0)} ms`,
      detail: `Expected slowest of ${dns}. The penalty over one call is ${result.penalty.toFixed(0)} ms.`,
      meter: Math.min(100, result.expectedMax / 4),
      controls: [
        { label: "Fan-out", value: dns, min: 1, max: 30, set: setA },
        { label: "Base ms", value: tls, min: 5, max: 80, set: setB },
        { label: "Sigma", value: app, min: 1, max: 40, set: setC },
      ],
    };
  }
}

export function PapersIndex() {
  const [track, setTrack] = useState<"all" | "ai" | "systems" | "ml">("all");
  const counts = { ai: papers.filter((paper) => paper.track === "ai").length, systems: papers.filter((paper) => paper.track === "systems").length, ml: papers.filter((paper) => paper.track === "ml").length };
  const shown = papers.filter((paper) => track === "all" || paper.track === track);
  return (
    <>
      <p className="kicker">Reading order</p>
      <h1>Papers</h1>
      <p className="lede">36 landmark papers in three tracks, sequenced so each one prepares you for the next. The briefs on this build are original study notes.</p>
      <div className="chips" style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <button type="button" data-on={track === "all"} onClick={() => setTrack("all")}>All {papers.length}</button>
        <button type="button" data-on={track === "ai"} onClick={() => setTrack("ai")}>AI research {counts.ai}</button>
        <button type="button" data-on={track === "systems"} onClick={() => setTrack("systems")}>Systems {counts.systems}</button>
        <button type="button" data-on={track === "ml"} onClick={() => setTrack("ml")}>ML math {counts.ml}</button>
      </div>
      <ol className="grid-2" style={{ padding: 0, listStyle: "none" }}>
        {shown.map((paper) => (
          <li key={paper.slug} className="card">
            <span className="kicker">{paper.order} · {paper.year} · {paper.track}</span>
            <h3><Link href={`/papers/${paper.slug}/`}>{paper.title}</Link></h3>
            <p className="muted">{paper.authors}</p>
            <Link href={`/papers/${paper.slug}/`}>Brief</Link>
          </li>
        ))}
      </ol>
    </>
  );
}

export function PaperView() {
  const params = useParams<{ slug: string }>();
  const paper = papers.find((item) => item.slug === params.slug);
  const store = useStore();
  if (!paper) return <p>That paper is not in the reading order.</p>;
  const read = store.profile?.papersRead.includes(paper.slug);
  return (
    <article className="prose" style={{ maxWidth: 760 }}>
      <p className="kicker">{paper.order} of {papers.length} · {paper.track}</p>
      <h1>{paper.title}</h1>
      <p className="muted">{paper.authors} · {paper.year}</p>
      <p>{paper.brief}</p>
      <h2 style={{ fontSize: 32 }}>While you read</h2>
      <p>{paper.question}</p>
      <p className="muted">This is a study brief, not a substitute for the paper and not a copy of anyone else's summary.</p>
      {store.profile ? (
        <button className="btn" type="button" onClick={() => store.togglePaper(paper.slug)}>{read ? "Marked read" : "Mark read"}</button>
      ) : <Link className="btn" href="/login/">Sign in to track reading</Link>}
      <p><Link href="/papers/">Back to the order</Link></p>
    </article>
  );
}

export function DailyPage() {
  const store = useStore();
  const start = Date.UTC(2026, 7, 1);
  const now = new Date();
  const day = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - start) / 86400000) + 1;
  const paper = papers[(Math.max(day, 1) - 1) % papers.length];
  const month = new Date(now.getFullYear(), now.getMonth(), 1);
  const cells: Array<{ date: string; inMonth: boolean }> = [];
  const offset = month.getDay();
  for (let i = 0; i < offset; i += 1) cells.push({ date: "", inMonth: false });
  const count = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= count; i += 1) cells.push({ date: new Date(now.getFullYear(), now.getMonth(), i).toISOString().slice(0, 10), inMonth: true });
  return (
    <>
      <p className="kicker">Paper calendar</p>
      <h1>Daily</h1>
      <p className="lede">One paper a day, summarised and placed in context. The order of {papers.length} papers repeats.</p>
      <article className="card">
        <span className="kicker">Today · {now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })} · Day {day}</span>
        <h2 style={{ fontSize: 36 }}>{paper.title}</h2>
        <p>{paper.brief}</p>
        <div className="row">
          <Link className="btn" href={`/papers/${paper.slug}/`}>Open the brief</Link>
          {store.profile && <button className="btn ghost" type="button" onClick={() => store.togglePaper(paper.slug)}>{store.profile.papersRead.includes(paper.slug) ? "Read" : "Mark read"}</button>}
        </div>
      </article>
      <div className="grid-4" style={{ marginTop: 16 }}>
        {cells.map((cell, index) => (
          <div key={index} className="card" style={{ opacity: cell.inMonth ? 1 : 0.35, minHeight: 64 }}>
            {cell.date ? Number(cell.date.slice(-2)) : ""}
          </div>
        ))}
      </div>
    </>
  );
}

export function BlogIndex() {
  return (
    <>
      <h1>Blog</h1>
      <p className="lede">Longer notes written for this study build. They are not reprints.</p>
      <div className="grid-2">
        {posts.map((post) => (
          <Link key={post.slug} className="card" href={`/blog/${post.slug}/`}>
            <span className="kicker">{post.tag} · {post.date}</span>
            <h2 style={{ fontSize: 32 }}>{post.title}</h2>
            <p>{post.dek}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

export function BlogPost() {
  const params = useParams<{ slug: string }>();
  const post = posts.find((item) => item.slug === params.slug);
  if (!post) return <p>That post is not here.</p>;
  return (
    <article className="prose" style={{ maxWidth: 760 }}>
      <p className="kicker">{post.tag} · {post.minutes} min · {post.author}</p>
      <h1>{post.title}</h1>
      <p className="lede">{post.dek}</p>
      {post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <Link href="/blog/">All posts</Link>
    </article>
  );
}

export function NewsPage() {
  const items = [
    ["Frontier models keep showing up as product surfaces", "A release matters here when it changes latency, context, or the tool-use loop.", "6h"],
    ["Voice interfaces are still waiting on turn-taking", "Speech products fail in the pause. The serving budget is the conversation.", "9h"],
    ["On-device and hosted models are a routing choice", "Local models win on privacy and short prompts. Hosted models win when quality is the product.", "14h"],
    ["Data-center power is now part of the design doc", "A serving plan that ignores energy and the neighborhood is an incomplete capacity plan.", "1d"],
    ["Agent products are growing a permission layer", "The interesting ship is the sandbox, the approval step, and the trace after a bad run.", "1d"],
    ["Eval sets are leaving the notebook", "A regression you can point at in a trace beats a vibe check.", "2d"],
    ["Chip diversity is a portability problem", "A stack tied to one vendor's kernels meets the second vendor when capacity gets tight.", "2d"],
    ["Long context does not remove retrieval", "A bigger window changes the cutoff. It does not make stale documents fresh.", "3d"],
  ];
  return (
    <>
      <h1>News</h1>
      <p className="lede">A sample desk of AI-only notes, written for this build. It is not a live scrape of the reference site or of newsrooms.</p>
      <p className="kicker">Checked locally · {items.length} notes</p>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map(([title, dek, age]) => (
          <article key={title} className="card">
            <span className="kicker">{age}</span>
            <h3>{title}</h3>
            <p className="muted">{dek}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function cssId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export const lessonSlugs = {
  "python-ai": allLessons().filter((lesson) => lesson.course.id === "python-ai").map((lesson) => lesson.slug),
  "inference-eng": allLessons().filter((lesson) => lesson.course.id === "inference-eng").map((lesson) => lesson.slug),
  system: allLessons().filter((lesson) => lesson.course.id === "system").map((lesson) => lesson.slug),
};
