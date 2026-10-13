"use client";

import Link from "next/link";
import { useState } from "react";
import { Figure } from "@/components/Marks";
import { courses, faqs, stats } from "@/lib/catalog";

const tracks = [
  ["Build AI backends in Python", "FastAPI, streaming, agents, MCP and tracing, with one support-agent project carried through 86 lessons.", "/python-ai/overview/"],
  ["Serve models fast", "Batching, KV cache, quantisation and the arithmetic of a token budget.", "/inference-eng/overview/"],
  ["Design systems that scale", "Queues, caches, sharding, and the design questions that show up in senior interviews.", "/system/overview/"],
  ["Watch a lesson", "A short video, then the same figures written down, then a check you can answer.", "/python-ai/archive/what-an-ai-backend-is/"],
];

const beyond = [
  ["01", "Interactive tools", "Labs", "Change a number, watch the system react", "/labs/"],
  ["02", "One paper a day", "Daily", "A short brief every morning", "/daily/"],
  ["03", "Draw it", "Whiteboard", "Talk through a figure, one step at a time", "/board/"],
  ["04", "Curated shelf", "Resources", "Docs, books and talks", "/system/resources/"],
  ["05", "Get hired", "Hire me", "A profile built on how you build with AI", "/hire-me/"],
  ["06", "Reading order", "Papers", "Landmark papers, in sequence", "/papers/"],
  ["07", "This week in AI", "News", "What shipped, and why it matters", "/news/"],
  ["08", "Long reads", "Blog", "Deeper write-ups", "/blog/"],
];

export function Home() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <section className="hero-grid">
        <div>
          <div className="board-preview" aria-hidden="true">
            <Figure kind="loop" />
          </div>
          <p className="kicker"><span className="live-dot" /> Live now</p>
          <h2>Whiteboard is live on Skillmaxing.</h2>
          <p>Your tutor can talk through a figure. This build draws it in the browser.</p>
          <Link className="skew mint" href="/board/"><span>Try the whiteboard</span></Link>
          <p className="muted">Lifetime on the reference includes 60 minutes a month. Here, a lifetime plan meters 60 local sessions.</p>
        </div>
        <div>
          <Link className="banner" href="/agent-harness/">
            <span><span className="kicker">New course</span> <strong>Agent harness</strong> — the loop, tools, sandboxes, evals. Coming soon.</span>
            <span>Read more →</span>
          </Link>
          <p className="kicker">Python with AI · Inference Engineering · System Design</p>
          <h1>See how agents work. Then build it.</h1>
          <p className="lede">Narrated-style notes and written figures for building AI backends in Python and designing systems that scale, with one project running through every course.</p>
          <div className="row">
            <Link className="skew" href="/python-ai/archive/what-an-ai-backend-is/"><span>Start learning free</span></Link>
            <Link className="btn ghost" href="/python-ai/archive/what-an-ai-backend-is/">Watch a lesson</Link>
          </div>
        </div>
      </section>

      <section className="section grid-4">
        {tracks.map(([title, body, href]) => (
          <Link key={title} className="card" href={href}>
            <h3>{title}</h3>
            <p className="muted">{body}</p>
            <strong>Open →</strong>
          </Link>
        ))}
      </section>

      <section className="section grid-4">
        <div className="stat"><b>{stats.lessons}</b><span className="kicker">Lessons</span></div>
        <div className="stat"><b>{stats.modules}</b><span className="kicker">Modules</span></div>
        <div className="stat"><b>{stats.walks}</b><span className="kicker">Walkthroughs</span></div>
        <div className="stat"><b>{stats.free}</b><span className="kicker">Free, start to finish</span></div>
      </section>

      <section className="section" id="course-directory">
        <p className="kicker">Courses</p>
        <h2>Three tracks, one account</h2>
        <p className="lede">All three are written the same way and share one account. The free lessons are complete lessons, not previews.</p>
        <div className="grid-3" style={{ marginTop: 16 }}>
          {courses.map((course) => {
            const count = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
            return (
              <Link key={course.id} className="card path-card" href={`${course.path}/overview/`}>
                <span className="kicker">{course.eyebrow}</span>
                <h3>{course.name}</h3>
                <p>{course.lede}</p>
                <span className="kicker">{course.modules.length} modules · {count} lessons · 5 free</span>
                <strong>Open course →</strong>
              </Link>
            );
          })}
        </div>
        <Link className="card soon" href="/agent-harness/" style={{ display: "block", marginTop: 14 }}>
          <span className="kicker">Coming soon · Agents path</span>
          <h3>Agent harness</h3>
          <p>The loop, sandboxes, permissions, evals, and shipping. Get told on launch day.</p>
        </Link>
      </section>

      <section className="section steps">
        <div>
          <p className="kicker">Inside every lesson</p>
          <h2>Every lesson is made three ways</h2>
          <p>The watch script, the notes and the exercise use the same drawing.</p>
          <ol>
            <li><h3>Watch</h3><p>A short script, with the diagram moving as the explanation moves.</p></li>
            <li><h3>Read</h3><p>The same figure in writing, numbered and honest about what breaks.</p></li>
            <li><h3>Build</h3><p>A try-it that asks for one working piece.</p></li>
          </ol>
        </div>
        <div className="card">
          <Figure kind="loop" />
          <pre className="code">{`def answer(ticket_id, message):
    history = load_history(ticket_id)
    reply = call_model(history)
    return reply`}</pre>
        </div>
      </section>

      <section className="section">
        <p className="kicker">Inside Skillmaxing</p>
        <h2>What an account actually gets you</h2>
        <div className="feature-mosaic" style={{ marginTop: 16 }}>
          <article className="card">
            <Figure kind="flow" />
            <h3>One idea, drawn once</h3>
            <p>Every lesson is built around a single drawing, shared by the watch script and the notes.</p>
          </article>
          <div className="mosaic-side">
            <article className="card"><Figure kind="bars" /><h3>36 papers, in sequence</h3><p>Each brief prepares the next paper, with a question to carry into the reading.</p></article>
            <article className="card"><Figure kind="cache" /><h3>Change a number, watch it react</h3><p>Move a cache size, a fan-out, or a timeout and read the latency that comes back.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="kicker">Beyond the courses</p>
        <h2>More ways to learn on skillmaxing.</h2>
        <div className="grid-4" style={{ marginTop: 16 }}>
          {beyond.map(([n, kicker, title, body, href]) => (
            <Link key={n} className="card" href={href}>
              <span className="kicker">{n} {kicker}</span>
              <h3>{title}</h3>
              <p className="muted">{body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <p className="kicker">Plans</p>
            <h2>One account, every course</h2>
          </div>
          <Link href="/pricing/">View full pricing</Link>
        </div>
        <div className="grid-3" style={{ marginTop: 16 }}>
          <Plan name="Monthly" price="$29" unit="/month" body="Every current course, listed here for reference. This copy does not take payment." href="/pricing/" />
          <Plan name="Annual" price="$16.58" unit="/month" body="$199 a year on the original. Lessons in this copy are already open." href="/pricing/" />
          <Plan name="Lifetime" price="$299" unit="paid once" body="Shown so the plans match. There is no checkout on this site." href="/pricing/" />
        </div>
      </section>

      <section className="section faq">
        <h2>Questions people ask before joining.</h2>
        <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
          {faqs.map(([q, a], index) => (
            <details key={q} open={open === index} onToggle={(event) => { if ((event.target as HTMLDetailsElement).open) setOpen(index); }}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section card">
        <p className="kicker">Start free</p>
        <h2>$29 for the first month</h2>
        <p>Then $29 a month, every course included. Or $299 once. Checkout here is a local plan switch: no card is charged.</p>
        <Link className="skew" href="/pricing/"><span>See pricing</span></Link>
      </section>
    </>
  );
}

function Plan({ name, price, unit, body, href }: { name: string; price: string; unit: string; body: string; href: string }) {
  return (
    <article className="card">
      <span className="kicker">{name}</span>
      <div className="price">{price} <small>{unit}</small></div>
      <p>{body}</p>
      <Link className="btn ghost" href={href}>Listed on pricing</Link>
    </article>
  );
}
