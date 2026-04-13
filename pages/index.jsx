import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

/* ─── WaveBars ──────────────────────────────────────────── */
function WaveBars({ active, color }) {
  const [h, setH] = useState([4, 4, 4, 4, 4]);
  useEffect(() => {
    if (!active) { setH([4, 4, 4, 4, 4]); return; }
    const id = setInterval(
      () => setH([...Array(5)].map(() => 4 + Math.random() * 14)),
      160
    );
    return () => clearInterval(id);
  }, [active]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 18 }}>
      {h.map((v, i) => (
        <div
          key={i}
          style={{
            width: 3, borderRadius: 2, background: color,
            height: v, transition: "height .12s",
            opacity: active ? 1 : 0.22,
          }}
        />
      ))}
    </div>
  );
}

/* ─── MicButton ─────────────────────────────────────────── */
function MicButton({ on, onClick, disabled }) {
  return (
    <>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          width: 62, height: 62, borderRadius: "50%", border: "none",
          background: on
            ? "radial-gradient(circle,#ff4081,#c2185b)"
            : "radial-gradient(circle,#2a2a40,#1a1a30)",
          boxShadow: on
            ? "0 0 18px rgba(255,64,129,.55)"
            : "0 4px 14px rgba(0,0,0,.4)",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
          transform: on ? "scale(1.06)" : "scale(1)",
          animation: on ? "mpulse 1.5s infinite" : "none",
          touchAction: "manipulation", flexShrink: 0,
        }}
      >
        {on
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
        }
      </button>
      <style>{`
        @keyframes mpulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,64,129,.4); }
          50%      { box-shadow: 0 0 0 10px rgba(255,64,129,0); }
        }
        @keyframes popin {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }

        /* ── Mobile Responsive (ستون‌ها همیشه افقی) ── */
        @media (max-width: 768px) {
          .translator-grid {
            gap: 6px !important;
          }
          .panel {
            padding: 6px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </>
  );
}

/* ─── Panel ─────────────────────────────────────────────── */
function Panel({ title, sentences, interim, active, fa, isTranslation }) {
  const color = fa ? "#f5a623" : "#00d4ff";
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [sentences, interim]);

  const hasContent = sentences.some(s => isTranslation ? s.translation : s.text) || interim;

  return (
    <div className="panel" style={{
      height: "100%",
      display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg,#0f0f1e,#0a0a16)",
      border: `1px solid ${active ? color + "55" : "rgba(255,255,255,.07)"}`,
      borderRadius: 10, overflow: "hidden",
      direction: fa ? "rtl" : "ltr",
    }}>

      {/* header */}
      <div style={{
        padding: "7px 10px", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,.05)",
        background: "rgba(0,0,0,.25)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          fontSize: 10, fontFamily: "monospace", letterSpacing: 1, fontWeight: "bold",
          color: active ? color : "rgba(255,255,255,.28)",
        }}>
          {title}
        </span>
        <WaveBars active={active} color={color} />
      </div>

      {/* body */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: "8px 6px",
          display: "flex", flexDirection: "column", gap: 5,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {!hasContent && (
          <p style={{
            color: "rgba(255,255,255,.13)", fontSize: 11, textAlign: "center",
            margin: "auto 0",
            fontFamily: fa ? "Tahoma,sans-serif" : "monospace",
          }}>
            {fa ? "در انتظار..." : "Waiting..."}
          </p>
        )}

        {sentences.map((s, i) => {
          const last = i === sentences.length - 1;
          const text = isTranslation ? s.translation : s.text;

          if (isTranslation && !s.translation && !s.translating) return null;

          return (
            <div
              key={s.id}
              style={{
                padding: "5px 7px", borderRadius: 6,
                background: last ? color + "12" : "transparent",
                borderLeft:  fa ? "none" : `2px solid ${last ? color : "transparent"}`,
                borderRight: fa ? `2px solid ${last ? color : "transparent"}` : "none",
                animation: "popin .22s",
              }}
            >
              {s.translating
                ? <span style={{ color: color + "70", letterSpacing: 2, fontFamily: "monospace" }}>• • •</span>
                : <p style={{
                    margin: 0,
                    fontFamily: fa ? "Tahoma,sans-serif" : "monospace",
                    fontSize: 13, lineHeight: 1.55,
                    color: last ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.5)",
                    wordBreak: "break-word",
                  }}>
                    {text}
                  </p>
              }
            </div>
          );
        })}

        {interim && (
          <p style={{
            margin: "2px 7px", opacity: .7,
            fontFamily: fa ? "Tahoma,sans-serif" : "monospace",
            fontSize: 13, color, fontStyle: "italic", wordBreak: "break-word",
          }}>
            {interim}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── App ───────────────────────────────────────────────── */
export default function Home() {
  const [on,        setOn]        = useState(false);
  const [micLang,   setMicLang]   = useState("fa");
  const [detected,  setDetected]  = useState(null);
  const [supported, setSupported] = useState(true);
  const [apiError,  setApiError]  = useState("");
  const [interim,   setInterim]   = useState("");
  const [sentences, setSentences] = useState([]);

  const recRef         = useRef(null);
  const alive          = useRef(false);
  const timer          = useRef(null);
  const langRef        = useRef("fa");
  const startRef       = useRef(null);
  const lastFinalRef   = useRef("");        // ← جلوگیری از تکرار ترنسکریپت

  useEffect(() => { langRef.current = micLang; }, [micLang]);

  /* ── translate ──────────────────────────────────────── */
  const translate = useCallback(async (id, text) => {
    setSentences(prev =>
      prev.map(s => s.id === id ? { ...s, translating: true } : s)
    );

    try {
      const res  = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      if (data.detected && data.detected !== langRef.current) {
        langRef.current = data.detected;
        setMicLang(data.detected);
      }
      setDetected(data.detected);
      setApiError("");

      setSentences(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, translation: data.translation, translating: false }
            : s
        )
      );
    } catch (e) {
      console.error("[translate]", e);
      setApiError(e.message);
      setSentences(prev =>
        prev.map(s => s.id === id ? { ...s, translating: false } : s)
      );
    }
  }, []);

  /* ── start recognition ──────────────────────────────── */
  const start = useCallback(() => {
    if (!alive.current) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    try { recRef.current?.stop(); } catch {}

    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = langRef.current === "fa" ? "fa-IR" : "en-US";

    rec.onresult = e => {
      let tmp = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          const txt = e.results[i][0].transcript.trim();
          if (txt && txt !== lastFinalRef.current) {   // ← فیکس تکرار
            lastFinalRef.current = txt;
            const id = crypto.randomUUID();
            setSentences(prev => [
              ...prev,
              { id, text: txt, translation: null, translating: false },
            ]);
            translate(id, txt);
          }
        } else {
          tmp += e.results[i][0].transcript;
        }
      }
      setInterim(tmp);
    };

    rec.onerror = e => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed") {
        setApiError("اجازه میکروفون داده نشد");
        alive.current = false;
        setOn(false);
      }
    };

    rec.onend = () => {
      if (alive.current) {
        timer.current = setTimeout(() => alive.current && startRef.current?.(), 60);
      }
    };

    recRef.current = rec;
    try { rec.start(); } catch { setTimeout(() => startRef.current?.(), 120); }
  }, [translate]);

  useEffect(() => { startRef.current = start; }, [start]);

  /* ── toggle ─────────────────────────────────────────── */
  const toggle = useCallback(() => {
    if (alive.current) {
      alive.current = false;
      clearTimeout(timer.current);
      try { recRef.current?.stop(); } catch {}
      setOn(false);
      setInterim("");
    } else {
      setSentences([]);
      setDetected(null);
      setApiError("");
      setInterim("");
      lastFinalRef.current = "";        // ← ریست کردن هنگام شروع جدید
      alive.current = true;
      setOn(true);
      start();
    }
  }, [start]);

  /* cleanup */
  useEffect(() => () => {
    alive.current = false;
    clearTimeout(timer.current);
    try { recRef.current?.stop(); } catch {}
  }, []);

  const faInput = detected === "fa" || (!detected && micLang === "fa");

  return (
    <>
      <Head>
        <title>Voice Translator</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
      </Head>

      <main style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        padding: 10,
        gap: 8,
        background: "#07070f",
        overflow: "hidden",
      }}>

        {/* header */}
        <header style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: "bold", color: "#fff", margin: 0, fontFamily: "sans-serif" }}>
              TRANSLATOR
            </h1>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,.3)", margin: "1px 0 0", fontFamily: "monospace" }}>
              FA ↔ EN
            </p>
          </div>

          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,.05)", padding: 4, borderRadius: 8 }}>
            {["fa", "en"].map(l => (
              <button
                key={l}
                onClick={() => { langRef.current = l; setMicLang(l); }}
                style={{
                  padding: "4px 12px", borderRadius: 6, border: "none",
                  cursor: "pointer", fontWeight: "bold", fontSize: 12,
                  fontFamily: l === "fa" ? "Tahoma,sans-serif" : "monospace",
                  background: micLang === l
                    ? (l === "fa" ? "#f5a62335" : "#00d4ff25")
                    : "transparent",
                  color: micLang === l
                    ? (l === "fa" ? "#f5a623" : "#00d4ff")
                    : "rgba(255,255,255,.3)",
                }}
              >
                {l === "fa" ? "FA" : "EN"}
              </button>
            ))}
          </div>
        </header>

        {/* panels - همیشه افقی (حتی توی موبایل) */}
        <div style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr",
          gap: 8,
        }} className="translator-grid">
          {faInput ? (
            <>
              <Panel title="ENGLISH" sentences={sentences} active={sentences.some(s => s.translating)} fa={false} isTranslation={true} />
              <Panel title="فارسی" sentences={sentences} interim={interim} active={on} fa={true} isTranslation={false} />
            </>
          ) : (
            <>
              <Panel title="ENGLISH" sentences={sentences} interim={interim} active={on} fa={false} isTranslation={false} />
              <Panel title="فارسی" sentences={sentences} active={sentences.some(s => s.translating)} fa={true} isTranslation={true} />
            </>
          )}
        </div>

        {/* controls */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 20,
          flexShrink: 0, paddingBottom: 4,
        }}>
          <button
            onClick={() => { if (!on) { setSentences([]); setApiError(""); lastFinalRef.current = ""; } }}
            disabled={on}
            style={{
              padding: "6px 14px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,.1)",
              background: "transparent",
              color: "rgba(255,255,255,.35)",
              fontSize: 11, fontFamily: "monospace",
              cursor: on ? "not-allowed" : "pointer",
            }}
          >
            Clear
          </button>

          <MicButton on={on} onClick={toggle} disabled={!supported} />

          <div style={{ width: 36, textAlign: "center" }}>
            {detected && (
              <span style={{
                fontSize: 10, fontWeight: "bold", fontFamily: "monospace",
                color: detected === "fa" ? "#f5a623" : "#00d4ff",
              }}>
                {detected.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* status */}
        {!supported && (
          <p style={{ margin: 0, textAlign: "center", color: "#ff6b6b", fontSize: 11 }}>
            مرورگر شما Speech Recognition را پشتیبانی نمی‌کند
          </p>
        )}
        {apiError && (
          <p style={{ margin: 0, textAlign: "center", color: "#ff6b6b", fontSize: 11, fontFamily: "monospace" }}>
            ⚠ {apiError}
          </p>
        )}
        {on && !apiError && (
          <p style={{ margin: 0, textAlign: "center", color: "#ff4081", fontSize: 11, fontFamily: "monospace" }}>
            ● LISTENING
          </p>
        )}
      </main>
    </>
  );
}
