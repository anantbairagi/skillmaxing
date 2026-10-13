"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Figure } from "@/components/Marks";
import { allLessons, courses, papers } from "@/lib/catalog";
import { boardAllowance, DEMO_EMAIL, DEMO_PASSWORD, useStore } from "@/lib/store";

export function LoginForm() {
  const store = useStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = store.login(String(data.get("email")), String(data.get("password")));
    setError(message);
    if (!message) router.push("/dashboard/");
  }
  return (
    <form className="auth card" onSubmit={submit}>
      <h1>Welcome back</h1>
      <p>New here? <Link href="/signup/">Create an account</Link>.</p>
      <Link className="btn ghost" href="/signup/">Continue with email</Link>
      <label>Your email<input className="field" name="email" type="email" required placeholder="Your email" autoComplete="username" /></label>
      <label>Password<input className="field" name="password" type="password" required minLength={8} placeholder="Password" autoComplete="current-password" /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit">Sign in</button>
      <button className="btn ghost" type="button" onClick={() => { const message = store.login(DEMO_EMAIL, DEMO_PASSWORD); setError(message); if (!message) router.push("/dashboard/"); }}>
        Use local demo account
      </button>
      <Link href="/forgot-password/">Forgot your password?</Link>
      <p className="muted">By continuing you agree to the <Link href="/terms/">Terms</Link> and <Link href="/privacy/">Privacy Policy</Link>. The demo password is local to this build and is not your reference-site password.</p>
    </form>
  );
}

export function SignupForm() {
  const store = useStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = store.signup({ email: String(data.get("email")), name: String(data.get("name")), password: String(data.get("password")) });
    setError(message);
    if (!message) router.push("/dashboard/");
  }
  return (
    <form className="auth card" onSubmit={submit}>
      <h1>Create your account</h1>
      <p>Already have one? <Link href="/login/">Sign in</Link>.</p>
      <label>Name<input className="field" name="name" required minLength={2} placeholder="Your name" /></label>
      <label>Email<input className="field" name="email" type="email" required placeholder="Your email" autoComplete="username" /></label>
      <label>Password<input className="field" name="password" type="password" required minLength={8} placeholder="At least 8 characters" autoComplete="new-password" /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn" type="submit">Create account</button>
    </form>
  );
}

export function ForgotForm() {
  const store = useStore();
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email"));
    const result = store.requestReset(email);
    if (!result || result.includes("No account")) {
      setError(result);
      setCode(null);
      return;
    }
    setError(null);
    setCode(result);
  }
  return (
    <form className="auth card" onSubmit={submit}>
      <h1>Reset your password</h1>
      <p>There is no mail server in this build. If the account exists in this browser, the reset code is shown here.</p>
      <label>Email<input className="field" name="email" type="email" required /></label>
      {error && <p className="error">{error}</p>}
      {code && <p className="ok">Reset code: {code}. <Link href="/reset-password/">Enter it</Link>.</p>}
      <button className="btn" type="submit">Send code</button>
    </form>
  );
}

export function ResetForm() {
  const store = useStore();
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = store.resetPassword(String(data.get("email")), String(data.get("code")), String(data.get("password")));
    setError(message);
  }
  return (
    <form className="auth card" onSubmit={submit}>
      <h1>Choose a new password</h1>
      <label>Email<input className="field" name="email" type="email" required /></label>
      <label>Reset code<input className="field" name="code" required inputMode="numeric" /></label>
      <label>New password<input className="field" name="password" type="password" minLength={8} required /></label>
      {error && <p className={error === "Password reset." ? "ok" : "error"}>{error}</p>}
      <button className="btn" type="submit">Update password</button>
    </form>
  );
}

export function Dashboard() {
  const store = useStore();
  if (!store.ready) return <p>Loading your place…</p>;
  if (!store.profile) return <Gate title="Dashboard" body="Sign in to see progress, the streak, and the next lesson." />;
  const profile = store.profile;
  const lessons = allLessons();
  const done = profile.understood.length;
  const heatmap = lastWeeks(profile.activeDays);
  return (
    <>
      <p className="kicker">{profile.name} · {profile.plan} plan</p>
      <h1>Dashboard</h1>
      <p className="lede">Progress, activity, and where to pick up next. {profile.goal || "Set a learning goal in settings."}</p>
      <div className="grid-4">
        <Stat label="Completed" value={String(done)} />
        <Stat label="Current streak" value={`${streak(profile.activeDays)}d`} />
        <Stat label="Longest streak" value={`${streak(profile.activeDays)}d`} />
        <Stat label="Active days" value={String(profile.activeDays.length)} />
      </div>
      <div className="grid-2" style={{ marginTop: 16 }}>
        {courses.map((course) => {
          const list = lessons.filter((lesson) => lesson.course.id === course.id);
          const count = list.filter((lesson) => profile.understood.includes(`${course.id}:${lesson.slug}`)).length;
          const next = list.find((lesson) => !profile.understood.includes(`${course.id}:${lesson.slug}`)) ?? list[0];
          return (
            <article key={course.id} className="card">
              <h3>{course.name}</h3>
              <p>{count}/{list.length}</p>
              <div className="meter"><span style={{ width: `${(count / list.length) * 100}%` }} /></div>
              <p>Next: {next.title}</p>
              <Link className="btn" href={`${course.path}/archive/${next.slug}/`}>Start</Link>
            </article>
          );
        })}
        <article className="card">
          <h3>Paper reading order</h3>
          <p>{profile.papersRead.length}/{papers.length}</p>
          <Link className="btn" href="/papers/">Continue</Link>
        </article>
      </div>
      <section className="section">
        <h2 style={{ fontSize: 32 }}>Activity</h2>
        <div className="heat" aria-label="Active days">{heatmap.map((on, index) => <i key={index} data-on={on} />)}</div>
      </section>
      <section className="section grid-2">
        <div className="card">
          <h3>Saved for later</h3>
          {profile.saved.length === 0 ? <p>Nothing saved yet. Use the bookmark on a lesson or a paper.</p> : profile.saved.map((id) => <p key={id}>{labelFor(id)}</p>)}
          <Link href="/papers/">Browse the papers</Link>
        </div>
        <div className="card">
          <h3>Completed</h3>
          {done === 0 ? <p>Nothing completed yet. Open a lesson and mark it understood.</p> : profile.understood.slice(0, 8).map((id) => <p key={id}>{labelFor(id)}</p>)}
          <Link href="/python-ai/overview/">Start a lesson</Link>
        </div>
      </section>
    </>
  );
}

export function AccountPage() {
  const store = useStore();
  if (!store.profile) return <Gate title="Account" body="Your profile, plan, and sign-in live with the account on this browser." />;
  const profile = store.profile;
  return (
    <>
      <h1>{profile.name}</h1>
      <p className="kicker">{profile.email} · {profile.plan}</p>
      <p>{profile.bio || "Add a bio in settings."}</p>
      <div className="row">
        <Link className="btn" href="/settings/">Edit settings</Link>
        <Link className="btn ghost" href="/settings/">Plan and billing</Link>
        <button className="btn ghost" type="button" onClick={() => store.logout()}>Sign out</button>
      </div>
    </>
  );
}

export function SettingsPage() {
  const store = useStore();
  const [tab, setTab] = useState("profile");
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("tab");
    if (value === "plan") setTab("plan");
  }, []);
  if (!store.ready) return <p>Loading settings…</p>;
  if (!store.profile) return <Gate title="Settings" body="Sign in to edit your profile, plan, and data." />;
  const profile = store.profile;
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    store.update({
      name: String(data.get("name") || profile.name),
      handle: String(data.get("handle") || ""),
      role: String(data.get("role") || ""),
      goal: String(data.get("goal") || ""),
      bio: String(data.get("bio") || ""),
    });
  }
  return (
    <>
      <h1>Settings</h1>
      <p>Your profile, preferences, plan, and data. Stored in this browser only.</p>
      <div className="chips" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["profile", "preferences", "plan", "security", "data"].map((item) => (
          <button key={item} type="button" data-on={tab === item} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {tab === "profile" && (
        <form className="card" onSubmit={save} style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <h2 style={{ fontSize: 28 }}>Who you are</h2>
          <label>Name<input className="field" name="name" defaultValue={profile.name} required /></label>
          <p className="muted">Email used to sign in: {profile.email}</p>
          <label>Handle<input className="field" name="handle" defaultValue={profile.handle} placeholder="yourname" /></label>
          <label>Role<input className="field" name="role" defaultValue={profile.role} placeholder="Backend engineer, student, founder…" /></label>
          <label>Learning goal<textarea className="field" name="goal" defaultValue={profile.goal} placeholder="Pass a staff-level system design loop by December" /></label>
          <label>Bio<textarea className="field" name="bio" defaultValue={profile.bio} /></label>
          <button className="btn" type="submit">Save profile</button>
        </form>
      )}
      {tab === "preferences" && (
        <form className="card" style={{ display: "grid", gap: 8, marginTop: 12 }} onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          store.update({
            mail: { digest: data.get("digest") === "on", product: data.get("product") === "on", streak: data.get("streak") === "on" },
            theme: data.get("theme") === "dark" ? "dark" : "light",
            density: data.get("density") === "compact" ? "compact" : "regular",
            kiit: data.get("kiit") === "on",
          });
        }}>
          <h2 style={{ fontSize: 28 }}>Email and appearance</h2>
          <label><input type="checkbox" name="digest" defaultChecked={profile.mail.digest} /> Weekly digest</label>
          <label><input type="checkbox" name="product" defaultChecked={profile.mail.product} /> Product updates</label>
          <label><input type="checkbox" name="streak" defaultChecked={profile.mail.streak} /> Streak reminders</label>
          <label>Theme
            <select className="field" name="theme" defaultValue={profile.theme}><option value="light">Light</option><option value="dark">Dark</option></select>
          </label>
          <label>Reading density
            <select className="field" name="density" defaultValue={profile.density}><option value="regular">Regular</option><option value="compact">Compact</option></select>
          </label>
          <label><input type="checkbox" name="kiit" defaultChecked={profile.kiit} /> Treat this account as a verified KIIT student (demo)</label>
          <button className="btn" type="submit">Save preferences</button>
        </form>
      )}
      {tab === "plan" && (
        <div className="card" style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 28 }}>Your plan</h2>
          <p>You are on the {profile.plan} plan. {profile.plan === "free" ? "A paid plan opens every lesson." : "Paid lessons are open in this browser."}</p>
          <p className="muted">Payments on the reference site are processed by a checkout provider. This build does not contact one. Choosing a plan only updates local state.</p>
          <div className="row">
            <Link className="btn" href="/pricing/">Compare plans</Link>
            {profile.plan !== "free" && <button className="btn ghost" type="button" onClick={() => store.setPlan("free")}>Return to free</button>}
          </div>
        </div>
      )}
      {tab === "security" && (
        <form className="card" style={{ display: "grid", gap: 8, marginTop: 12 }} onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setMessage(store.changePassword(String(data.get("current")), String(data.get("next"))) ?? "Password updated on this browser.");
        }}>
          <h2 style={{ fontSize: 28 }}>Change your password</h2>
          <p>Changing it here only affects this browser. Other devices are not signed in.</p>
          <input className="field" name="current" type="password" placeholder="Current password" required />
          <input className="field" name="next" type="password" minLength={8} placeholder="New password" required />
          {message && <p>{message}</p>}
          <button className="btn" type="submit">Update password</button>
          <button className="btn ghost" type="button" onClick={() => store.logout()}>Sign out</button>
        </form>
      )}
      {tab === "data" && (
        <div className="card" style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 28 }}>Your data</h2>
          <p>{profile.understood.length} of {allLessons().length} lessons marked understood, {profile.saved.length} saved. Everything is stored in this browser and belongs to this profile.</p>
          <h3>Delete account</h3>
          <p>Removes the sign-in, profile, plan, and progress from this browser. Type delete to confirm.</p>
          <input className="field" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="delete" />
          <DeleteBox enabled={confirm === "delete"} />
        </div>
      )}
    </>
  );
}

function DeleteBox({ enabled }: { enabled: boolean }) {
  const store = useStore();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  return (
    <form onSubmit={(event) => { event.preventDefault(); setMessage(store.deleteAccount(password)); }}>
      <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
      {message && <p>{message}</p>}
      <button className="btn" type="submit" disabled={!enabled}>Delete account</button>
    </form>
  );
}

export function CheckoutPage() {
  return (
    <article className="card">
      <h1>Checkout</h1>
      <p>Payments are not part of this copy. Every lesson, video, and lab is already open.</p>
      <Link className="btn" href="/python-ai/overview/">Go to the courses</Link>
    </article>
  );
}

export function PricingPage() {
  const plans = [
    ["Monthly", "$29", "/month", "$29 a month. Cancel any time in this browser by returning to free.", "monthly"],
    ["Quarterly", "$23", "/month", "$69 every 3 months.", "quarterly"],
    ["Annual", "$16.58", "/month", "$199 a year.", "annual"],
    ["Lifetime", "$299", "once", "Shown so the price list matches. This copy does not sell it.", "lifetime"],
  ] as const;
  return (
    <>
      <p className="kicker">Plans</p>
      <h1>One account. Every course.</h1>
      <p className="lede">Python with AI, System Design and Inference Engineering. Prices match the reference list. Checkout on this build is simulated.</p>
      <div className="grid-4" style={{ marginTop: 16 }}>
        {plans.map(([name, price, unit, body]) => (
          <article key={name} className="card">
            <span className="kicker">{name}</span>
            <div className="price">{price}<small> {unit}</small></div>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <section className="section card">
        <h2 style={{ fontSize: 32 }}>Every subscription includes</h2>
        <ul>
          <li>All three courses: every lesson, watch script, notes and exercise</li>
          <li>Payments and the course assistant are not part of this copy</li>
          <li>Progress kept in this browser</li>
        </ul>
        <p className="muted">Company budgets and tax invoices belong to a real processor. This build does not issue them.</p>
      </section>
    </>
  );
}

export function HirePage() {
  const store = useStore();
  const [saved, setSaved] = useState(false);
  if (!store.ready) return <p>Loading…</p>;
  if (!store.profile) {
    return (
      <>
        <h1>A profile built on how you build</h1>
        <p className="lede">Hiring teams on the reference product are matched to work you have done. This build keeps a profile on this browser and does not share it.</p>
        <Link className="btn" href="/signup/">Create an account</Link>
      </>
    );
  }
  const hire = store.profile.hire;
  return (
    <form className="card" style={{ display: "grid", gap: 10 }} onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      store.update({
        hire: {
          headline: String(data.get("headline") || ""),
          stack: String(data.get("stack") || ""),
          projects: String(data.get("projects") || ""),
          phone: String(data.get("phone") || ""),
          visible: data.get("visible") === "on",
        },
      });
      setSaved(true);
    }}>
      <h1>Hire me</h1>
      <p>Your email stays on the account. A phone number is optional and never leaves this browser.</p>
      <input className="field" name="headline" defaultValue={hire.headline} placeholder="What you want to be hired for" />
      <input className="field" name="stack" defaultValue={hire.stack} placeholder="Python, FastAPI, systems" />
      <textarea className="field" name="projects" defaultValue={hire.projects} placeholder="Two projects, with the decision you made" />
      <input className="field" name="phone" defaultValue={hire.phone} placeholder="Phone, optional" />
      <label><input type="checkbox" name="visible" defaultChecked={hire.visible} /> Show this profile to me on the dashboard</label>
      <button className="btn" type="submit">Save profile</button>
      {saved && <p className="ok">Saved locally. Nothing was sent to a recruiter.</p>}
    </form>
  );
}

const BOARDS = [
  { id: "kv", title: "KV cache", kind: "gpu" as const, lines: ["Prompt tokens are read once. That is prefill.", "Each new token reuses the keys and values already stored.", "The bill is bytes, not a vibe: layers × heads × dimensions × bytes × sequence.", "If the cache does not fit, the batch shrinks or the context shrinks."] },
  { id: "lb", title: "Load balancer", kind: "queue" as const, lines: ["One address, many servers.", "A balancer does not create capacity. It spends the capacity you already have.", "The queue forms when arrival rate passes n times the service rate.", "Watch the lab if you want the curve, not the sentence."] },
  { id: "agent", title: "Agent loop", kind: "loop" as const, lines: ["A planner proposes the next action.", "A tool either returns an observation or an error the model can read.", "Stop rules are part of the product: max steps, a budget, a human.", "If you cannot replay the trace, you cannot fix the run."] },
];

export function BoardPage() {
  const store = useStore();
  const router = useRouter();
  const [board, setBoard] = useState(BOARDS[0]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const allowance = boardAllowance(store.profile);
  const used = store.profile?.boardMinutesUsed ?? 0;
  const locked = store.profile ? used >= allowance : false;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((value) => Math.min(board.lines.length - 1, value + 1)), 1600);
    return () => window.clearInterval(timer);
  }, [playing, board.lines.length]);
  function start() {
    if (!store.profile) {
      router.push("/login/");
      return;
    }
    if (!store.spendBoardMinute()) return;
    setStep(0);
    setPlaying(true);
  }
  return (
    <>
      <p className="kicker">Whiteboard beta</p>
      <h1>Learn it on a whiteboard</h1>
      <p className="lede">A tutor that explains and draws as it goes. Stop it and read the step you are on. Sessions are metered locally.</p>
      {!store.profile && <p>Sign in to start. A free account gets one demo session. Lifetime gets 60.</p>}
      {store.profile && <p className="kicker">{used} of {allowance} sessions used · {store.profile.plan}</p>}
      <div className="row">
        {BOARDS.map((item) => <button key={item.id} className="btn ghost" type="button" onClick={() => { setBoard(item); setStep(0); setPlaying(false); }}>{item.title}</button>)}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <Figure kind={board.kind} />
        <ol>
          {board.lines.map((line, index) => <li key={line} style={{ opacity: index <= step ? 1 : 0.35 }}>{line}</li>)}
        </ol>
        {locked ? <Link className="btn" href="/pricing/">See Lifetime</Link> : <button className="btn" type="button" onClick={start}>{playing ? "Session running" : "Start session"}</button>}
        <button className="btn ghost" type="button" onClick={() => setPlaying(false)}>Stop</button>
      </div>
    </>
  );
}

export function AssistantPage() {
  return (
    <article>
      <h1>Course assistant</h1>
      <p className="lede">The assistant is not part of this copy. Lessons still include a video, notes, and a check you answer yourself.</p>
      <Link className="btn" href="/python-ai/archive/what-an-ai-backend-is/">Open a lesson</Link>
    </article>
  );
}

export function Legal({ kind }: { kind: "terms" | "privacy" | "refunds" }) {
  const copy = {
    terms: ["Terms", "This study build is an independent practice app. Accounts, progress, and plans live in your browser. Do not send real payment details. Lesson notes are original and are not a license to the reference course."],
    privacy: ["Privacy", "The app stores your profile, password, and progress in localStorage on this device. Newsletter addresses you type stay there too. Nothing is sent to a server by this build. Clearing site data deletes it."],
    refunds: ["Refunds", "Because checkout does not charge a card, there is nothing to refund. On the reference product, billing is handled by their processor and their own refund policy."],
  }[kind];
  return <article className="prose" style={{ maxWidth: 720 }}><h1>{copy[0]}</h1><p>{copy[1]}</p></article>;
}

export function AgentPage() {
  const store = useStore();
  const [email, setEmail] = useState("");
  return (
    <>
      <p className="kicker">Coming soon</p>
      <h1>Agent harness.</h1>
      <p className="lede">Everything around the model: the loop, the tools, the memory, the sandbox, the permissions, the evals and the traces.</p>
      <div className="grid-3">
        {["The loop: planner, tools, memory, stop rules", "Sandboxes, permissions and human approval", "Evals, traces and shipping to production"].map((item) => <article key={item} className="card"><h3>{item}</h3></article>)}
      </div>
      <form className="news-form" style={{ marginTop: 16 }} onSubmit={(event) => { event.preventDefault(); store.subscribe(email); }}>
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email for launch day" aria-label="Email" />
        <button type="submit">Tell me on launch day</button>
      </form>
      <p><Link href="/python-ai/overview/">Start with Python with AI</Link></p>
    </>
  );
}

export function SimplePage({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return (
    <article>
      <h1>{title}</h1>
      <p className="lede">{body}</p>
      {href && action && <Link className="btn" href={href}>{action}</Link>}
    </article>
  );
}

export function NewsletterPage() {
  const store = useStore();
  return (
    <form className="auth card" onSubmit={(event) => { event.preventDefault(); store.subscribe(String(new FormData(event.currentTarget).get("email"))); }}>
      <h1>New lessons</h1>
      <input className="field" name="email" type="email" required placeholder="Email" />
      <button className="btn" type="submit">Subscribe</button>
      <p className="muted">{store.newsletter.length} address{store.newsletter.length === 1 ? "" : "es"} stored in this browser.</p>
    </form>
  );
}

export function UnsubscribePage() {
  const store = useStore();
  return (
    <form className="auth card" onSubmit={(event) => { event.preventDefault(); store.unsubscribe(String(new FormData(event.currentTarget).get("email"))); }}>
      <h1>Unsubscribe</h1>
      <input className="field" name="email" type="email" required />
      <button className="btn" type="submit">Remove</button>
    </form>
  );
}

export function StylesPage() {
  return (
    <>
      <h1>Styles</h1>
      <p>Archivo for display, DM Sans for UI, DM Mono for labels, Newsreader for lesson prose.</p>
      <div className="row">
        <span className="skew"><span>Primary</span></span>
        <span className="skew mint"><span>Mint</span></span>
        <span className="btn">Dark</span>
        <span className="btn ghost">Ghost</span>
      </div>
      <div className="grid-3" style={{ marginTop: 16 }}>
        <div className="card"><Figure kind="flow" /></div>
        <div className="card"><Figure kind="cache" /></div>
        <div className="card"><Figure kind="gpu" /></div>
      </div>
    </>
  );
}

export function NotFoundPage() {
  return (
    <div>
      <p className="kicker">404</p>
      <h1>Not found</h1>
      <p>That page does not exist here yet.</p>
      <div className="row">
        <Link className="btn" href="/python-ai/overview/">Python with AI</Link>
        <Link className="btn" href="/inference-eng/overview/">Inference Engineering</Link>
        <Link className="btn" href="/system/overview/">System Design</Link>
        <Link className="btn ghost" href="/pricing/">See pricing</Link>
      </div>
    </div>
  );
}

function Gate({ title, body }: { title: string; body: string }) {
  return (
    <div className="card">
      <h1>{title}</h1>
      <p>{body}</p>
      <div className="row">
        <Link className="btn" href="/login/">Sign in</Link>
        <Link className="btn ghost" href="/signup/">Create an account</Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="stat card"><b>{value}</b><span className="kicker">{label}</span></div>;
}

function labelFor(id: string) {
  const [courseId, slug] = id.split(":");
  return allLessons().find((lesson) => lesson.course.id === courseId && lesson.slug === slug)?.title ?? id;
}

function streak(days: string[]) {
  if (!days.length) return 0;
  const set = new Set(days);
  const cursor = new Date();
  let count = 0;
  while (set.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function lastWeeks(days: string[]) {
  const set = new Set(days);
  const cells: boolean[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 52 * 7);
  for (let i = 0; i < 53 * 7; i += 1) {
    cells.push(set.has(cursor.toISOString().slice(0, 10)));
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

