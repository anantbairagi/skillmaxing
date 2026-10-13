"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Figure, type FigureKind } from "@/components/Marks";
import { LessonVideo } from "@/components/Player";
import { allLessons, courseById, findLesson, lessonKey, neighbors, papers, posts, resources, type Course } from "@/lib/catalog";
import { batchTradeoff, cacheLatency, concurrencyThroughput, labs, latencyBudget, loadBalance, tailFanout, type LabSpec } from "@/lib/labs";
import { formatClock, lessonDoc } from "@/lib/notes";
import { useStore } from "@/lib/store";

export function CourseOverview({ courseId }: { courseId: Course["id"] }) {
  const course = courseById(courseId);
  const lessons = course.modules.flatMap((mod) => mod.lessons);
  const [filter, setFilter] = useState<"all" | "free" | "code" | "walk" | "case">("all");
  const [grid, setGrid] = useState(true);
  const shown = lessons.filter((lesson) => {
    if (filter === "free") return lesson.free;
    if (filter === "code") return lesson.codeLab;
    if (filter === "walk") return lesson.kind === "walkthrough";
    if (filter === "case") return lesson.kind === "case";
    return true;
  });
  const filters: Array<["all" | "free" | "code" | "walk" | "case", string, number]> = [
    ["all", "All", lessons.length],
    ["free", "Free lessons", lessons.filter((lesson) => lesson.free).length],
    ["code", "With code", lessons.filter((lesson) => lesson.codeLab).length],
  ];
  if (courseId === "system") {
    filters.push(["walk", "Walkthroughs", lessons.filter((lesson) => lesson.kind === "walkthrough").length]);
    filters.push(["case", "Case files", lessons.filter((lesson) => lesson.kind === "case").length]);
  }
  const first = course.modules[0].lessons[0];
  return (
    <div className="cwrap cwrap-wide ov">
      <section className={`ws-hero theme-${courseId}`}>
        <div className="ws-hero-text">
          <p className="htag">{course.name}</p>
          <h1>{course.headline}</h1>
          <p className="hlede">{course.lede}</p>
          <div className="ws-hero-facts">
            <span><b>{course.modules.length}</b> modules</span>
            <span><b>{lessons.length}</b> lessons</span>
            <span><b>{lessons.length}</b> lesson videos</span>
            <span><b>{lessons.filter((lesson) => lesson.free).length}</b> free</span>
          </div>
          <div className="ws-hero-acts">
            <Link className="hbtn lime" href={`${course.path}/archive/${first.slug}/`}>Start: {first.title}</Link>
          </div>
        </div>
        <figure className="ws-hero-art"><Figure kind={courseId === "inference-eng" ? "gpu" : courseId === "system" ? "queue" : "flow"} /></figure>
      </section>
      <div className="ov-filters ws-filters">
        <div className="tabs" role="tablist" aria-label="Filter lessons">
          {filters.map(([id, label, count]) => (
            <button key={id} type="button" data-on={filter === id} onClick={() => setFilter(id)}>{label} <b>{count}</b></button>
          ))}
        </div>
        <div className="view-toggle">
          <button type="button" data-on={!grid} onClick={() => setGrid(false)}>List</button>
          <button type="button" data-on={grid} onClick={() => setGrid(true)}>Grid</button>
        </div>
      </div>
      <div>
        {course.modules.map((mod, index) => {
          const items = mod.lessons.filter((lesson) => shown.includes(lesson));
          if (!items.length) return null;
          return (
            <section key={mod.title} id={cssId(mod.title)} className="ov-module">
              <header className="ws-mod-head">
                <span className="mod-idx">{index === 0 ? "0" : String(index).padStart(2, "0")}</span>
                <div>
                  <h2>{mod.title}</h2>
                  <span className="kicker">{items.length} lessons</span>
                </div>
              </header>
              <div className={grid ? "cgrid ov-grid" : "ov-list"}>
                {items.map((lesson) => (
                  <Link key={lesson.slug} className={grid ? "lesson-card" : "lesson-row"} href={`${course.path}/archive/${lesson.slug}/`}>
                    <span className="lc-top">
                      <span className="num">{lesson.code}</span>
                      {lesson.free ? <em className="free">Free</em> : lesson.kind !== "lesson" ? <em>{lesson.kind}</em> : null}
                    </span>
                    <h3 className="lc-title">{lesson.title}</h3>
                    {grid && <span className="lc-illu"><Figure kind={figureFor(lesson.code)} /></span>}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {shown.length === 0 && <div className="empty"><h3>Nothing in this filter</h3><p>Try All to see the full path.</p></div>}
      <p className="ov-note">The free lessons are complete lessons, not teasers. Every lesson in this copy is open to watch and read. Payments are not part of this copy. <Link href={`${course.path}/archive/${first.slug}/`}>Read a free lesson</Link></p>
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
  const [openCheck, setOpenCheck] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [params.slug]);
  if (!lesson) return <p className="cwrap">That lesson is not in this catalog.</p>;
  const doc = lessonDoc(course.name, lesson.module, lesson);
  const moduleLessons = course.modules.find((mod) => mod.title === lesson.module)?.lessons ?? [];
  const place = moduleLessons.findIndex((item) => item.slug === lesson.slug) + 1;
  const key = lessonKey(courseId, lesson.slug);
  const { next } = neighbors(courseId, lesson.slug);
  const understood = store.profile?.understood.includes(key);
  const saved = store.profile?.saved.includes(key);
  const stamp = `${store.profile?.email ?? "guest"} · ${new Date().toISOString().slice(0, 10)}`;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return (
    <div className="lesson-layout">
      <div className="read-progress" style={{ width: `${progress * 100}%` }} />
      <div className="lesson-col">
        <section className="ws-lesson-head">
          <div>
            <nav className="ws-lh-crumb">
              <Link href={`${course.path}/overview/`}>{course.name}</Link>
              <span>/</span>
              <a href={`${course.path}/overview/#${cssId(lesson.module)}`}>{lesson.module}</a>
            </nav>
            <h1 className="lesson-title">{lesson.title}</h1>
            <div className="ws-lh-facts">
              <span className="ws-lh-num">{lesson.code}</span>
              <span>Lesson {place} of {moduleLessons.length}</span>
              <span>▶ {seconds == null ? "Video" : `${formatClock(seconds)} video`}</span>
              <span>{doc.readMin} min read</span>
              {lesson.free && <span className="free">Free</span>}
            </div>
          </div>
          <div className="ws-lh-art" aria-hidden="true"><Figure kind={figureFor(lesson.code)} /></div>
        </section>
        <LessonVideo title={lesson.title} src={`${base}/media/${courseId}/${lesson.slug}.mp4`} watermark={stamp} onDuration={setSeconds} />
        <article className="lesson-body panel">
          <div className="ws-notes-head">
            <b>The notes</b>
            <span>The same idea in writing, with the figures from the video.</span>
          </div>
          <div className="ws-inshort">
            <span>In one line</span>
            <p>{doc.oneLine}</p>
          </div>
          <div className="prose">
            {doc.sections.map((section, index) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <figure className="fig">
                  <Figure kind={figureFor(`${lesson.code}-${index}`)} />
                  <figcaption><span className="fig-n">Figure {index + 1}</span><b>{section.heading}</b></figcaption>
                </figure>
                {section.table && (
                  <div className="tbl-scroll">
                    <table>
                      <thead><tr>{section.table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                      <tbody>
                        {section.table.rows.map((row) => <tr key={row.join("|")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}
                      </tbody>
                    </table>
                  </div>
                )}
                {section.code && <pre className="code"><code>{section.code}</code></pre>}
              </section>
            ))}
            <h2>Try it</h2>
            <div className="tryit">{doc.tryIt.map((line) => <p key={line}>{line}</p>)}</div>
            <h2>Check yourself</h2>
            {doc.checks.map((check, index) => (
              <div key={check.q} className="check">
                <p>{check.q}</p>
                <button type="button" className="btn ghost" onClick={() => setOpenCheck(openCheck === index ? null : index)}>
                  {openCheck === index ? "Hide" : "Answer"}
                </button>
                {openCheck === index && <p className="ok">{check.a}</p>}
              </div>
            ))}
          </div>
          <div className="lesson-track">
            {store.profile ? (
              <>
                <button className="hbtn mint" type="button" onClick={() => store.toggleUnderstood(key)}>{understood ? "Understood" : "Mark as understood"}</button>
                <button className="btn ghost" type="button" onClick={() => store.toggleSaved(key)}>{saved ? "Saved" : "Save"}</button>
              </>
            ) : (
              <Link className="hbtn mint" href="/login/">Sign in to keep your place</Link>
            )}
          </div>
        </article>
        {next && (
          <nav className="lesson-pn">
            <span className="kicker">The next lesson picks up from here</span>
            <Link className="pn" href={`${course.path}/archive/${next.slug}/`}>
              <span><small>Next</small><strong>{next.code} {next.title}</strong></span>
              <span aria-hidden="true">→</span>
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}

export function ResourcesPage() {
  return (
    <div className="cwrap sheet">
      <p className="htag">Curated shelf</p>
      <h1>Docs, books and talks</h1>
      <p className="lede">A short shelf for the three tracks. Links leave this site when they point at public docs.</p>
      <div className="grid-2">
        {resources.map(([title, href, tag, dek]) => (
          <a key={title} className="card" href={href}>
            <span className="htag">{tag}</span>
            <h3>{title}</h3>
            <p className="muted">{dek}</p>
          </a>
        ))}
      </div>
    </div>
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
    <div className="sheet">
      <p className="htag">Labs</p>
      <h1>Change one number. Watch the system answer.</h1>
      <p className="lede">Every lab is a single control over a drawing that redraws as you move it. No setup, no account, nothing to install.</p>
      <div className="chips">
        {topics.map((item) => <button key={item} type="button" data-on={topic === item} onClick={() => setTopic(item)}>{item}</button>)}
      </div>
      <form className="news-form" onSubmit={(event) => event.preventDefault()}>
        <input aria-label="Search labs" placeholder="Search labs" value={q} onChange={(event) => setQ(event.target.value)} />
        <button type="submit">Search</button>
      </form>
      <div className="grid-2">
        {shown.map((lab) => (
          <Link key={lab.slug} className="card" href={`/labs/${lab.slug}/`}>
            <span className="htag">{lab.number} {lab.level} · {lab.topic}</span>
            <h2 style={{ fontSize: 28 }}>{lab.title}</h2>
            <p>{lab.dek}</p>
            <strong>Open lab</strong>
          </Link>
        ))}
      </div>
      {shown.length === 0 && <div className="empty"><h3>Nothing matches yet</h3><p>No lab has that in its title. Try a shorter word.</p></div>}
    </div>
  );
}

export function LabView() {
  const params = useParams<{ slug: string }>();
  const lab = labs.find((item) => item.slug === params.slug);
  if (!lab) return <p>That lab is not on the shelf.</p>;
  return (
    <div className="sheet">
      <p className="htag">{lab.number} · {lab.level} · {lab.topic}</p>
      <h1>{lab.title}</h1>
      <p className="lede">{lab.dek}</p>
      <LabControls lab={lab} />
      <p><Link href="/labs/">All labs</Link></p>
    </div>
  );
}

function LabControls({ lab }: { lab: LabSpec }) {
  const [a, setA] = useState(40);
  const [b, setB] = useState(30);
  const [c, setC] = useState(50);
  const [d, setD] = useState(20);
  const view = useMemo(() => compute(lab.slug, a, b, c, d), [lab.slug, a, b, c, d]);
  return (
    <div className="lab-layout">
      <div className="card">
        <p className="htag">One control</p>
        {view.controls.map((control) => (
          <label key={control.label} style={{ display: "block", marginBottom: 12 }}>
            {control.label}: <strong>{control.value}</strong>
            <input type="range" min={control.min} max={control.max} value={control.value} onChange={(event) => control.set(Number(event.target.value))} style={{ width: "100%" }} />
          </label>
        ))}
      </div>
      <div className="lab-stage">
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
    <div className="sheet">
      <p className="htag">Reading order</p>
      <h1>Papers</h1>
      <p className="lede">36 landmark papers in three tracks, sequenced so each one prepares you for the next. The briefs on this build are original study notes.</p>
      <div className="chips">
        <button type="button" data-on={track === "all"} onClick={() => setTrack("all")}>All {papers.length}</button>
        <button type="button" data-on={track === "ai"} onClick={() => setTrack("ai")}>AI research {counts.ai}</button>
        <button type="button" data-on={track === "systems"} onClick={() => setTrack("systems")}>Systems {counts.systems}</button>
        <button type="button" data-on={track === "ml"} onClick={() => setTrack("ml")}>ML math {counts.ml}</button>
      </div>
      <ol style={{ padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
        {shown.map((paper) => (
          <li key={paper.slug}>
            <Link className="paper-row" href={`/papers/${paper.slug}/`}>
              <span className="ord">{paper.order}</span>
              <span>
                <span className="htag">{paper.year} · {paper.track}</span>
                <h3>{paper.title}</h3>
                <p className="muted">{paper.authors}</p>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {shown.length === 0 && <div className="empty"><h3>Nothing in this track</h3><p>The reading order is still the full 36.</p></div>}
    </div>
  );
}

export function PaperView() {
  const params = useParams<{ slug: string }>();
  const paper = papers.find((item) => item.slug === params.slug);
  const store = useStore();
  if (!paper) return <p>That paper is not in the reading order.</p>;
  const read = store.profile?.papersRead.includes(paper.slug);
  return (
    <article className="prose sheet" style={{ maxWidth: 760 }}>
      <p className="htag">{paper.order} of {papers.length} · {paper.track}</p>
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
    <div className="sheet">
      <p className="htag">Paper calendar</p>
      <h1>Daily</h1>
      <p className="lede">One paper a day, summarised and placed in context. The order of {papers.length} papers repeats.</p>
      <article className="card">
        <span className="htag">Today · {now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" })} · Day {day}</span>
        <h2 style={{ fontSize: 36 }}>{paper.title}</h2>
        <p>{paper.brief}</p>
        <div className="row">
          <Link className="hbtn mint" href={`/papers/${paper.slug}/`}>Open the brief</Link>
          {store.profile && <button className="btn ghost" type="button" onClick={() => store.togglePaper(paper.slug)}>{store.profile.papersRead.includes(paper.slug) ? "Read" : "Mark read"}</button>}
        </div>
      </article>
      <div className="cal" aria-label="This month">
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => <b key={`${label}-${index}`} className="dow">{label}</b>)}
        {cells.map((cell, index) => (
          <b key={index} data-today={cell.date === now.toISOString().slice(0, 10)} style={{ opacity: cell.inMonth ? 1 : 0.35 }}>
            {cell.date ? Number(cell.date.slice(-2)) : ""}
          </b>
        ))}
      </div>
    </div>
  );
}

export function BlogIndex() {
  return (
    <div className="sheet">
      <p className="htag">Long reads</p>
      <h1>Blog</h1>
      <p className="lede">Longer notes written for this study build. They are not reprints.</p>
      <div className="grid-2">
        {posts.map((post) => (
          <Link key={post.slug} className="blog-card" href={`/blog/${post.slug}/`}>
            <span className="htag">{post.tag} · {post.date}</span>
            <h2 style={{ fontSize: 32 }}>{post.title}</h2>
            <p>{post.dek}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogPost() {
  const params = useParams<{ slug: string }>();
  const post = posts.find((item) => item.slug === params.slug);
  if (!post) return <p>That post is not here.</p>;
  return (
    <article className="prose sheet" style={{ maxWidth: 760 }}>
      <p className="htag">{post.tag} · {post.minutes} min · {post.author}</p>
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
    <div className="sheet">
      <p className="htag">Desk</p>
      <h1>News</h1>
      <p className="lede">A sample desk of AI-only notes, written for this build. It is not a live scrape of the reference site or of newsrooms.</p>
      <p className="kicker">Checked locally · {items.length} notes</p>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map(([title, dek, age]) => (
          <article key={title} className="news-row">
            <span className="htag">{age}</span>
            <h3>{title}</h3>
            <p className="muted">{dek}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function figureFor(value: string): FigureKind {
  const kinds: FigureKind[] = ["flow", "cache", "queue", "loop", "bars", "gpu"];
  let n = 0;
  for (const ch of value) n += ch.charCodeAt(0);
  return kinds[n % kinds.length];
}

function cssId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export const lessonSlugs = {
  "python-ai": allLessons().filter((lesson) => lesson.course.id === "python-ai").map((lesson) => lesson.slug),
  "inference-eng": allLessons().filter((lesson) => lesson.course.id === "inference-eng").map((lesson) => lesson.slug),
  system: allLessons().filter((lesson) => lesson.course.id === "system").map((lesson) => lesson.slug),
};
