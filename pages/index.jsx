import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

// ── Wave bars ───────────────────────────────────────────────────────────────
function WaveBars({ active, color }) {
  const bars = Array.from({ length: 9 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 36 }}>
      {bars.map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color,
          height: active ? `${14 + Math.sin(i * 0.8) * 12}px` : "6px",
          transition: `height ${0.18 + i * 0.02}s ease`,
          animation: active ? `wave ${0.6 + (i % 3) * 0.15}s ease-in-out ${i * 0.07}s infinite alternate` : "none",
          opacity: active ? 1 : 0.25,
        }} />
      ))}
      <style>{`@keyframes wave { from{height:6px} to{height:32px} }`}</style>
    </div>
  );
}

// ── Language Badge ──────────────────────────────────────────────────────────
function LangBadge({ lang }) {
  const map = { fa: { label: "فارسی", color: "#f5a623" }, en: { label: "English", color: "#00d4ff" } };
  if (!lang) return null;
  const { label, color } = map[lang] || {};
  return (
    <span style={{
      fontSize: 11, fontFamily: "'Courier Prime', monospace", letterSpacing: 1,
      padding: "2px 9px", borderRadius: 20,
      border: `1px solid ${color}55`, color, background: `${color}15`, textTransform: "uppercase",
    }}>{label}</span>
  );
}

// ── Mic Button ──────────────────────────────────────────────────────────────
function MicButton({ isListening, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={isListening ? "Stop" : "Start"}
      style={{
        width: 80, height: 80, borderRadius: "50%", border: "none", flexShrink: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        background: isListening ? "radial-gradient(circle, #ff4081, #c2185b)" : "radial-gradient(circle, #1e1e35, #141428)",
        boxShadow: isListening ? "0 0 0 0 rgba(255,64,129,0.5), 0 0 30px rgba(255,64,129,0.4)" : "0 4px 20px rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform: isListening ? "scale(1.1)" : "scale(1)",
        animation: isListening ? "pulse-ring 1.4s ease-out infinite" : "none",
        outline: "none",
      }}>
      {isListening ? (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
          <path d="M19 11a7 7 0 0 1-14 0" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="23" x2="15" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(255,64,129,0.5), 0 0 30px rgba(255,64,129,0.4); }
          70%  { box-shadow: 0 0 0 22px rgba(255,64,129,0), 0 0 30px rgba(255,64,129,0.4); }
          100% { box-shadow: 0 0 0 0 rgba(255,64,129,0), 0 0 30px rgba(255,64,129,0.4); }
        }
      `}</style>
    </button>
  );
}

// ── Auto-scroll hook ────────────────────────────────────────────────────────
function useAutoScroll(deps) {
  const ref = useRef(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

// ── Shared panel shell ──────────────────────────────────────────────────────
function PanelShell({ title, side, isActive, scrollRef, children }) {
  const isPersian = side === "right";
  const borderColor = isPersian ? "#f5a623" : "#00d4ff";
  const glowColor = isPersian ? "rgba(245,166,35,0.12)" : "rgba(0,212,255,0.1)";
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      background: "linear-gradient(160deg, #0f0f1e 0%, #0a0a16 100%)",
      border: `1px solid ${isActive ? borderColor + "55" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 18, overflow: "hidden",
      transition: "border-color 0.4s ease, box-shadow 0.4s ease",
      boxShadow: isActive ? `0 0 40px ${glowColor}, inset 0 0 30px ${glowColor}` : "0 4px 30px rgba(0,0,0,0.4)",
      direction: isPersian ? "rtl" : "ltr",
    }}>
      <div style={{
        padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          fontSize: 11, fontFamily: "'Courier Prime', monospace", letterSpacing: 2,
          color: isActive ? borderColor : "rgba(255,255,255,0.25)", textTransform: "uppercase", transition: "color 0.3s",
        }}>{title}</span>
        <WaveBars active={isActive} color={borderColor} />
      </div>
      <div ref={scrollRef} style={{
        flex: 1, padding: "20px 22px", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Empty placeholder ───────────────────────────────────────────────────────
function EmptyHint({ isPersian, translationSide }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{
        color: "rgba(255,255,255,0.12)", fontSize: 13, textAlign: "center",
        fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
        letterSpacing: isPersian ? 0 : 1,
      }}>
        {translationSide
          ? (isPersian ? "ترجمه اینجا میاد..." : "translation appears here...")
          : (isPersian ? "اینجا نشون داده میشه..." : "will appear here...")}
      </p>
    </div>
  );
}

// ── Text row ────────────────────────────────────────────────────────────────
function TextRow({ text, isLast, isPersian, borderColor }) {
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 10,
      background: isLast ? `${borderColor}0d` : "transparent",
      borderLeft: isPersian ? "none" : `2px solid ${isLast ? borderColor + "55" : "rgba(255,255,255,0.06)"}`,
      borderRight: isPersian ? `2px solid ${isLast ? borderColor + "55" : "rgba(255,255,255,0.06)"}` : "none",
      transition: "background 0.3s",
    }}>
      <p style={{
        fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
        fontSize: isPersian ? 17 : 15, lineHeight: 1.8, margin: 0,
        color: isLast ? "rgba(240,240,245,0.95)" : "rgba(240,240,245,0.45)",
        letterSpacing: isPersian ? 0 : 0.3, wordSpacing: isPersian ? 4 : 0, transition: "color 0.4s",
      }}>{text}</p>
    </div>
  );
}

// ── Original Speech Panel ───────────────────────────────────────────────────
function TextPanel({ title, sentences, interimText, isActive, side }) {
  const isPersian = side === "right";
  const borderColor = isPersian ? "#f5a623" : "#00d4ff";
  const scrollRef = useAutoScroll([sentences, interimText]);
  const hasContent = sentences.length > 0 || interimText;

  return (
    <PanelShell title={title} side={side} isActive={isActive} scrollRef={scrollRef}>
      {!hasContent ? (
        <EmptyHint isPersian={isPersian} translationSide={false} />
      ) : (
        <>
          {sentences.map((s, idx) => (
            <TextRow key={s.id} text={s.original}
              isLast={idx === sentences.length - 1} isPersian={isPersian} borderColor={borderColor} />
          ))}
          {interimText && (
            <div style={{
              padding: "10px 14px",
              borderLeft: isPersian ? "none" : `2px solid ${borderColor}33`,
              borderRight: isPersian ? `2px solid ${borderColor}33` : "none",
            }}>
              <p style={{
                fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
                fontSize: isPersian ? 17 : 15, lineHeight: 1.8, margin: 0,
                color: `${borderColor}66`, fontStyle: "italic",
              }}>{interimText}</p>
            </div>
          )}
        </>
      )}
    </PanelShell>
  );
}

// ── Translation Panel ───────────────────────────────────────────────────────
function TranslationPanel({ title, sentences, isActive, side }) {
  const isPersian = side === "right";
  const borderColor = isPersian ? "#f5a623" : "#00d4ff";
  const scrollRef = useAutoScroll([sentences]);
  const hasContent = sentences.some((s) => s.translation || s.translating);

  return (
    <PanelShell title={title} side={side} isActive={isActive} scrollRef={scrollRef}>
      {!hasContent ? (
        <EmptyHint isPersian={isPersian} translationSide={true} />
      ) : (
        sentences.map((s, idx) => {
          const isLast = idx === sentences.length - 1;
          return (
            <div key={s.id} style={{
              padding: "10px 14px", borderRadius: 10,
              background: isLast ? `${borderColor}0d` : "transparent",
              borderLeft: isPersian ? "none" : `2px solid ${isLast ? borderColor + "55" : "rgba(255,255,255,0.06)"}`,
              borderRight: isPersian ? `2px solid ${isLast ? borderColor + "55" : "rgba(255,255,255,0.06)"}` : "none",
              transition: "background 0.3s",
            }}>
              {s.translating ? (
                <p style={{
                  fontSize: 18, letterSpacing: 4, margin: 0,
                  color: `${borderColor}44`, fontFamily: "'Courier Prime', monospace",
                  animation: "blink 0.9s ease-in-out infinite",
                }}>· · ·</p>
              ) : s.translation ? (
                <p style={{
                  fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
                  fontSize: isPersian ? 17 : 15, lineHeight: 1.8, margin: 0,
                  color: isLast ? "rgba(240,240,245,0.95)" : "rgba(240,240,245,0.45)",
                  letterSpacing: isPersian ? 0 : 0.3, wordSpacing: isPersian ? 4 : 0, transition: "color 0.4s",
                }}>{s.translation}</p>
              ) : null}
            </div>
          );
        })
      )}
    </PanelShell>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [micLang, setMicLang] = useState("fa");
  const [detectedLang, setDetectedLang] = useState(null);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [sentences, setSentences] = useState([]);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const idCounterRef = useRef(0);
  const restartRef = useRef(null);
  // ── Persian fix: Chrome fa-IR often never fires isFinal ─────────────────
  const silenceTimerRef = useRef(null);
  const currentInterimRef = useRef("");

  // ── Translate ────────────────────────────────────────────────────────────
  const translateSentence = useCallback(async (id, text) => {
    setSentences((prev) => prev.map((s) => (s.id === id ? { ...s, translating: true } : s)));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setDetectedLang(data.detected);
      setSentences((prev) =>
        prev.map((s) => s.id === id ? { ...s, translation: data.translation, translating: false } : s)
      );
    } catch {
      setError("ترجمه ناموفق بود. API key رو چک کن.");
      setSentences((prev) => prev.map((s) => (s.id === id ? { ...s, translating: false } : s)));
    }
  }, []);

  // ── Commit a sentence (called on isFinal OR silence timer) ──────────────
  const commitSentence = useCallback((text) => {
    const clean = text.trim();
    if (!clean || !isListeningRef.current) return;
    clearTimeout(silenceTimerRef.current);
    currentInterimRef.current = "";
    setInterimTranscript("");
    const newId = ++idCounterRef.current;
    setSentences((prev) => [...prev, { id: newId, original: clean, translation: null, translating: false }]);
    translateSentence(newId, clean);
  }, [translateSentence]);

  // ── Build and start a fresh recognition instance ─────────────────────────
  const createAndStart = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    if (!isListeningRef.current) return;

    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = micLang === "fa" ? "fa-IR" : "en-US";

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          // Got a final result — cancel timer and commit
          clearTimeout(silenceTimerRef.current);
          currentInterimRef.current = "";
          const finalText = result[0].transcript.trim();
          if (finalText) commitSentence(finalText);
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) {
        currentInterimRef.current = interim;
        setInterimTranscript(interim);

        // SILENCE TIMER: fa-IR on Chrome rarely fires isFinal.
        // After 1.5 s of silence, treat current interim as the final sentence.
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const txt = currentInterimRef.current.trim();
          if (txt) commitSentence(txt);
        }, 1500);
      }
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      setError(`خطا: ${e.error}`);
      isListeningRef.current = false;
      setIsListening(false);
    };

    rec.onend = () => {
      // Restart with a brand-new instance (avoids Chrome's InvalidStateError)
      if (isListeningRef.current) {
        setTimeout(() => restartRef.current?.(), 250);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      setTimeout(() => restartRef.current?.(), 500);
    }
  }, [micLang, commitSentence]);

  useEffect(() => { restartRef.current = createAndStart; }, [createAndStart]);

  // ── Toggle listening ────────────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      isListeningRef.current = false;
      clearTimeout(silenceTimerRef.current);
      currentInterimRef.current = "";
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setIsListening(false);
      setInterimTranscript("");
    } else {
      setSentences([]);
      setDetectedLang(null);
      setError("");
      setInterimTranscript("");
      currentInterimRef.current = "";
      idCounterRef.current = 0;
      isListeningRef.current = true;
      setIsListening(true);
      createAndStart();
    }
  }, [createAndStart]);

  const clearAll = () => {
    if (!isListeningRef.current) {
      setSentences([]);
      setDetectedLang(null);
      setError("");
      setInterimTranscript("");
    }
  };

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      clearTimeout(silenceTimerRef.current);
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  const originalLang = detectedLang || micLang;

  return (
    <>
      <Head>
        <title>صدا ترجمه | Voice Translator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{
        height: "100vh", display: "flex", flexDirection: "column",
        padding: "24px 28px", gap: 20,
        background: "radial-gradient(ellipse at 20% 0%, rgba(0,212,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(245,166,35,0.05) 0%, transparent 50%), #07070f",
      }}>

        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: -0.5, color: "#f0f0f5", lineHeight: 1 }}>
              VOICE TRANSLATE
            </h1>
            <p style={{ fontSize: 11, fontFamily: "'Courier Prime', monospace", color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginTop: 3 }}>
              FA ↔ EN · REAL-TIME
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "6px 8px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span style={{ fontSize: 11, fontFamily: "'Courier Prime', monospace", color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>MIC:</span>
            {["fa", "en"].map((l) => (
              <button key={l}
                onClick={() => { if (!isListeningRef.current) setMicLang(l); }}
                disabled={isListening}
                style={{
                  padding: "4px 12px", borderRadius: 7, border: "none",
                  cursor: isListening ? "not-allowed" : "pointer",
                  fontFamily: l === "fa" ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
                  fontSize: 12, fontWeight: 600, letterSpacing: l === "en" ? 1 : 0,
                  background: micLang === l ? (l === "fa" ? "#f5a62330" : "#00d4ff25") : "transparent",
                  color: micLang === l ? (l === "fa" ? "#f5a623" : "#00d4ff") : "rgba(255,255,255,0.3)",
                  transition: "all 0.2s", outline: "none",
                }}
              >{l === "fa" ? "فارسی" : "EN"}</button>
            ))}
          </div>
        </header>

        {/* Panels */}
        <div style={{ flex: 1, display: "flex", gap: 16, minHeight: 0 }}>
          {originalLang === "en"
            ? <TextPanel title="ENGLISH" side="left" sentences={sentences} interimText={interimTranscript} isActive={isListening} />
            : <TranslationPanel title="ENGLISH" side="left" sentences={sentences} isActive={sentences.some(s => s.translating)} />
          }
          {originalLang === "fa"
            ? <TextPanel title="فارسی" side="right" sentences={sentences} interimText={interimTranscript} isActive={isListening} />
            : <TranslationPanel title="فارسی" side="right" sentences={sentences} isActive={sentences.some(s => s.translating)} />
          }
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, paddingBottom: 4 }}>
          <button onClick={clearAll} disabled={isListening} style={{
            padding: "8px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent", color: "rgba(255,255,255,0.35)",
            cursor: isListening ? "not-allowed" : "pointer",
            fontFamily: "'Courier Prime', monospace", fontSize: 12, letterSpacing: 1, outline: "none",
          }}>CLEAR</button>

          <MicButton isListening={isListening} onClick={toggleListening} disabled={!supported} />

          <div style={{ minWidth: 80 }}>
            {detectedLang && <LangBadge lang={detectedLang} />}
          </div>
        </div>

        {/* Status */}
        {!supported && <p style={{ textAlign: "center", color: "#ff6b6b", fontSize: 13, fontFamily: "'Vazirmatn', sans-serif" }}>مرورگرت Speech Recognition رو ساپورت نمیکنه. از Chrome استفاده کن.</p>}
        {error && <p style={{ textAlign: "center", color: "#ff6b6b", fontSize: 12, fontFamily: "'Courier Prime', monospace" }}>{error}</p>}
        {isListening && !error && (
          <p style={{ textAlign: "center", fontSize: 11, fontFamily: "'Courier Prime', monospace", color: "rgba(255,64,129,0.7)", letterSpacing: 2, animation: "blink 1.5s ease-in-out infinite" }}>
            ● LISTENING
          </p>
        )}

        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </main>
    </>
  );
}
