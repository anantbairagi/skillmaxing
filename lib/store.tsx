"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Plan = "free" | "monthly" | "quarterly" | "annual" | "lifetime";

export type Profile = {
  email: string;
  name: string;
  handle: string;
  role: string;
  goal: string;
  bio: string;
  plan: Plan;
  kiit: boolean;
  understood: string[];
  saved: string[];
  papersRead: string[];
  activeDays: string[];
  theme: "light" | "dark";
  density: "regular" | "compact";
  mail: { digest: boolean; product: boolean; streak: boolean };
  hire: { headline: string; stack: string; projects: string; visible: boolean; phone: string };
  boardMinutesUsed: number;
  assistantDay: string;
  assistantCount: number;
  readNotes: string[];
};

type Account = { password: string; profile: Profile };
type Database = {
  session: string | null;
  accounts: Record<string, Account>;
  newsletter: string[];
  resetCodes: Record<string, string>;
};

type Store = {
  ready: boolean;
  profile: Profile | null;
  newsletter: string[];
  notice: string | null;
  signup: (input: { email: string; name: string; password: string }) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  update: (patch: Partial<Profile>) => void;
  setPlan: (plan: Plan) => void;
  toggleUnderstood: (key: string) => void;
  toggleSaved: (key: string) => void;
  togglePaper: (slug: string) => void;
  changePassword: (current: string, next: string) => string | null;
  requestReset: (email: string) => string | null;
  resetPassword: (email: string, code: string, next: string) => string | null;
  deleteAccount: (password: string) => string | null;
  subscribe: (email: string) => void;
  unsubscribe: (email: string) => void;
  useAssistant: () => boolean;
  spendBoardMinute: () => boolean;
  clearNotice: () => void;
};

const KEY = "skillmaxing.study.v1";
const DEMO_EMAIL = "abairagi.driptiv@gmail.com";
const DEMO_PASSWORD = "study-local";

const StoreContext = createContext<Store | null>(null);

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function emptyProfile(email: string, name: string): Profile {
  return {
    email,
    name,
    handle: "",
    role: "",
    goal: "",
    bio: "",
    plan: "free",
    kiit: false,
    understood: [],
    saved: [],
    papersRead: [],
    activeDays: [],
    theme: "light",
    density: "regular",
    mail: { digest: true, product: true, streak: false },
    hire: { headline: "", stack: "", projects: "", visible: false, phone: "" },
    boardMinutesUsed: 0,
    assistantDay: today(),
    assistantCount: 0,
    readNotes: [],
  };
}

function emptyDb(): Database {
  return { session: null, accounts: {}, newsletter: [], resetCodes: {} };
}

export function hasFullAccess(profile: Profile | null) {
  return !!profile && profile.plan !== "free";
}

export function assistantUnlocked(profile: Profile | null) {
  return !!profile && (profile.plan === "lifetime" || profile.kiit);
}

export function boardAllowance(profile: Profile | null) {
  if (!profile) return 1;
  if (profile.plan === "lifetime") return 60;
  return 1;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database>(emptyDb);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDb(JSON.parse(raw) as Database);
    } catch {
      setDb(emptyDb());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(db));
    const profile = db.session ? db.accounts[db.session]?.profile : null;
    document.documentElement.dataset.theme = profile?.theme ?? "light";
    document.documentElement.dataset.density = profile?.density ?? "regular";
  }, [db, ready]);

  const profile = db.session ? db.accounts[db.session]?.profile ?? null : null;

  const api = useMemo<Store>(() => {
    const commit = (next: Database, message?: string) => {
      setDb(next);
      if (message) setNotice(message);
    };
    const touch = (current: Profile): Profile => {
      const day = today();
      return current.activeDays.includes(day) ? current : { ...current, activeDays: [...current.activeDays, day] };
    };

    return {
      ready,
      profile,
      newsletter: db.newsletter,
      notice,
      clearNotice: () => setNotice(null),
      signup: ({ email, name, password }) => {
        const key = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return "Enter a valid email.";
        if (name.trim().length < 2) return "Add your name.";
        if (password.length < 8) return "Use at least 8 characters.";
        if (db.accounts[key]) return "An account with that email already exists. Sign in.";
        const next = {
          ...db,
          session: key,
          accounts: { ...db.accounts, [key]: { password, profile: emptyProfile(key, name.trim()) } },
        };
        commit(next, "Account created on this browser.");
        return null;
      },
      login: (email, password) => {
        const key = email.trim().toLowerCase();
        let accounts = db.accounts;
        if (!accounts[key] && key === DEMO_EMAIL && password === DEMO_PASSWORD) {
          accounts = { ...accounts, [key]: { password, profile: emptyProfile(key, "Anant Bairagi") } };
        }
        const account = accounts[key];
        if (!account || account.password !== password) return "That email and password do not match.";
        commit({ ...db, accounts, session: key });
        return null;
      },
      logout: () => commit({ ...db, session: null }),
      update: (patch) => {
        if (!db.session) return;
        const account = db.accounts[db.session];
        commit({
          ...db,
          accounts: { ...db.accounts, [db.session]: { ...account, profile: { ...account.profile, ...patch } } },
        }, "Saved.");
      },
      setPlan: (plan) => {
        if (!db.session) return;
        const account = db.accounts[db.session];
        commit({
          ...db,
          accounts: { ...db.accounts, [db.session]: { ...account, profile: { ...account.profile, plan } } },
        }, plan === "free" ? "You are on the free plan." : "Plan updated in this browser. No card was charged.");
      },
      toggleUnderstood: (id) => {
        if (!db.session) return;
        const account = db.accounts[db.session];
        const has = account.profile.understood.includes(id);
        const understood = has ? account.profile.understood.filter((item) => item !== id) : [...account.profile.understood, id];
        const profileNext = touch({ ...account.profile, understood });
        commit({ ...db, accounts: { ...db.accounts, [db.session]: { ...account, profile: profileNext } } });
      },
      toggleSaved: (id) => {
        if (!db.session) return;
        const account = db.accounts[db.session];
        const has = account.profile.saved.includes(id);
        const saved = has ? account.profile.saved.filter((item) => item !== id) : [...account.profile.saved, id];
        commit({ ...db, accounts: { ...db.accounts, [db.session]: { ...account, profile: { ...account.profile, saved } } } });
      },
      togglePaper: (slug) => {
        if (!db.session) return;
        const account = db.accounts[db.session];
        const has = account.profile.papersRead.includes(slug);
        const papersRead = has ? account.profile.papersRead.filter((item) => item !== slug) : [...account.profile.papersRead, slug];
        commit({
          ...db,
          accounts: { ...db.accounts, [db.session]: { ...account, profile: touch({ ...account.profile, papersRead }) } },
        });
      },
      changePassword: (current, next) => {
        if (!db.session) return "Sign in first.";
        const account = db.accounts[db.session];
        if (account.password !== current) return "Current password is wrong.";
        if (next.length < 8) return "Use at least 8 characters.";
        commit({ ...db, accounts: { ...db.accounts, [db.session]: { ...account, password: next } } }, "Password updated on this browser.");
        return null;
      },
      requestReset: (email) => {
        const key = email.trim().toLowerCase();
        if (!db.accounts[key]) return "If that account exists, a reset code is ready. No account was found for that email on this browser.";
        const code = String(Math.floor(100000 + Math.random() * 900000));
        commit({ ...db, resetCodes: { ...db.resetCodes, [key]: code } });
        return code;
      },
      resetPassword: (email, code, next) => {
        const key = email.trim().toLowerCase();
        if (db.resetCodes[key] !== code) return "That reset code does not match.";
        if (next.length < 8) return "Use at least 8 characters.";
        const account = db.accounts[key];
        if (!account) return "No local account for that email.";
        const { [key]: _drop, ...rest } = db.resetCodes;
        commit({ ...db, resetCodes: rest, accounts: { ...db.accounts, [key]: { ...account, password: next } } }, "Password reset.");
        return null;
      },
      deleteAccount: (password) => {
        if (!db.session) return "Sign in first.";
        const account = db.accounts[db.session];
        if (account.password !== password) return "Password does not match.";
        const { [db.session]: _gone, ...accounts } = db.accounts;
        commit({ ...db, session: null, accounts }, "Account removed from this browser.");
        return null;
      },
      subscribe: (email) => {
        const key = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) {
          setNotice("Enter a valid email.");
          return;
        }
        if (db.newsletter.includes(key)) {
          setNotice("That email is already on the list.");
          return;
        }
        commit({ ...db, newsletter: [...db.newsletter, key] }, "Subscribed on this browser.");
      },
      unsubscribe: (email) => {
        const key = email.trim().toLowerCase();
        commit({ ...db, newsletter: db.newsletter.filter((item) => item !== key) }, "Unsubscribed on this browser.");
      },
      useAssistant: () => {
        if (!db.session) return false;
        const account = db.accounts[db.session];
        if (!assistantUnlocked(account.profile)) return false;
        const day = today();
        const count = account.profile.assistantDay === day ? account.profile.assistantCount : 0;
        if (count >= 40) return false;
        const profileNext = { ...account.profile, assistantDay: day, assistantCount: count + 1 };
        setDb({ ...db, accounts: { ...db.accounts, [db.session]: { ...account, profile: profileNext } } });
        return true;
      },
      spendBoardMinute: () => {
        if (!db.session) return false;
        const account = db.accounts[db.session];
        if (account.profile.boardMinutesUsed >= boardAllowance(account.profile)) return false;
        const profileNext = touch({ ...account.profile, boardMinutesUsed: account.profile.boardMinutesUsed + 1 });
        setDb({ ...db, accounts: { ...db.accounts, [db.session]: { ...account, profile: profileNext } } });
        return true;
      },
    };
  }, [db, notice, profile, ready]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore outside provider");
  return store;
}

export { DEMO_EMAIL, DEMO_PASSWORD };
