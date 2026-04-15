import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

// ── Auto-scroll Hook ──────────────────────────────────────────────────────────
function useAutoScroll(deps) {
  const ref = useRef(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, deps);
  return ref;
}

// ── Wave Bars ────────────────────────────────────────────────────────────────
function WaveBars({ active, color }) {
  const bars = Array.from({ length: 9 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 36 }}>
      {bars.map((_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: color,
            height: active ? `${14 + Math.sin(i * 0.8) * 12}px` : "6px",
            transition: `height 0.18s ease`,
            animation: active
              ? `wave ${0.6 + (i % 3) * 0.15}s ease-in-out ${i * 0.07}s infinite alternate`
              : "none",
            opacity: active ? 1 : 0.25,
          }}
        />
      ))}
      <style>{`@keyframes wave { from { height: 6px } to { height: 32px } }`}</style>
    </div>
  );
}

// ── Language Badge ───────────────────────────────────────────────────────────
function LangBadge({ lang, confidence }) {
  const map = {
    fa: { label: "فارسی", color: "#f5a623" },
    en: { label: "English", color: "#00d4ff" },
  };
  if (!lang) return null;
  const { label, color } = map[lang] || {};
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 20, border: `1px solid ${color}55`, color, background: `${color}15` }}>
        {label}
      </span>
      {confidence > 0 && (
        <span style={{ fontSize: 9, color: `${color}88`, fontFamily: "monospace" }}>
          {Math.round(confidence * 100)}%
        </span>
      )}
    </div>
  );
}

// ── Mic Button ────────────────────────────────────────────────────────────────
function MicButton({ isListening, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 80, height: 80, borderRadius: "50%", border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: isListening ? "radial-gradient(circle, #ff4081, #c2185b)" : "radial-gradient(circle, #1e1e35, #141428)",
        boxShadow: isListening ? "0 0 30px rgba(255,64,129,0.4)" : "0 4px 20px rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform: isListening ? "scale(1.1)" : "scale(1)",
      }}
    >
      {isListening ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4" /></svg>
      )}
    </button>
  );
}

// ── Panel Shell & Row ──────────────────────────────────────────────────────────
function PanelShell({ title, side, isActive, scrollRef, children, confidence }) {
  const isPersian = side === "right";
  const borderColor = isPersian ? "#f5a623" : "#00d4ff";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0f0f1e", border: `1px solid ${isActive ? borderColor + "55" : "rgba(255,255,255,0.07)"}`, borderRadius: 18, overflow: "hidden", direction: isPersian ? "rtl" : "ltr" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: isActive ? borderColor : "#555" }}>{title}</span>
        <WaveBars active={isActive} color={borderColor} />
      </div>
      <div ref={scrollRef} style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function TextRow({ text, isLast, isPersian, borderColor, isInterim }) {
  return (
    <div style={{ padding: "10px", borderRadius: 10, background: isLast && !isInterim ? `${borderColor}15` : "transparent" }}>
      <p style={{ margin: 0, fontSize: 17, color: isInterim ? `${borderColor}88` : "#f0f0f5", fontStyle: isInterim ? "italic" : "normal" }}>{text}</p>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [micLang, setMicLang] = useState("fa");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [sentences, setSentences] = useState([]);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const langRef = useRef("fa");

  useEffect(() => { langRef.current = micLang; }, [micLang]);

  const translateSentence = async (id, text) => {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceLang: langRef.current }),
      });
      const data = await res.json();
      setSentences(prev => prev.map(s => s.id === id ? { ...s, translation: data.translation, translating: false } : s));
    } catch (e) {
      setSentences(prev => prev.map(s => s.id === id ? { ...s, translating: false } : s));
    }
  };

  const commitSentence = useCallback((text) => {
    const clean = text.trim();
    if (!clean) return;
    const newId = Date.now();
    setSentences(prev => [...prev, { id: newId, original: clean, translation: "", translating: true }]);
    setInterimTranscript("");
    translateSentence(newId, clean);
  }, []);

  const startRecognition = () => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return setError("Not Supported");

    const rec = new Speech();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = langRef.current === "fa" ? "fa-IR" : "en-US";

    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          commitSentence(transcript);
        } else {
          interim += transcript;
        }
      }
      setInterimTranscript(interim);
      setConfidence(event.results[event.results.length - 1][0].confidence);

      clearTimeout(silenceTimerRef.current);
      if (interim) {
        silenceTimerRef.current = setTimeout(() => commitSentence(interim), 1500);
      }
    };

    rec.onend = () => { if (isListeningRef.current) rec.start(); };
    rec.onerror = (e) => { if (e.error !== "no-speech") setError(e.error); };

    recognitionRef.current = rec;
    rec.start();
  };

  const toggleListening = () => {
    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current?.stop();
      setInterimTranscript("");
    } else {
      setSentences([]);
      setError("");
      isListeningRef.current = true;
      setIsListening(true);
      startRecognition();
    }
  };

  const scrollLeft = useAutoScroll([sentences]);
  const scrollRight = useAutoScroll([sentences, interimTranscript]);

  return (
    <main style={{ height: "100vh", background: "#07070f", display: "flex", flexDirection: "column", padding: 25, gap: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "#fff", margin: 0, fontSize: 20 }}>VOICE TRANSLATE</h1>
        <div style={{ display: "flex", gap: 10, background: "#1a1a2e", padding: 5, borderRadius: 10 }}>
          <button onClick={() => setMicLang("fa")} disabled={isListening} style={{ background: micLang === "fa" ? "#f5a62333" : "none", color: micLang === "fa" ? "#f5a623" : "#555", border: "none", padding: "5px 15px", cursor: "pointer", borderRadius: 8 }}>فارسی</button>
          <button onClick={() => setMicLang("en")} disabled={isListening} style={{ background: micLang === "en" ? "#00d4ff33" : "none", color: micLang === "en" ? "#00d4ff" : "#555", border: "none", padding: "5px 15px", cursor: "pointer", borderRadius: 8 }}>EN</button>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", gap: 20, minHeight: 0 }}>
        <PanelShell title="TRANSLATION" side="left" isActive={sentences.some(s => s.translating)} scrollRef={scrollLeft}>
          {sentences.map(s => (
            <div key={s.id} style={{ padding: "10px", color: s.translating ? "#444" : "#00ff88" }}>
              {s.translating ? "..." : s.translation}
            </div>
          ))}
        </PanelShell>

        <PanelShell title="ORIGINAL" side="right" isActive={isListening} scrollRef={scrollRight} confidence={confidence}>
          {sentences.map((s, i) => <TextRow key={s.id} text={s.original} isLast={i === sentences.length - 1} isPersian={micLang === "fa"} borderColor={micLang === "fa" ? "#f5a623" : "#00d4ff"} />)}
          {interimTranscript && <TextRow text={interimTranscript} isInterim={true} isPersian={micLang === "fa"} borderColor={micLang === "fa" ? "#f5a623" : "#00d4ff"} />}
        </PanelShell>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
        <MicButton isListening={isListening} onClick={toggleListening} />
        <LangBadge lang={micLang} confidence={confidence} />
        {error && <span style={{ color: "#ff4b4b" }}>{error}</span>}
      </div>
    </main>
  );
}
