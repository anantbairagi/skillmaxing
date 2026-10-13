"use client";

import Link from "next/link";
import { useState } from "react";
import { Figure } from "@/components/Marks";
import { courses, faqs, stats } from "@/lib/catalog";

const skyCards = [
  ["theme-python", "flow", "Build AI backends in Python", "FastAPI, streaming, agents, MCP and tracing, with one support-agent project carried through 86 lessons.", "Open the course →", "/python-ai/overview/"],
  ["theme-inference", "gpu", "Serve models fast", "Batching, KV cache, quantisation and the arithmetic of a token budget, measured on real hardware.", "Open the course →", "/inference-eng/overview/"],
  ["theme-system", "queue", "Design systems that scale", "Queues, caches, sharding, and the design questions reported from interviews at Amazon, Google and Stripe.", "Open the course →", "/system/overview/"],
  ["theme-watch", "bars", "Watch a lesson", "A short original video, the same idea in the notes, and a check you answer yourself.", "Open the lesson →", "/python-ai/archive/what-an-ai-backend-is/"],
] as const;

const paths = [
  { id: "python-ai", theme: "theme-python", kind: "flow" as const, points: ["Python 3.14, FastAPI, Pydantic", "Agents SDK, LangGraph, MCP", "Langfuse tracing and deployment"] },
  { id: "system", theme: "theme-system", kind: "queue" as const, points: ["Notes and case studies", "From-scratch implementations", "Built for senior interviews"] },
  { id: "inference-eng", theme: "theme-inference", kind: "gpu" as const, points: ["GPUs, KV cache and batching math", "Quantization, speculation, parallelism", "Autoscaling and production serving"] },
];

const spots = [
  ["One figure", "One idea, drawn once", "Every lesson is built around a single drawing. The notes use the same figure the video moves.", "flow"],
  ["One lesson", "Three ways through the same thing", "A short video, the written version, and a try-it that adds one piece to the project you are carrying.", "ways"],
  ["Reading order", "36 papers, in sequence", "Landmark papers ordered so each one prepares you for the next, with a question to keep while you read.", "papers"],
  ["One a day", "A brief every morning", "Ten focused minutes on one paper. Mark it read and the calendar fills in behind you.", "days"],
  ["Your dashboard", "Everything you finish, counted", "Mark a lesson understood and it lands here with the date, the streak, and the next lesson.", "dash"],
  ["Interactive", "Change a number, watch it react", "Move one control — a cache size, a fan-out, a timeout — and watch the latency answer.", "lab"],
] as const;

const beyond = [
  ["01", "Interactive tools", "Labs", "Change a number, watch the system react", "/labs/"],
  ["02", "One paper a day", "Daily", "A short brief every morning", "/daily/"],
  ["03", "Not in this copy", "Course assistant", "Lessons still include a video, notes, and a check you answer yourself.", "/assistant/"],
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
      <div className="hframe">
        <section className="hsec tease">
          <div className="tease-grid">
            <div className="tease-film" aria-hidden="true">
              <div className="board-top"><span>Whiteboard</span><span>Relay</span></div>
              <div className="board-paper">
                <p>One request, one token.</p>
                <Figure kind="flow" />
                <p className="board-note">Tokens drip back in at a steady rate.</p>
              </div>
            </div>
            <div className="tease-copy">
              <p className="livenow"><i /> Live now</p>
              <h2>Whiteboard is live on Skillmaxing.</h2>
              <p>A session that draws the figure as it explains. This build does it in the browser.</p>
              <div className="tease-acts">
                <Link className="hbtn mint" href="/board/">Try the whiteboard</Link>
              </div>
              <p className="tease-note">Comes with Lifetime: 60 minutes of lessons every month. Here, a lifetime plan meters 60 local sessions.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="hframe">
        <Link className="soon-bar" href="/agent-harness/">
          <span className="htag">New course</span>
          <span className="soon-bar-text"><b>Agent harness</b> build agents that survive production: the loop, tools, sandboxes, evals. Coming soon; every account is told on launch day.</span>
          <span className="soon-bar-go">Read more →</span>
        </Link>
      </div>

      <div className="hframe">
        <section className="sky">
          <div className="sky-head">
            <p className="htag">Python with AI · Inference Engineering · System Design</p>
            <h1>See how agents work. Then build it.</h1>
            <p className="hlede">Narrated, animated lessons and written notes for building AI backends in Python and designing systems that scale, with one real project running through every course.</p>
            <div className="hacts">
              <Link className="hbtn lime" href="/python-ai/archive/what-an-ai-backend-is/">Start learning free</Link>
              <Link className="hbtn light" href="/python-ai/archive/what-an-ai-backend-is/">Watch a lesson</Link>
            </div>
          </div>
          <div className="sky-cards">
            {skyCards.map(([theme, kind, title, body, go, href]) => (
              <Link key={title} className={`sky-card ${theme}`} href={href}>
                <figure><Figure kind={kind} /></figure>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className="go">{go}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="hframe">
        <div className="rail" aria-label="Course totals">
          <div className="axis">
            <div className="m"><s /><div className="v">{stats.lessons}</div><div className="k">Lessons</div></div>
            <div className="m"><s /><div className="v">{stats.lessons}</div><div className="k">Lesson videos</div></div>
            <div className="m"><s /><div className="v">{stats.modules}</div><div className="k">Modules</div></div>
            <div className="m free"><s /><div className="v">{stats.free}</div><div className="k">Free, start to finish</div></div>
          </div>
        </div>
      </div>

      <div className="ticker rev" aria-hidden="true">
        <div className="ticker-track">
          {Array.from({ length: 2 }).map((_, copy) => (
            <span key={copy}>{Array.from({ length: 8 }).map((__, i) => <span key={i}>WATCH · READ · BUILD · TRACE · SHIP ·&nbsp;&nbsp;</span>)}</span>
          ))}
        </div>
      </div>

      <div className="hframe">
        <section className="hsec paths" id="course-directory">
          <p className="htag">Courses</p>
          <h2>Three tracks, one account</h2>
          <p className="h2sub">All three are written the same way and share one account. The free lessons are complete lessons, not previews.</p>
          <div className="cc-grid">
            {paths.map((path) => {
              const course = courses.find((item) => item.id === path.id)!;
              const count = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
              return (
                <Link key={path.id} className={`cc-card ${path.theme}`} href={`${course.path}/overview/`}>
                  <figure className="cc-art"><Figure kind={path.kind} /></figure>
                  <div className="cc-body">
                    <span className="htag">{course.eyebrow}</span>
                    <h3>{course.name}</h3>
                    <ul>{path.points.map((point) => <li key={point}>{point}</li>)}</ul>
                    <div className="cc-meta">{course.modules.length} modules · {count} lessons · 5 free</div>
                    <div className="cc-go">Open course →</div>
                  </div>
                </Link>
              );
            })}
            <Link className="cc-card theme-harness soon" href="/agent-harness/">
              <figure className="cc-art"><Figure kind="loop" /></figure>
              <div className="cc-body">
                <span className="htag">Coming soon · Agents path</span>
                <h3>Agent harness</h3>
                <ul>
                  <li>The loop: planner, tools, memory, stop rules</li>
                  <li>Sandboxes, permissions and human approval</li>
                  <li>Evals, traces and shipping to production</li>
                </ul>
                <div className="cc-meta">Coming soon</div>
                <div className="cc-go">Get told on launch day →</div>
              </div>
            </Link>
          </div>
        </section>
      </div>

      <div className="ruler"><b>Watch · Read · Build</b></div>
      <div className="band">
        <div className="hframe">
          <section className="hsec">
            <p className="htag">Watch · Read · Build</p>
            <h2>Every lesson is made three ways</h2>
            <p className="h2sub">The video, the notes and the exercise use the same drawing, so nothing is lost moving between them.</p>
            <div className="bandgrid">
              <ol className="steps">
                <li><span className="n">01</span><div><h3>Watch</h3><p>A short video, with the diagram changing as the explanation moves.</p></div></li>
                <li><span className="n">02</span><div><h3>Read</h3><p>The same figures in writing, numbered and captioned, honest about what breaks.</p></div></li>
                <li><span className="n">03</span><div><h3>Build</h3><p>A try-it that adds one working piece to the project you are carrying.</p></div></li>
              </ol>
              <pre className="band-code">{`def answer(ticket_id, message):
    history = load_history(ticket_id)
    reply = call_model(history)
    return reply`}</pre>
            </div>
          </section>
        </div>
      </div>

      <div className="hframe">
        <section className="hsec spots">
          <p className="htag">Inside Skillmaxing</p>
          <h2>What an account actually gets you</h2>
          <p className="h2sub">Six things you use every week, drawn the way they actually work.</p>
          <div className="spot-grid">
            {spots.map(([kicker, title, body, art]) => (
              <article key={title} className="spot-card">
                <div className="spot-art">{spotArt(art)}</div>
                <div className="spot-copy">
                  <span className="htag">{kicker}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="hframe">
        <section className="hsec beyond">
          <p className="htag">Beyond the courses</p>
          <h2>More ways to learn on skillmaxing.</h2>
          <div className="more">
            <div className="more-grid">
              {beyond.map(([n, kicker, title, body, href]) => (
                <Link key={n} className="more-card" href={href}>
                  <span className="idx">{n}</span>
                  <span className="htag">{kicker}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="hframe">
        <section className="hsec plans">
          <div className="plans-head">
            <div>
              <p className="htag">Plans</p>
              <h2>One account, every course</h2>
            </div>
            <Link href="/pricing/">View full pricing</Link>
          </div>
          <div className="plans-stats">
            <div>Every course on every plan</div>
            <div>No checkout on this copy</div>
            <div>Prices listed before tax</div>
          </div>
          <div className="plans-grid">
            <Plan name="Monthly" price="$29" unit="/month" note="$29 a month" body="Every current course with the shortest commitment." cta="Choose Monthly" />
            <Plan name="Annual" price="$16.58" unit="/month" note="$199 a year" body="The same full access, paid once a year." cta="Choose Annual" />
            <Plan name="Lifetime" price="$299" unit="paid once" note="One payment, no renewal" body="All current tracks and every update. This copy does not take payment." cta="See lifetime offer" lifetime />
          </div>
        </section>
      </div>

      <div className="hframe">
        <section className="faq-sec">
          <div>
            <p className="htag">FAQ</p>
            <h2>Questions people ask before joining.</h2>
            <p>Everything worth knowing before you pick a path. If it is not here, ask and it will be added.</p>
          </div>
          <div className="faq">
            {faqs.map(([question, answer], index) => (
              <details key={question} open={open === index} onToggle={(event) => { if ((event.target as HTMLDetailsElement).open) setOpen(index); }}>
                <summary>{question}</summary>
                <p className="faq-a">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <div className="hframe">
        <div className="hprice">
          <div>
            <p className="htag">Start free</p>
            <div className="amt"><i>$29</i> for the first month</div>
            <p className="then">Then $29 a month, every course included. Cancel from your billing portal.</p>
            <p className="also">Or $299 once, for everything published now and later. Prices are before tax. This copy does not charge a card.</p>
          </div>
          <Link className="hbtn mint" href="/pricing/">See pricing</Link>
        </div>
      </div>
    </>
  );
}

function Plan({ name, price, unit, note, body, cta, lifetime }: { name: string; price: string; unit: string; note: string; body: string; cta: string; lifetime?: boolean }) {
  return (
    <article className={lifetime ? "plan-card lifetime" : "plan-card"}>
      {lifetime && <span className="plan-badge">Best value</span>}
      <span className="plan-name">{name}</span>
      <div className="price">{price} <small>{unit}</small></div>
      <p>{note}</p>
      <p>{body}</p>
      <Link className="plan-cta" href="/pricing/">{cta}</Link>
    </article>
  );
}

function spotArt(kind: string) {
  if (kind === "ways") return <div className="mini-ways"><span>Read</span><span>Watch</span><span>Build</span></div>;
  if (kind === "papers") return <div className="mini-ways"><span>02</span><span>03</span><span>04</span></div>;
  if (kind === "days") return <div className="mini-days">{"MTWTFSS".split("").map((day) => <span key={day}>{day}</span>)}</div>;
  if (kind === "dash") return <div className="mini-meter" aria-hidden="true"><i /></div>;
  if (kind === "lab") return <Figure kind="cache" />;
  return <Figure kind="flow" />;
}
