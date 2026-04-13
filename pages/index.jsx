import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

/* ── WaveBars ─────────────────────────────────────── */
function WaveBars({ active, color }) {
  const [h, setH] = useState([4, 4, 4, 4, 4]);
  useEffect(() => {
    if (!active) { setH([4, 4, 4, 4, 4]); return; }
    const t = setInterval(() => setH([...Array(5)].map(() => 4 + Math.random() * 14)), 160);
    return () => clearInterval(t);
  }, [active]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 18 }}>
      {h.map((v, i) => (
        <div key={i} style={{ width: 3, borderRadius: 2, background: color, height: v, transition: "height .12s", opacity: active ? 1 : 0.25 }} />
      ))}
    </div>
  );
}

/* ── MicButton ───────────────────────────────────── */
function MicButton({ listening, onClick, disabled }) {
  return (
    <>
      <button onClick={onClick} disabled={disabled} style={{
        width: 62, height: 62, borderRadius: "50%", border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: listening ? "radial-gradient(circle,#ff4081,#c2185b)" : "radial-gradient(circle,#2a2a40,#1a1a30)",
        boxShadow: listening ? "0 0 18px rgba(255,64,129,.5)" : "0 4px 14px rgba(0,0,0,.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s", transform: listening ? "scale(1.06)" : "scale(1)",
        animation: listening ? "pulse 1.5s infinite" : "none",
        touchAction: "manipulation",
      }}>
        {listening
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
        }
      </button>
      <style>{`
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,64,129,.4)}50%{box-shadow:0 0 0 10px rgba(255,64,129,0)}}
        @keyframes pop{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        html,body{margin:0;padding:0}*{box-sizing:border-box}
      `}</style>
    </>
  );
}

/* ── Panel ───────────────────────────────────────── */
function Panel({ title, sentences, interim, active, persian, isTranslation }) {
  const color = persian ? "#f5a623" : "#00d4ff";
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); }, [sentences, interim]);
  const hasContent = sentences.length > 0 || interim;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg,#0f0f1e,#0a0a16)",
      border: `1px solid ${active ? color + "55" : "rgba(255,255,255,.07)"}`,
      borderRadius: 10, overflow: "hidden",
      direction: persian ? "rtl" : "ltr",
      /* height comes from grid parent */
    }}>
      {/* title bar */}
      <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,.05)", background: "rgba(0,0,0,.25)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: 1, fontWeight: "bold", color: active ? color : "rgba(255,255,255,.28)" }}>
          {title}
        </span>
        <WaveBars active={active} color={color} />
      </div>

      {/* scroll area */}
      <div ref={ref} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px", display: "flex", flexDirection: "column", gap: 5, WebkitOverflowScrolling: "touch" }}>
        {!hasContent && (
          <p style={{ color: "rgba(255,255,255,.13)", fontSize: 11, textAlign: "center", margin: "auto 0", fontFamily: persian ? "Tahoma,sans-serif" : "monospace" }}>
            {persian ? "در انتظار..." : "Waiting..."}
          </p>
        )}

        {sentences.map((s, i) => {
          const last = i === sentences.length - 1;
          const txt = isTranslation ? s.translation : s.text;
          if (isTranslation && !s.translation && !s.translating) return null;
          return (
            <div key={s.id} style={{ padding: "5px 7px", borderRadius: 6, background: last ? color + "12" : "transparent", borderLeft: persian ? "none" : `2px solid ${last ? color : "transparent"}`, borderRight: persian ? `2px solid ${last ? color : "transparent"}` : "none", animation: "pop .25s" }}>
              {s.translating
                ? <span style={{ color: color + "70", letterSpacing: 2, fontFamily: "monospace" }}>• • •</span>
                : <p style={{ margin: 0, fontFamily: persian ? "Tahoma,sans-serif" : "monospace", fontSize: 13, lineHeight: 1.55, color: last ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.5)", wordBreak: "break-word" }}>{txt}</p>
              }
            </div>
          );
        })}

        {interim && (
          <p style={{ margin: "2px 7px", fontFamily: persian ? "Tahoma,sans-serif" : "monospace", fontSize: 13, color: color, fontStyle: "italic", opacity: .7, wordBreak: "break-word" }}>
            {interim}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── App ─────────────────────────────────────────── */
export default function Home() {
  const [listening, setListening] = useState(false);
  const [micLang, setMicLang]     = useState("fa");
  const [detected, setDetected]   = useState(null);
  const [supported, setSupported] = useState(true);
  const [error, setError]         = useState("");
  const [interim, setInterim]     = useState("");
  const [sentences, setSentences] = useState([]);

  const recRef     = useRef(null);
  const aliveRef   = useRef(false);
  const timerRef   = useRef(null);
  const langRef    = useRef("fa");   // always fresh lang value
  const startRef   = useRef(null);   // always fresh start fn

  useEffect(() => { langRef.current = micLang; }, [micLang]);

  /* translate */
  const translate = useCallback(async (id, text) => {
    setSentences(p => p.map(s => s.id === id ? { ...s, translating: true } : s));
    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);

      if (data.detected && data.detected !== langRef.current) {
        langRef.current = data.detected;
        setMicLang(data.detected);
      }
      setDetected(data.detected);
      setSentences(p => p.map(s => s.id === id ? { ...s, translation: data.translation, translating: false } : s));
    } catch (e) {
      setError("خطا: " + e.message);
      setSentences(p => p.map(s => s.id === id ? { ...s, translating: false } : s));
    }
  }, []);

  /* start recognition */
  const start = useCallback(() => {
    if (!aliveRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    try { recRef.current?.stop(); } catch {}
    const rec = new SR();
    rec.continuous    = true;
    rec.interimResults = true;
    rec.lang          = langRef.current === "fa" ? "fa-IR" : "en-US";

    rec.onresult = e => {
      let tmp = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          const txt = e.results[i][0].transcript.trim();
          if (txt) {
            const id = Date.now() + Math.random();
            setSentences(p => [...p, { id, text: txt, translation: null, translating: false }]);
            translate(id, txt);
          }
        } else tmp += e.results[i][0].transcript;
      }
      setInterim(tmp);
    };

    rec.onerror = e => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed") { setError("اجازه میکروفون داده نشد"); aliveRef.current = false; setListening(false); }
    };

    rec.onend = () => {
      if (aliveRef.current) timerRef.current = setTimeout(() => aliveRef.current && startRef.current?.(), 60);
    };

    recRef.current = rec;
    rec.start();
  }, [translate]);

  useEffect(() => { startRef.current = start; }, [start]);

  /* toggle */
  const toggle = useCallback(() => {
    if (aliveRef.current) {
      aliveRef.current = false;
      clearTimeout(timerRef.current);
      try { recRef.current?.stop(); } catch {}
      setListening(false);
      setInterim("");
    } else {
      setSentences([]); setDetected(null); setError(""); setInterim("");
      aliveRef.current = true;
      setListening(true);
      start();
    }
  }, [start]);

  useEffect(() => () => { aliveRef.current = false; clearTimeout(timerRef.current); try { recRef.current?.stop(); } catch {} }, []);

  const persianInput = detected === "fa" || (!detected && micLang === "fa");

  return (
    <>
      <Head>
        <title>Voice Translator</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
      </Head>

      <main style={{ height: "100dvh", display: "flex", flexDirection: "column", padding: 10, gap: 10, background: "#07070f", overflow: "hidden" }}>

        {/* header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: "bold", color: "#fff", margin: 0, fontFamily: "sans-serif" }}>TRANSLATOR</h1>
            <p  style={{ fontSize: 10, color: "rgba(255,255,255,.3)", margin: "1px 0 0", fontFamily: "monospace" }}>FA ↔ EN</p>
          </div>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,.05)", padding: 4, borderRadius: 8 }}>
            {["fa","en"].map(l => (
              <button key={l} onClick={() => { langRef.current = l; setMicLang(l); }} style={{ padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 12, fontFamily: l === "fa" ? "Tahoma,sans-serif" : "monospace", background: micLang === l ? (l==="fa" ? "#f5a62335" : "#00d4ff25") : "transparent", color: micLang === l ? (l==="fa" ? "#f5a623" : "#00d4ff") : "rgba(255,255,255,.3)" }}>
                {l === "fa" ? "FA" : "EN"}
              </button>
            ))}
          </div>
        </header>

        {/*
          ─────────────────────────────────────────────────
          CSS GRID: همیشه دو ستون کنار هم — موبایل و دسکتاپ
          gridTemplateColumns: "1fr 1fr" = دو ستون مساوی
          هیچ چیزی نمی‌تونه این رو عمودی کنه
          ─────────────────────────────────────────────────
        */}
        <div style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          minHeight: 0,
          overflow: "hidden",
        }}>
          {persianInput ? (
            <>
              <Panel title="ENGLISH"  sentences={sentences} active={sentences.some(s=>s.translating)} persian={false} isTranslation={true} />
              <Panel title="فارسی"    sentences={sentences} interim={interim} active={listening} persian={true}  isTranslation={false} />
            </>
          ) : (
            <>
              <Panel title="ENGLISH"  sentences={sentences} interim={interim} active={listening} persian={false} isTranslation={false} />
              <Panel title="فارسی"    sentences={sentences} active={sentences.some(s=>s.translating)} persian={true}  isTranslation={true} />
            </>
          )}
        </div>

        {/* controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexShrink: 0, paddingBottom: 4 }}>
          <button onClick={() => !listening && setSentences([])} disabled={listening} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.35)", fontSize: 11, cursor: listening ? "not-allowed" : "pointer", fontFamily: "monospace" }}>
            Clear
          </button>
          <MicButton listening={listening} onClick={toggle} disabled={!supported} />
          <div style={{ width: 36, textAlign: "center" }}>
            {detected && <span style={{ fontSize: 10, fontWeight: "bold", fontFamily: "monospace", color: detected==="fa" ? "#f5a623" : "#00d4ff" }}>{detected.toUpperCase()}</span>}
          </div>
        </div>

        {/* status */}
        {!supported && <p style={{ textAlign:"center", color:"#ff6b6b", fontSize:11, margin:0 }}>مرورگر شما Speech Recognition را پشتیبانی نمی‌کند</p>}
        {error      && <p style={{ textAlign:"center", color:"#ff6b6b", fontSize:11, margin:0, fontFamily:"monospace" }}>{error}</p>}
        {listening && !error && <p style={{ textAlign:"center", color:"#ff4081", fontSize:11, margin:0, fontFamily:"monospace" }}>● LISTENING</p>}
      </main>
    </>
  );
}
