"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/Marks";
import { courseById, courses, searchIndex, type Course, type SearchHit } from "@/lib/catalog";
import { labs } from "@/lib/labs";
import { useStore } from "@/lib/store";

const LINKS = [
  ["/papers/", "Papers"],
  ["/daily/", "Daily"],
  ["/labs/", "Labs"],
  ["/blog/", "Blog"],
  ["/news/", "News"],
  ["/pricing/", "Pricing"],
  ["/hire-me/", "Hire me"],
];

const PILL_ORDER = ["system", "python-ai", "inference-eng"] as const;
const GROUPS = ["All", "Python with AI", "Inference Engineering", "System Design", "Papers", "Daily", "Labs", "Tools"] as const;

export function Chrome({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const store = useStore();
  const home = path === "/";
  const courseId = path.match(/^\/(python-ai|inference-eng|system)(\/|$)/)?.[1] as Course["id"] | undefined;
  const course = courseId ? courseById(courseId) : null;
  const [menu, setMenu] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [side, setSide] = useState(false);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof GROUPS)[number]>("All");
  const [active, setActive] = useState(0);
  const [notesOn, setNotesOn] = useState(false);

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
        setSide(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMenu(false);
    setCoursesOpen(false);
    setSide(false);
    setNotesOn(false);
  }, [path]);

  return (
    <div className={home ? "home2" : course ? (side ? "course side-open" : "course") : "site"}>
      <a className="skip" href="#main-content">Skip to content</a>
      {home && <Ticker />}
      {course ? (
        <header className="chead ws-head">
          <div className="ws-head-left">
            <button className="cside-btn" type="button" onClick={() => setSide(true)}>
              <ListIcon />
              <span>Lessons</span>
            </button>
            <Link className="ws-mark" href="/" aria-label="Skillmaxing home"><Logo size={18} /><b>skillmaxing</b></Link>
            <nav className="ws-courses" aria-label="Courses">
              {PILL_ORDER.map((id) => {
                const item = courses.find((courseItem) => courseItem.id === id)!;
                return (
                  <Link key={id} href={`${item.path}/overview/`} data-active={path.startsWith(item.path)}>
                    <span>{item.id === "system" ? "System Design" : item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="chead-right">
            <Tools storeName={store.profile?.name} notesOn={notesOn} setNotesOn={setNotesOn} onSearch={() => setPalette(true)} onMenu={() => setMenu(true)} />
          </div>
        </header>
      ) : (
        <header className={home ? "homebar" : "topnav"}>
          <div className={home ? "hframe" : "topnav-inner"}>
            <div className="hbar">
              <Link className={home ? "hmark" : "brand"} href="/" aria-label="Skillmaxing home">
                <Logo size={home ? 22 : 26} />
                <span className="brand-name">skillmaxing</span>
              </Link>
              <nav className="nav-links" aria-label="Primary">
                <div className={coursesOpen ? "hmenu open" : "hmenu"}>
                  <button className="nav-btn" type="button" aria-expanded={coursesOpen} onClick={() => setCoursesOpen((open) => !open)}>Courses</button>
                  <div className="menu">
                    {courses.map((item) => (
                      <Link key={item.id} href={`${item.path}/overview/`}>
                        {item.name}
                        <small>{item.lede}</small>
                      </Link>
                    ))}
                  </div>
                </div>
                {LINKS.map(([href, label]) => (
                  <Link key={href} href={href} data-active={path.startsWith(href)}>{label}</Link>
                ))}
                <Link href="/board/">Whiteboard <span className="nav-beta">Beta</span></Link>
              </nav>
              <Tools storeName={store.profile?.name} notesOn={notesOn} setNotesOn={setNotesOn} onSearch={() => setPalette(true)} onMenu={() => setMenu(true)} signedOut={!store.profile} />
            </div>
          </div>
        </header>
      )}
      {menu && (
        <div className="mobile-panel" onClick={() => setMenu(false)}>
          <div className="mnav-body" onClick={(event) => event.stopPropagation()}>
            <button className="btn" type="button" onClick={() => setMenu(false)}>Close</button>
            {courses.map((item) => <Link key={item.id} href={`${item.path}/overview/`}>{item.name}</Link>)}
            {LINKS.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
            <Link href="/board/">Whiteboard</Link>
            <Link href={store.profile ? "/dashboard/" : "/login/"}>{store.profile ? "Dashboard" : "Sign in"}</Link>
            <Link href="/settings/">Settings</Link>
          </div>
        </div>
      )}
      {course ? (
        <div className="course-row">
          <button className="cside-backdrop" type="button" aria-label="Close lessons" onClick={() => setSide(false)} />
          <CourseSide course={course} path={path} understood={store.profile?.understood ?? []} onNavigate={() => setSide(false)} />
          <main id="main-content" className="cmain">
            {children}
            <footer className="cfoot">
              <span>© {new Date().getFullYear()} Skillmaxing</span>
              <Link href="/">Home</Link>
              <Link href="/pricing/">Pricing</Link>
              <Link href="/dashboard/">Dashboard</Link>
              <Link href="/settings/">Settings</Link>
              <Link href="/terms/">Terms</Link>
              <Link href="/privacy/">Privacy</Link>
              <Link href="/refunds/">Refunds</Link>
            </footer>
          </main>
        </div>
      ) : (
        <main id="main-content" className={home ? "home-main" : "page"}>{children}</main>
      )}
      {!course && <SiteFooter onSubscribe={store.subscribe} />}
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
      {store.notice && (
        <div className="toast" role="status">
          {store.notice}
          <button className="btn ghost" type="button" onClick={() => store.clearNotice()} style={{ marginLeft: 8 }}>OK</button>
        </div>
      )}
    </div>
  );
}

function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {Array.from({ length: 2 }).map((_, copy) => (
          <span key={copy}>{Array.from({ length: 8 }).map((__, i) => <span key={i}>WATCH · READ · BUILD · TRACE · SHIP ·&nbsp;&nbsp;</span>)}</span>
        ))}
      </div>
    </div>
  );
}

function Tools({ storeName, notesOn, setNotesOn, onSearch, onMenu, signedOut }: {
  storeName?: string;
  notesOn: boolean;
  setNotesOn: (value: boolean | ((open: boolean) => boolean)) => void;
  onSearch: () => void;
  onMenu: () => void;
  signedOut?: boolean;
}) {
  return (
    <div className="nav-tools">
      <button className="icon-btn" type="button" aria-label="Search" onClick={onSearch}><SearchIcon /></button>
      <div className="nbell">
        <button className="icon-btn" type="button" aria-label="Notifications" aria-expanded={notesOn} onClick={() => setNotesOn((open) => !open)}><BellIcon /></button>
        {notesOn && (
          <div className="nbell-panel">
            <div className="nbell-head">Notifications <span className="nbell-new">1</span></div>
            <p className="nbell-empty">Whiteboard beta is open. Agent harness is still a launch-day note. Progress on this copy stays in the browser.</p>
          </div>
        )}
      </div>
      {storeName ? (
        <Link className="btn btn-outline desktop-only" href="/dashboard/">{storeName.split(" ")[0]}</Link>
      ) : (
        <Link className="btn btn-outline desktop-only" href="/login/">Sign in</Link>
      )}
      {signedOut && <Link className="hbtn lime sm desktop-only" href="/signup/">Start free</Link>}
      <button className="mnav-btn menu-toggle" type="button" aria-label="Open menu" onClick={onMenu}>
        <span className="mnav-bars"><i /><i /><i /></span>
      </button>
    </div>
  );
}

function CourseSide({ course, path, understood, onNavigate }: { course: Course; path: string; understood: string[]; onNavigate: () => void }) {
  const current = path.match(/\/archive\/([^/]+)\/?$/)?.[1];
  const done = understood.filter((id) => id.startsWith(`${course.id}:`)).length;
  const [openMods, setOpenMods] = useState<string[]>([]);
  useEffect(() => {
    const title = course.modules.find((mod) => mod.lessons.some((lesson) => lesson.slug === current))?.title
      ?? (!current ? course.modules[0]?.title : undefined);
    if (!title) return;
    setOpenMods((list) => (list.includes(title) ? list : [...list, title]));
  }, [course, current]);
  return (
    <aside className="cside ws-side" aria-label={`${course.name} lessons`}>
      <div className="cside-scroll">
        <p className="cside-label">The path</p>
        <Link className="cside-link" data-on={path.includes("/overview")} href={`${course.path}/overview/`} onClick={onNavigate}>Every lesson</Link>
        <Link className="cside-link" data-on={path.includes("/resources")} href={`${course.path}/resources/`} onClick={onNavigate}>Library</Link>
        {course.modules.map((mod, index) => (
            <details
              key={mod.title}
              className="cside-mod"
              open={openMods.includes(mod.title)}
              onToggle={(event) => {
                const next = event.currentTarget.open;
                setOpenMods((list) => (next ? (list.includes(mod.title) ? list : [...list, mod.title]) : list.filter((item) => item !== mod.title)));
              }}
            >
              <summary>
                <span className="num">{index === 0 ? "0" : String(index).padStart(2, "0")}</span>
                <span className="t">{mod.title}</span>
                <span className="cnt">{mod.lessons.length}</span>
              </summary>
              <div className="cside-lessons">
                {mod.lessons.map((lesson) => (
                  <Link
                    key={lesson.slug}
                    className="cside-lesson"
                    data-on={lesson.slug === current}
                    data-done={understood.includes(`${course.id}:${lesson.slug}`)}
                    href={`${course.path}/archive/${lesson.slug}/`}
                    onClick={onNavigate}
                  >
                    <span className="t">{lesson.title}</span>
                    {lesson.free && <span className="star">Free</span>}
                  </Link>
                ))}
              </div>
            </details>
        ))}
      </div>
      <div className="cside-foot"><span>{done}</span> understood in this browser</div>
    </aside>
  );
}

function SiteFooter({ onSubscribe }: { onSubscribe: (email: string) => void }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link className="brand" href="/"><Logo size={22} /><span className="brand-name">skillmaxing</span></Link>
          <p>Courses, papers and labs for engineers who want to go deep.</p>
        </div>
        <div className="footer-col">
          <span className="label">Use Skillmaxing</span>
          <Link href="/">Skillmaxing</Link>
          <Link href="/labs/">Labs</Link>
          <Link href="/daily/">Daily papers</Link>
          <Link href="/papers/">Papers</Link>
          <Link href="/system/resources/">Resources</Link>
          <Link href="/pricing/">Pricing</Link>
          <Link href="/hire-me/">Hire me</Link>
        </div>
        <div className="footer-col">
          <span className="label">Courses</span>
          <Link href="/python-ai/overview/">Python with AI</Link>
          <Link href="/inference-eng/overview/">Inference Engineering</Link>
          <Link href="/system/overview/">System Design</Link>
        </div>
        <div className="footer-col">
          <span className="label">Account</span>
          <Link href="/login/">Sign in</Link>
          <Link href="/dashboard/">Dashboard</Link>
          <Link href="/account/">Account</Link>
          <Link href="/settings/">Settings</Link>
        </div>
      </div>
      <div className="footer-news">
        <div>
          <span className="label">New lessons</span>
          <p>A note when a lesson is added. The address stays in this browser.</p>
        </div>
        <form className="news-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubscribe(String(data.get("email") || "")); event.currentTarget.reset(); }}>
          <input name="email" type="email" required placeholder="Email for new lessons" aria-label="Email address" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Skillmaxing</span>
        <div className="footer-bottom-links">
          <Link href="/terms/">Terms</Link>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/refunds/">Refunds</Link>
        </div>
      </div>
    </footer>
  );
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>;
}
function BellIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2H4.5L6 16z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>;
}
function ListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M8 7h12M8 12h12M8 17h12" /><path d="M4 7h.01M4 12h.01M4 17h.01" /></svg>;
}
