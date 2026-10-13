"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Marks";
import { courses, searchIndex, type SearchGroup, type SearchHit } from "@/lib/catalog";
import { labs } from "@/lib/labs";
import { useStore } from "@/lib/store";

const MARKETING = [
  ["/labs/", "Labs"],
  ["/daily/", "Daily"],
  ["/papers/", "Papers"],
  ["/blog/", "Blog"],
  ["/news/", "News"],
  ["/pricing/", "Pricing"],
  ["/hire-me/", "Hire me"],
];

const GROUPS: Array<SearchGroup | "All"> = ["All", "Python with AI", "Inference Engineering", "System Design", "Papers", "Daily", "Labs", "Tools"];

export function Chrome({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const store = useStore();
  const courseMode = /\/(python-ai|inference-eng|system)(\/|$)/.test(path);
  const [menu, setMenu] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [ask, setAsk] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof GROUPS)[number]>("All");
  const [active, setActive] = useState(0);
  const [note, setNote] = useState("");
  const [notesOn, setNotesOn] = useState(false);
  const [chat, setChat] = useState<{ who: "me" | "ai"; text: string }[]>([
    { who: "ai", text: "Ask about a lesson, a paper, or a lab. Answers come from this build's notes." },
  ]);
  const [draft, setDraft] = useState("");

  const hits = useMemo(() => {
    const index = searchIndex(labs);
    const q = query.trim().toLowerCase();
    return index
      .filter((hit) => (tab === "All" ? true : hit.group === tab))
      .filter((hit) => !q || `${hit.title} ${hit.hint}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query, tab]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === "Escape") {
        setPalette(false);
        setMenu(false);
        setAsk(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMenu(false);
    setCoursesOpen(false);
  }, [path]);

  function askSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const index = searchIndex(labs);
    const found = index.find((hit) => text.toLowerCase().split(/\s+/).some((word) => word.length > 3 && hit.title.toLowerCase().includes(word)));
    const reply = found
      ? `${found.title} is in ${found.group}. ${found.hint}. Open it and use the Read tab, then try the one-number exercise.`
      : "Nothing in the catalog title matches that yet. Try a shorter word: cache, agent, FastAPI, Raft, batch.";
    setChat((items) => [...items, { who: "me", text }, { who: "ai", text: reply }]);
    setDraft("");
  }

  return (
    <>
      <a className="skip" href="#main-content">Skip to content</a>
      {path === "/" && (
        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            {Array.from({ length: 2 }).map((_, copy) => (
              <span key={copy}>
                {Array.from({ length: 8 }).map((__, i) => (
                  <span key={i}>WATCH · READ · BUILD · TRACE · SHIP ·&nbsp;&nbsp;</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}
      <header className="topnav">
        <div className={courseMode ? "coursebar-inner" : "topnav-inner"}>
          <Link className="brand" href="/" aria-label="Skillmaxing home">
            <Logo />
            <span className="brand-name">skillmaxing</span>
          </Link>
          {courseMode ? (
            <nav className="nav-links" aria-label="Courses">
              {courses.map((course) => (
                <Link key={course.id} href={`${course.path}/overview/`} data-active={path.startsWith(course.path)}>
                  {course.id === "system" ? "System Design" : course.name}
                </Link>
              ))}
            </nav>
          ) : (
            <nav className="nav-links" aria-label="Primary">
              <div className={coursesOpen ? "courses-pop open" : "courses-pop"}>
                <button className="nav-btn" type="button" aria-expanded={coursesOpen} onClick={() => setCoursesOpen((open) => !open)}>
                  Courses
                </button>
                <div className="courses-panel">
                  {courses.map((course) => (
                    <Link key={course.id} className="menu-space" href={`${course.path}/overview/`}>
                      <b>
                        {course.name}
                        <small>{course.lede}</small>
                        <small>5 free lessons</small>
                      </b>
                    </Link>
                  ))}
                </div>
              </div>
              {MARKETING.map(([href, label]) => (
                <Link key={href} href={href} data-active={path.startsWith(href)}>
                  {label}
                </Link>
              ))}
              <Link href="/board/">
                Whiteboard <span className="beta">Beta</span>
              </Link>
            </nav>
          )}
          <div className="nav-right">
            <Link className="skew slim desktop-only" href="/assistant/"><span>Ask the tutor</span></Link>
            <button className="icon-btn" type="button" aria-label="Search" onClick={() => setPalette(true)}>
              <SearchIcon />
            </button>
            <button className="icon-btn" type="button" aria-label={notesOn ? "Notifications open" : "Notifications"} aria-expanded={notesOn} onClick={() => setNotesOn((open) => !open)}>
              <BellIcon />
            </button>
            {store.profile ? (
              <Link className="btn ghost desktop-only" href="/dashboard/">{store.profile.name.split(" ")[0]}</Link>
            ) : (
              <Link className="btn ghost desktop-only" href="/login/">Sign in</Link>
            )}
            {!store.profile && <Link className="skew slim desktop-only" href="/signup/"><span>Start free</span></Link>}
            <button className="menu-toggle" type="button" aria-label="Open menu" onClick={() => setMenu(true)}>
              <MenuIcon />
            </button>
          </div>
        </div>
        {notesOn && (
          <div className="card" style={{ margin: "0 var(--pad) 10px", maxWidth: 420, marginLeft: "auto" }}>
            <strong>Notifications</strong>
            <p className="muted">Whiteboard beta is open. Agent harness is still a launch-day note, not a course.</p>
            <p className="muted">This study build stores progress in the browser. Nothing here is pushed to the reference site.</p>
            <button className="btn ghost" type="button" onClick={() => setNotesOn(false)}>Close</button>
          </div>
        )}
      </header>
      {menu && (
        <div className="mobile-panel">
          <button className="btn" type="button" onClick={() => setMenu(false)}>Close</button>
          {courses.map((course) => (
            <Link key={course.id} href={`${course.path}/overview/`}>{course.name}</Link>
          ))}
          {MARKETING.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
          <Link href="/board/">Whiteboard</Link>
          <Link href="/assistant/">Ask the tutor</Link>
          <Link href={store.profile ? "/dashboard/" : "/login/"}>{store.profile ? "Dashboard" : "Sign in"}</Link>
          <Link href="/settings/">Settings</Link>
        </div>
      )}
      <main id="main-content" className="page">{children}</main>
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <Link className="brand" href="/"><Logo size={22} /><span className="brand-name">skillmaxing</span></Link>
            <p>Courses, papers and labs for engineers who want to go deep.</p>
            <form className="news-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); store.subscribe(String(data.get("email") || "")); event.currentTarget.reset(); }}>
              <input name="email" type="email" required placeholder="Email for new lessons" aria-label="Email address" />
              <button type="submit">Subscribe</button>
            </form>
            <p>© {new Date().getFullYear()} Skillmaxing study build. Original notes. Made for deliberate technical practice.</p>
          </div>
          <div>
            <h4>Use Skillmaxing</h4>
            <Link href="/">Skillmaxing</Link>
            <Link href="/labs/">Labs</Link>
            <Link href="/daily/">Daily papers</Link>
            <Link href="/papers/">Papers</Link>
            <Link href="/system/resources/">Resources</Link>
            <Link href="/pricing/">Pricing</Link>
            <Link href="/hire-me/">Hire me</Link>
          </div>
          <div>
            <h4>Courses</h4>
            <Link href="/python-ai/overview/">Python with AI</Link>
            <Link href="/inference-eng/overview/">Inference Engineering</Link>
            <Link href="/system/overview/">System Design</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link href="/login/">Sign in</Link>
            <Link href="/dashboard/">Dashboard</Link>
            <Link href="/account/">Account</Link>
            <Link href="/settings/">Settings</Link>
          </div>
        </div>
        <div className="legal">
          <Link href="/terms/">Terms</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/refunds/">Refunds</Link>
        </div>
      </footer>
      <button className="fab" type="button" onClick={() => setAsk((open) => !open)}>Ask AI</button>
      {ask && (
        <div className="drawer" role="dialog" aria-label="Course assistant">
          <header>
            <strong>Course assistant</strong>
            <button className="btn ghost" type="button" onClick={() => setAsk(false)}>Close</button>
          </header>
          <div className="log">
            {chat.map((item, index) => (
              <div key={index} className={item.who === "me" ? "bubble me" : "bubble"}>{item.text}</div>
            ))}
          </div>
          <form onSubmit={askSubmit}>
            <input className="field" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about a lesson" aria-label="Question" />
            <button className="btn" type="submit">Send</button>
          </form>
        </div>
      )}
      {palette && (
        <div className="palette" onClick={() => setPalette(false)}>
          <div className="palette-panel" role="dialog" aria-label="Search" onClick={(event) => event.stopPropagation()}>
            <form className="palette-head" onSubmit={(event) => { event.preventDefault(); const hit = hits[active]; if (hit) window.location.assign(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${hit.href}`); }}>
              <SearchIcon />
              <input className="field" autoFocus value={query} placeholder="Search lessons, papers, posts, labs" aria-label="Search" onChange={(event) => { setQuery(event.target.value); setActive(0); }} />
              <span className="kicker">esc</span>
            </form>
            <div className="tabs">
              {GROUPS.map((group) => (
                <button key={group} type="button" data-on={tab === group} onClick={() => setTab(group)}>{group}</button>
              ))}
            </div>
            <div>
              {hits.length === 0 && <p className="muted" style={{ padding: 12 }}>{query ? "Nothing matches yet. Try a shorter word." : "Nothing open yet. Type a topic, a symbol, or a question."}</p>}
              {hits.map((hit: SearchHit, index) => (
                <Link key={`${hit.href}-${hit.group}`} className="hit" data-on={index === active} href={hit.href} onClick={() => setPalette(false)}>
                  <strong>{hit.title}</strong>
                  <div className="hint">{hit.group} · {hit.hint}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {(store.notice || note) && (
        <div className="toast" role="status">
          {store.notice || note}
          <button className="btn ghost" type="button" onClick={() => { store.clearNotice(); setNote(""); }} style={{ marginLeft: 8 }}>OK</button>
        </div>
      )}
    </>
  );
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>;
}
function BellIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2H4.5L6 16z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>;
}
function MenuIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}
