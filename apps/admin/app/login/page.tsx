"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const idleSignedOut = searchParams.get("reason") === "idle";

  /* If already authenticated, go straight to dashboard */
  useEffect(() => {
    fetch("/api/auth/me").then(r => {
      if (r.ok) router.replace(searchParams.get("from") || "/");
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        setShake(true);
        setTimeout(() => setShake(false), 450);
        setLoading(false);
        return;
      }

      /* Tokens are in httpOnly cookies — just redirect */
      router.replace(searchParams.get("from") || "/");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        html[data-theme] { color-scheme: light; }
        body { overflow: auto; }

        /* CSS variables (light only) */
        :root {
          --brand: #1C3A2B; --brand-2: #2D5C42;
          --accent: #E8572A;
          --ink: #111411; --ink-2: #3a3d38; --ink-3: #7a7e77;
          --bg: #F4F5F3; --glass-solid: #fff;
          --chip: #EAECE8; --chip-2: #E0E2DE;
          --border: rgba(7,99,48,.11); --border-strong: rgba(7,99,48,.2);
          --glass-2: rgba(255,255,255,.72); --glass-hover: rgba(255,255,255,.88);
          --glass-blur: 22px; --shadow-sm: 0 1px 4px rgba(0,0,0,.09);
          --ease: cubic-bezier(.22,1,.36,1);
          --danger: #e5484d;
        }

        .auth {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.08fr 1fr;
          background: var(--bg);
          font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
        }

        /* top bar */
        .auth-top {
          position: fixed; top: 0; left: 0; right: 0; z-index: 20;
          display: flex; align-items: center; padding: 22px clamp(20px,4vw,44px);
          pointer-events: none;
        }
        .auth-logo { display: flex; align-items: center; gap: 11px; pointer-events: auto; text-decoration: none; }
        .auth-logo .mark {
          width: 38px; height: 38px; border-radius: 11px;
          background: linear-gradient(150deg, var(--brand-2), var(--brand));
          display: grid; place-items: center; color: #fff;
          box-shadow: 0 8px 18px -7px var(--brand);
        }
        .auth-logo .mark svg { width: 21px; height: 21px; }
        .auth-logo b { font-size: 16px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
        .auth-logo small { display: block; font-size: 11px; color: var(--ink-3); font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-top: -3px; }

        /* brand panel */
        .auth-brand {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: center;
          padding: clamp(40px,6vw,92px);
          background: linear-gradient(150deg, #0a5a2c 0%, #064524 55%, #053a1f 100%);
          color: #fff; isolation: isolate;
        }
        .auth-brand::before, .auth-brand::after {
          content: ""; position: absolute; border-radius: 50%; z-index: -1; filter: blur(8px);
        }
        .auth-brand::before { width: 460px; height: 460px; top: -160px; right: -150px; background: radial-gradient(circle, rgba(255,104,23,.5), transparent 62%); }
        .auth-brand::after { width: 520px; height: 520px; bottom: -220px; left: -160px; background: radial-gradient(circle, rgba(18,200,110,.42), transparent 60%); }
        .brand-grain {
          position: absolute; inset: 0; z-index: -1; opacity: .5;
          background:
            radial-gradient(60% 50% at 80% 15%, rgba(255,255,255,.10), transparent 60%),
            radial-gradient(50% 50% at 10% 90%, rgba(255,255,255,.06), transparent 60%);
        }

        .brand-kicker {
          display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
          font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
          padding: 7px 13px; border-radius: 999px;
          background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
          backdrop-filter: blur(8px); margin-bottom: 26px;
        }
        .brand-kicker .pip { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px rgba(255,104,23,.25); }
        .auth-brand h1 { font-size: clamp(34px,4.4vw,54px); font-weight: 900; line-height: 1.02; letter-spacing: -0.035em; }
        .auth-brand h1 em { font-style: normal; color: #ffd9c2; }
        .auth-brand .lede { font-size: clamp(15px,1.5vw,17px); color: rgba(255,255,255,.82); margin-top: 20px; max-width: 42ch; line-height: 1.55; }

        .brand-feats { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }
        .brand-feat { display: flex; align-items: center; gap: 14px; font-size: 14.5px; font-weight: 600; color: rgba(255,255,255,.92); }
        .brand-feat .fi {
          width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
          display: grid; place-items: center;
          background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18); color: #fff;
        }
        .brand-feat .fi svg { width: 20px; height: 20px; }
        .brand-feat span small { display: block; font-size: 12.5px; font-weight: 500; color: rgba(255,255,255,.6); margin-top: 1px; }

        .brand-card {
          margin-top: 44px; display: flex; align-items: center; gap: 18px;
          padding: 16px 20px; border-radius: 18px; align-self: flex-start;
          background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); backdrop-filter: blur(14px);
        }
        .bc-stat { text-align: center; }
        .bc-stat b { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; display: block; line-height: 1; }
        .bc-stat span { font-size: 11px; color: rgba(255,255,255,.65); font-weight: 600; }
        .bc-sep { width: 1px; height: 34px; background: rgba(255,255,255,.2); }

        /* form panel */
        .auth-form-wrap {
          display: flex; align-items: center; justify-content: center;
          padding: clamp(30px,5vw,60px) clamp(20px,5vw,64px); position: relative;
        }
        .auth-card { width: 100%; max-width: 408px; }
        .auth-head h2 { font-size: clamp(26px,3vw,31px); font-weight: 800; letter-spacing: -0.03em; color: var(--ink); }
        .auth-head p { font-size: 14.5px; color: var(--ink-3); margin-top: 7px; }

        .auth-form { margin-top: 30px; }
        .a-field { margin-bottom: 17px; }
        .a-field > label { display: block; font-size: 12.5px; font-weight: 700; color: var(--ink-2); margin-bottom: 8px; }
        .a-input { position: relative; display: flex; align-items: center; }
        .a-input svg.lead { position: absolute; left: 14px; width: 18px; height: 18px; color: var(--ink-3); pointer-events: none; transition: color .2s; }
        .a-input input {
          width: 100%; padding: 13px 14px 13px 42px; border-radius: 13px;
          background: var(--chip); border: 1px solid var(--border); color: var(--ink); font-size: 14.5px;
          font-family: inherit; transition: border-color .2s, background .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .a-input input::placeholder { color: var(--ink-3); }
        .a-input input:focus { outline: none; border-color: var(--brand); background: var(--glass-2); box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand) 16%, transparent); }
        .a-input:focus-within svg.lead { color: var(--brand); }
        .a-input.invalid input { border-color: var(--danger); }
        .peek {
          position: absolute; right: 8px; width: 32px; height: 32px; border-radius: 9px;
          display: grid; place-items: center; color: var(--ink-3); background: none; border: none; cursor: pointer;
        }
        .peek:hover { color: var(--ink); background: var(--chip-2); }
        .peek svg { width: 17px; height: 17px; }

        .a-row { display: flex; align-items: center; justify-content: space-between; margin: 4px 0 24px; }
        .a-check { display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--ink-2); font-weight: 600; cursor: pointer; user-select: none; }
        .a-box { width: 19px; height: 19px; border-radius: 6px; border: 1.6px solid var(--border-strong); display: grid; place-items: center; color: #fff; transition: background .2s, border-color .2s; flex-shrink: 0; }
        .a-box svg { width: 13px; height: 13px; }
        .a-check.checked .a-box { background: var(--brand); border-color: var(--brand); }
        .a-forgot { font-size: 13px; font-weight: 700; color: var(--brand-2); text-decoration: none; }
        .a-forgot:hover { text-decoration: underline; }

        .a-error {
          margin-bottom: 16px; padding: 11px 14px; border-radius: 12px; font-size: 13px; font-weight: 600;
          background: color-mix(in oklab, var(--danger) 10%, transparent);
          border: 1px solid color-mix(in oklab, var(--danger) 22%, transparent);
          color: var(--danger); display: flex; align-items: center; gap: 8px;
        }
        .a-error svg { width: 16px; height: 16px; flex-shrink: 0; }

        .a-submit {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 9px;
          padding: 14px; border-radius: 14px; font-size: 15px; font-weight: 700; color: #fff; border: none; cursor: pointer;
          background: var(--brand); box-shadow: 0 12px 24px -10px var(--brand); font-family: inherit;
          transition: transform .18s var(--ease), box-shadow .2s, background .2s;
        }
        .a-submit:hover:not(:disabled) { background: var(--brand-2); transform: translateY(-1px); box-shadow: 0 16px 30px -10px var(--brand); }
        .a-submit:active:not(:disabled) { transform: translateY(0); }
        .a-submit:disabled { opacity: .7; cursor: not-allowed; }
        .a-submit svg { width: 18px; height: 18px; }
        .spin {
          width: 18px; height: 18px; border: 2.4px solid rgba(255,255,255,.35);
          border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .err-shake { animation: shake .4s; }

        @media (max-width: 940px) {
          .auth { grid-template-columns: 1fr; }
          .auth-brand { display: none; }
          .auth-form-wrap { min-height: 100vh; }
        }
      `}</style>

      {/* Top bar — logo only, no theme toggle */}
      <div className="auth-top">
        <a className="auth-logo" href="/">
          <span className="mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 6a3.8 3.8 0 0 0 4.9 4.9L21 12.5l-8.5 8.5a2 2 0 0 1-2.8-2.8L17.2 10 14.5 6z"/>
              <path d="M14.5 6 11 2.5a3.8 3.8 0 0 0-4.9 4.9L9.5 11"/>
            </svg>
          </span>
          <span><b>Nova Tyres</b><small>Console</small></span>
        </a>
      </div>

      <div className="auth">
        {/* Brand panel */}
        <section className="auth-brand">
          <div className="brand-grain" />
          <span className="brand-kicker"><span className="pip" />Staff &amp; manager portal</span>
          <h1>Run every store<br />from <em>one place.</em></h1>
          <p className="lede">Bookings, inventory, customer chat, reviews and your website — all in one calm, glassy console built for the floor.</p>

          <div className="brand-feats">
            <div className="brand-feat">
              <span className="fi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 4.5 4h15L21 9.5"/><path d="M4.5 9.5V20h15V9.5"/><path d="M9 20v-5h5v5"/></svg>
              </span>
              <span>6 workshops, one dashboard<small>Live status, capacity and revenue</small></span>
            </div>
            <div className="brand-feat">
              <span className="fi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-5A8 8 0 1 1 21 11.5z"/></svg>
              </span>
              <span>Reply to customers in real time<small>Store chat the team can pick up</small></span>
            </div>
            <div className="brand-feat">
              <span className="fi">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>
              </span>
              <span>Edit your website &amp; SEO<small>Sections you can preview live</small></span>
            </div>
          </div>

          <div className="brand-card">
            <div className="bc-stat"><b>6</b><span>Stores</span></div>
            <div className="bc-sep" />
            <div className="bc-stat"><b>4.8★</b><span>Avg rating</span></div>
            <div className="bc-sep" />
            <div className="bc-stat"><b>2,384</b><span>Reviews</span></div>
          </div>
        </section>

        {/* Form panel */}
        <section className="auth-form-wrap">
          <div className={`auth-card${shake ? " err-shake" : ""}`}>
            <div className="auth-head">
              <h2>Welcome back</h2>
              <p>Sign in to your Nova Tyres console.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>

              {idleSignedOut && !error && (
                <div className="a-error" style={{ background: "color-mix(in oklab, #f59e0b 10%, transparent)", borderColor: "color-mix(in oklab, #f59e0b 25%, transparent)", color: "#92400e" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>
                  </svg>
                  You were signed out due to 30 minutes of inactivity.
                </div>
              )}

              {error && (
                <div className="a-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="a-field">
                <label htmlFor="email">Email</label>
                <div className={`a-input${!email && shake ? " invalid" : ""}`}>
                  <svg className="lead" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>
                  </svg>
                  <input
                    id="email" type="email" placeholder="you@novatyres.au"
                    value={email} onChange={e => setEmail(e.target.value)}
                    autoComplete="username" autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="a-field">
                <label htmlFor="password">Password</label>
                <div className={`a-input${!password && shake ? " invalid" : ""}`}>
                  <svg className="lead" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>
                  </svg>
                  <input
                    id="password" type={showPw ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button type="button" className="peek" aria-label={showPw ? "Hide password" : "Show password"} onClick={() => setShowPw(v => !v)}>
                    {showPw ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.7 6.3A9 9 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-2.9 3.4M6.1 7.5A15 15 0 0 0 2.5 12S6 18 12 18a8.7 8.7 0 0 0 3.6-.8"/>
                        <path d="M3 3l18 18"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + forgot */}
              <div className="a-row">
                <span className={`a-check${remember ? " checked" : ""}`} onClick={() => setRemember(v => !v)}>
                  <span className="a-box">
                    {remember && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </span>
                  Keep me signed in
                </span>
                <a className="a-forgot" href="#">Forgot password?</a>
              </div>

              {/* Submit */}
              <button className="a-submit" type="submit" disabled={loading}>
                {loading ? (
                  <span className="spin" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>

            </form>
          </div>
        </section>
      </div>
    </>
  );
}
