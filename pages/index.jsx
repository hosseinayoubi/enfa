import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

// ── Wave bars animation ─────────────────────────────────────────────
function WaveBars({ active, color }) {
  const [heights, setHeights] = useState([4, 4, 4, 4, 4]);

  useEffect(() => {
    if (!active) { setHeights([4, 4, 4, 4, 4]); return; }
    const interval = setInterval(() => {
      setHeights([...Array(5)].map(() => 4 + Math.random() * 14));
    }, 150);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 20, flexShrink: 0 }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: 3, borderRadius: 1.5, background: color, height: `${h}px`, transition: "height 0.12s ease", opacity: active ? 1 : 0.3 }} />
      ))}
    </div>
  );
}

// ── Mic Button ──────────────────────────────────────────────────────
function MicButton({ isListening, onClick, disabled }) {
  return (
    <>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          width: 64, height: 64, borderRadius: "50%", border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          background: isListening ? "radial-gradient(circle, #ff4081, #c2185b)" : "radial-gradient(circle, #2a2a40, #1a1a30)",
          boxShadow: isListening ? "0 0 20px rgba(255,64,129,0.5)" : "0 4px 15px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", transform: isListening ? "scale(1.05)" : "scale(1)",
          animation: isListening ? "micPulse 1.5s infinite" : "none",
          touchAction: "manipulation", flexShrink: 0,
        }}
      >
        {isListening ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>
      <style>{`
        @keyframes micPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,64,129,0.4); } 50% { box-shadow: 0 0 0 12px rgba(255,64,129,0); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>
    </>
  );
}

// ── Panel Component ─────────────────────────────────────────────────
function Panel({ title, sentences, interim, isActive, side, isTranslation }) {
  const isPersian = side === "right";
  const color = isPersian ? "#f5a623" : "#00d4ff";
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [sentences, interim]);

  const hasContent = sentences.length > 0 || interim;

  return (
    <div style={{
      flex: "1 1 0",
      width: 0,           // مهم: flex item رو در container نگه می‌داره
      minWidth: 0,
      maxWidth: "50%",    // هرگز بیشتر از نصف صفحه نمی‌شه
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(160deg, #0f0f1e 0%, #0a0a16 100%)",
      border: `1px solid ${isActive ? color + "60" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 10,
      overflow: "hidden",
      direction: isPersian ? "rtl" : "ltr",
    }}>
      {/* Header */}
      <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.2)", flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontFamily: "monospace", letterSpacing: 1, color: isActive ? color : "rgba(255,255,255,0.3)", fontWeight: "bold" }}>
          {title}
        </span>
        <WaveBars active={isActive} color={color} />
      </div>

      {/* Content */}
      <div ref={scrollRef} style={{ flex: 1, padding: "10px 8px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 6, justifyContent: hasContent ? "flex-start" : "center", WebkitOverflowScrolling: "touch" }}>
        {!hasContent && (
          <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, textAlign: "center", fontFamily: isPersian ? "Tahoma, sans-serif" : "monospace", margin: 0 }}>
            {isPersian ? "در انتظار..." : "Waiting..."}
          </p>
        )}

        {sentences.map((s, idx) => {
          const isLast = idx === sentences.length - 1;
          const text = isTranslation ? s.translation : s.text;
          if (isTranslation && !s.translation && !s.translating) return null;
          return (
            <div key={s.id} style={{ padding: "6px 8px", borderRadius: 6, background: isLast ? color + "15" : "transparent", borderLeft: isPersian ? "none" : `2px solid ${isLast ? color : "transparent"}`, borderRight: isPersian ? `2px solid ${isLast ? color : "transparent"}` : "none", animation: "fadeIn 0.3s" }}>
              {s.translating ? (
                <span style={{ color: color + "80", fontFamily: "monospace", letterSpacing: 2, fontSize: 13 }}>• • •</span>
              ) : (
                <p style={{ fontFamily: isPersian ? "Tahoma, sans-serif" : "monospace", fontSize: 13, lineHeight: 1.55, color: isLast ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)", margin: 0, wordBreak: "break-word", overflowWrap: "break-word" }}>
                  {text}
                </p>
              )}
            </div>
          );
        })}

        {interim && (
          <div style={{ padding: "6px 8px", opacity: 0.65 }}>
            <p style={{ fontFamily: isPersian ? "Tahoma, sans-serif" : "monospace", fontSize: 13, lineHeight: 1.55, color: color, margin: 0, fontStyle: "italic", wordBreak: "break-word" }}>
              {interim}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────
export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [micLang, setMicLang] = useState("fa");
  const [detectedLang, setDetectedLang] = useState(null);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState("");
  const [interim, setInterim] = useState("");
  const [sentences, setSentences] = useState([]);

  const recRef = useRef(null);
  const listeningRef = useRef(false);
  const restartTimerRef = useRef(null);
  const micLangRef = useRef("fa");
  const startRef = useRef(null);

  useEffect(() => { micLangRef.current = micLang; }, [micLang]);

  // ── Translate ──────────────────────────────────────────────────────
  const translate = useCallback(async (id, text) => {
    setSentences((prev) => prev.map((s) => (s.id === id ? { ...s, translating: true } : s)));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();

      if (data.detected && data.detected !== micLangRef.current) {
        micLangRef.current = data.detected;
        setMicLang(data.detected);
      }
      setDetectedLang(data.detected);

      setSentences((prev) =>
        prev.map((s) => (s.id === id ? { ...s, translation: data.translation, translating: false } : s))
      );
    } catch (e) {
      console.error("Translate error:", e.message);
      setError("خطا: " + e.message);
      setSentences((prev) => prev.map((s) => (s.id === id ? { ...s, translating: false } : s)));
    }
  }, []);

  // ── Start recognition ──────────────────────────────────────────────
  const start = useCallback(() => {
    if (!listeningRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    if (recRef.current) { try { recRef.current.stop(); } catch {} }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = micLangRef.current === "fa" ? "fa-IR" : "en-US";

    rec.onresult = (e) => {
      let tmpInterim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text) {
            const id = Date.now() + Math.random();
            setSentences((prev) => [...prev, { id, text, translation: null, translating: false }]);
            translate(id, text);
          }
        } else {
          tmpInterim += result[0].transcript;
        }
      }
      setInterim(tmpInterim);
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed") { setError("اجازه دسترسی به میکروفون داده نشد"); listeningRef.current = false; setIsListening(false); return; }
      console.error("Speech error:", e.error);
    };

    rec.onend = () => {
      if (listeningRef.current) {
        restartTimerRef.current = setTimeout(() => { if (listeningRef.current) startRef.current?.(); }, 50);
      }
    };

    recRef.current = rec;
    try { rec.start(); } catch { setTimeout(() => startRef.current?.(), 100); }
  }, [translate]);

  useEffect(() => { startRef.current = start; }, [start]);

  // ── Toggle ─────────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    if (listeningRef.current) {
      listeningRef.current = false;
      clearTimeout(restartTimerRef.current);
      try { recRef.current?.stop(); } catch {}
      setIsListening(false);
      setInterim("");
    } else {
      setSentences([]); setDetectedLang(null); setError(""); setInterim("");
      listeningRef.current = true;
      setIsListening(true);
      start();
    }
  }, [start]);

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      clearTimeout(restartTimerRef.current);
      try { recRef.current?.stop(); } catch {}
    };
  }, []);

  const isPersianInput = detectedLang === "fa" || (!detectedLang && micLang === "fa");

  return (
    <>
      <Head>
        <title>Voice Translator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <main style={{ height: "100dvh", display: "flex", flexDirection: "column", padding: 10, gap: 10, background: "#07070f", overflow: "hidden" }}>

        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: "bold", color: "#fff", margin: 0, fontFamily: "sans-serif" }}>TRANSLATOR</h1>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", margin: "2px 0 0", fontFamily: "monospace" }}>FA ↔ EN</p>
          </div>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 8 }}>
            {["fa", "en"].map((l) => (
              <button key={l} onClick={() => { micLangRef.current = l; setMicLang(l); }}
                style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: micLang === l ? (l === "fa" ? "#f5a62340" : "#00d4ff30") : "transparent", color: micLang === l ? (l === "fa" ? "#f5a623" : "#00d4ff") : "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: l === "fa" ? "Tahoma, sans-serif" : "monospace" }}>
                {l === "fa" ? "FA" : "EN"}
              </button>
            ))}
          </div>
        </header>

        {/* ── Panels — همیشه افقی ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "row", flexWrap: "nowrap", gap: 8, minHeight: 0, overflow: "hidden" }}>
          {isPersianInput ? (
            <>
              <Panel title="ENGLISH" sentences={sentences} isActive={sentences.some((s) => s.translating)} side="left" isTranslation={true} />
              <Panel title="فارسی" sentences={sentences} interim={interim} isActive={isListening} side="right" isTranslation={false} />
            </>
          ) : (
            <>
              <Panel title="ENGLISH" sentences={sentences} interim={interim} isActive={isListening} side="left" isTranslation={false} />
              <Panel title="فارسی" sentences={sentences} isActive={sentences.some((s) => s.translating)} side="right" isTranslation={true} />
            </>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexShrink: 0, paddingBottom: 6 }}>
          <button onClick={() => !isListening && setSentences([])} disabled={isListening}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: isListening ? "not-allowed" : "pointer", fontFamily: "monospace" }}>
            Clear
          </button>
          <MicButton isListening={isListening} onClick={toggle} disabled={!supported} />
          <div style={{ minWidth: 36, textAlign: "center" }}>
            {detectedLang && (
              <span style={{ fontSize: 10, color: detectedLang === "fa" ? "#f5a623" : "#00d4ff", fontWeight: "bold", fontFamily: "monospace" }}>
                {detectedLang === "fa" ? "FA" : "EN"}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        {!supported && <div style={{ textAlign: "center", color: "#ff6b6b", fontSize: 11, paddingBottom: 6 }}>مرورگر شما Speech Recognition را پشتیبانی نمی‌کند</div>}
        {error && <div style={{ textAlign: "center", color: "#ff6b6b", fontSize: 11, paddingBottom: 6, fontFamily: "monospace" }}>{error}</div>}
        {isListening && !error && <div style={{ textAlign: "center", color: "#ff4081", fontSize: 11, paddingBottom: 6, fontFamily: "monospace" }}>● LISTENING</div>}
      </main>
    </>
  );
}
