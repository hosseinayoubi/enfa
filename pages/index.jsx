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
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

// ── Wave Bars (CSS-only, GPU-accelerated) ─────────────────────────────────────
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
            transition: `height ${0.18 + i * 0.02}s ease`,
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

// ── Language Badge (with optional confidence %) ───────────────────────────────
function LangBadge({ lang, confidence }) {
  const map = {
    fa: { label: "فارسی", color: "#f5a623" },
    en: { label: "English", color: "#00d4ff" },
  };
  if (!lang) return null;
  const { label, color } = map[lang] || {};
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          fontFamily: "'Courier Prime', monospace",
          letterSpacing: 1,
          padding: "2px 9px",
          borderRadius: 20,
          border: `1px solid ${color}55`,
          color,
          background: `${color}15`,
          textTransform: "uppercase",
        }}
      >
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
      aria-label={isListening ? "Stop listening" : "Start listening"}
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        border: "none",
        flexShrink: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        background: isListening
          ? "radial-gradient(circle, #ff4081, #c2185b)"
          : "radial-gradient(circle, #1e1e35, #141428)",
        boxShadow: isListening
          ? "0 0 0 0 rgba(255,64,129,0.5), 0 0 30px rgba(255,64,129,0.4)"
          : "0 4px 20px rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform: isListening ? "scale(1.1)" : "scale(1)",
        animation: isListening ? "pulse-ring 1.4s ease-out infinite" : "none",
        outline: "none",
      }}
    >
      {isListening ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
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

// ── Panel Shell ───────────────────────────────────────────────────────────────
function PanelShell({ title, side, isActive, scrollRef, children, confidence }) {
  const isPersian = side === "right";
  const borderColor = isPersian ? "#f5a623" : "#00d4ff";
  const glowColor = isPersian ? "rgba(245,166,35,0.12)" : "rgba(0,212,255,0.1)";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(160deg, #0f0f1e 0%, #0a0a16 100%)",
        border: `1px solid ${isActive ? borderColor + "55" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 18,
        overflow: "hidden",
        transition: "border-color 0.4s ease, box-shadow 0.4s ease",
        boxShadow: isActive
          ? `0 0 40px ${glowColor}, inset 0 0 30px ${glowColor}`
          : "0 4px 30px rgba(0,0,0,0.4)",
        direction: isPersian ? "rtl" : "ltr",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: "'Courier Prime', monospace",
              letterSpacing: 2,
              color: isActive ? borderColor : "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              transition: "color 0.3s",
            }}
          >
            {title}
          </span>
          {confidence > 0 && (
            <span style={{ fontSize: 10, color: `${borderColor}88`, fontFamily: "monospace" }}>
              {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
        <WaveBars active={isActive} color={borderColor} />
      </div>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: "20px 22px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Empty Placeholder ─────────────────────────────────────────────────────────
function EmptyHint({ isPersian, translationSide }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p
        style={{
          color: "rgba(255,255,255,0.12)",
          fontSize: 13,
          textAlign: "center",
          fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
          letterSpacing: isPersian ? 0 : 1,
        }}
      >
        {translationSide
          ? isPersian ? "ترجمه اینجا میاد..." : "translation appears here..."
          : isPersian ? "اینجا نشون داده میشه..." : "will appear here..."}
      </p>
    </div>
  );
}

// ── Text Row ──────────────────────────────────────────────────────────────────
function TextRow({ text, isLast, isPersian, borderColor }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        background: isLast ? `${borderColor}0d` : "transparent",
        borderLeft: isPersian ? "none" : `2px solid ${isLast ? borderColor + "55" : "rgba(255,255,255,0.06)"}`,
        borderRight: isPersian ? `2px solid ${isLast ? borderColor + "55" : "rgba(255,255,255,0.06)"}` : "none",
        transition: "background 0.3s",
      }}
    >
      <p
        style={{
          fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
          fontSize: isPersian ? 17 : 15,
          lineHeight: 1.8,
          margin: 0,
          color: isLast ? "rgba(240,240,245,0.95)" : "rgba(240,240,245,0.45)",
          letterSpacing: isPersian ? 0 : 0.3,
          wordSpacing: isPersian ? 4 : 0,
          transition: "color 0.4s",
        }}
      >
        {text}
      </p>
    </div>
  );
}

// ── Original Speech Panel ─────────────────────────────────────────────────────
function TextPanel({ title, sentences, interimText, isActive, side, confidence }) {
  const isPersian = side === "right";
  const borderColor = isPersian ? "#f5a623" : "#00d4ff";
  const scrollRef = useAutoScroll([sentences, interimText]);
  const hasContent = sentences.length > 0 || interimText;

  return (
    <PanelShell
      title={title}
      side={side}
      isActive={isActive}
      scrollRef={scrollRef}
      confidence={confidence}
    >
      {!hasContent ? (
        <EmptyHint isPersian={isPersian} translationSide={false} />
      ) : (
        <>
          {sentences.map((s, idx) => (
            <TextRow
              key={s.id}
              text={s.original}
              isLast={idx === sentences.length - 1}
              isPersian={isPersian}
              borderColor={borderColor}
            />
          ))}
          {interimText && (
            <div
              style={{
                padding: "10px 14px",
                borderLeft: isPersian ? "none" : `2px solid ${borderColor}33`,
                borderRight: isPersian ? `2px solid ${borderColor}33` : "none",
              }}
            >
              <p
                style={{
                  fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
                  fontSize: isPersian ? 17 : 15,
                  lineHeight: 1.8,
                  margin: 0,
                  color: `${borderColor}66`,
                  fontStyle: "italic",
                }}
              >
                {interimText}
              </p>
            </div>
          )}
        </>
      )}
    </PanelShell>
  );
}

// ── Translation Panel ─────────────────────────────────────────────────────────
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
            <div
              key={s.id}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: isLast ? `${borderColor}0d` : "transparent",
                borderLeft: isPersian ? "none" : `2px solid ${isLast ? borderColor + "55" : "rgba(255,255,255,0.06)"}`,
                borderRight: isPersian ? `2px solid ${isLast ? borderColor + "55" : "rgba(255,255,255,0.06)"}` : "none",
                transition: "background 0.3s",
              }}
            >
              {s.translating ? (
                <p
                  style={{
                    fontSize: 18,
                    letterSpacing: 4,
                    margin: 0,
                    color: `${borderColor}44`,
                    fontFamily: "'Courier Prime', monospace",
                    animation: "blink 0.9s ease-in-out infinite",
                  }}
                >
                  · · ·
                </p>
              ) : s.translation ? (
                <p
                  style={{
                    fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
                    fontSize: isPersian ? 17 : 15,
                    lineHeight: 1.8,
                    margin: 0,
                    color: isLast ? "rgba(240,240,245,0.95)" : "rgba(240,240,245,0.45)",
                    letterSpacing: isPersian ? 0 : 0.3,
                    wordSpacing: isPersian ? 4 : 0,
                    transition: "color 0.4s",
                  }}
                >
                  {s.translation}
                </p>
              ) : null}
            </div>
          );
        })
      )}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </PanelShell>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [micLang, setMicLang] = useState("fa");
  const [detectedLang, setDetectedLang] = useState(null);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [sentences, setSentences] = useState([]);
  const [volume, setVolume] = useState(0);
  const [confidence, setConfidence] = useState(0);

  // Speech recognition refs
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const langRef = useRef("fa");
  const idCounterRef = useRef(0);
  const restartRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const currentInterimRef = useRef("");

  // AudioContext refs (volume monitor)
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  // ── Keep langRef in sync ────────────────────────────────────────────────────
  useEffect(() => { langRef.current = micLang; }, [micLang]);

  // ── Volume Monitor ──────────────────────────────────────────────────────────
  const startVolumeMonitor = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!isListeningRef.current) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.min(avg / 128, 1));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.error("Volume monitor failed:", e);
    }
  }, []);

  const stopVolumeMonitor = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current = null;
    streamRef.current = null;
    setVolume(0);
  }, []);

  // ── Translate ───────────────────────────────────────────────────────────────
const translateSentence = useCallback(async (id, text) => {
    setSentences((prev) => prev.map((s) => (s.id === id ? { ...s, translating: true } : s)));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: text.trim(),
          sourceLang: langRef.current // ارسال زبان فعلی میکروفون
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setSentences((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, translation: data.translation, translating: false } : s
        )
      );
    } catch (e) {
      console.error("[translate]", e);
      setError(`ترجمه ناموفق: ${e.message}`);
      setSentences((prev) => prev.map((s) => (s.id === id ? { ...s, translating: false } : s)));
    }
  }, []);
  // ── Commit Sentence ─────────────────────────────────────────────────────────
  const commitSentence = useCallback(
    (text) => {
      const clean = text.trim();
      if (!clean || !isListeningRef.current) return;
      clearTimeout(silenceTimerRef.current);
      currentInterimRef.current = "";
      setInterimTranscript("");
      setConfidence(0);
      const newId = ++idCounterRef.current;
      setSentences((prev) => [
        ...prev,
        { id: newId, original: clean, translation: null, translating: false },
      ]);
      translateSentence(newId, clean);
    },
    [translateSentence]
  );

  // ── Build & Start Recognition ───────────────────────────────────────────────
  const createAndStart = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    if (!isListeningRef.current) return;

    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = langRef.current === "fa" ? "fa-IR" : "en-US";

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          clearTimeout(silenceTimerRef.current);
          currentInterimRef.current = "";
          setConfidence(result[0].confidence || 0.9);
          const finalText = result[0].transcript.trim();
          if (finalText) commitSentence(finalText);
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) {
        currentInterimRef.current = interim;
        setInterimTranscript(interim);
        // Persian fix: Chrome fa-IR rarely fires isFinal — use silence timer
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const txt = currentInterimRef.current.trim();
          if (txt) commitSentence(txt);
        }, 600);
      }
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed") {
        setError("اجازه میکروفون داده نشد");
        isListeningRef.current = false;
        setIsListening(false);
        return;
      }
      setError(`خطا: ${e.error}`);
      isListeningRef.current = false;
      setIsListening(false);
    };

    rec.onend = () => {
      if (isListeningRef.current) setTimeout(() => restartRef.current?.(), 250);
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch { setTimeout(() => restartRef.current?.(), 500); }
  }, [commitSentence]);

  useEffect(() => { restartRef.current = createAndStart; }, [createAndStart]);

  // ── Toggle Listening ────────────────────────────────────────────────────────
  const toggleListening = useCallback(async () => {
    if (isListeningRef.current) {
      isListeningRef.current = false;
      clearTimeout(silenceTimerRef.current);
      currentInterimRef.current = "";
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      stopVolumeMonitor();
      setIsListening(false);
      setInterimTranscript("");
      setConfidence(0);
    } else {
      setSentences([]);
      setDetectedLang(null);
      setError("");
      setInterimTranscript("");
      setConfidence(0);
      currentInterimRef.current = "";
      idCounterRef.current = 0;
      isListeningRef.current = true;
      setIsListening(true);
      await startVolumeMonitor();
      createAndStart();
    }
  }, [createAndStart, startVolumeMonitor, stopVolumeMonitor]);

  // ── Clear All ───────────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    if (isListeningRef.current) return;
    setSentences([]);
    setDetectedLang(null);
    setError("");
    setInterimTranscript("");
    setConfidence(0);
  }, []);

  // ── Cleanup on Unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      clearTimeout(silenceTimerRef.current);
      cancelAnimationFrame(animFrameRef.current);
      audioCtxRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  const originalLang = detectedLang || micLang;
  const isPersianInput = originalLang === "fa";

  return (
    <>
      <Head>
        <title>صدا ترجمه | Voice Translator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "24px 28px",
          gap: 20,
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(0,212,255,0.04) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 80% 100%, rgba(245,166,35,0.05) 0%, transparent 50%), " +
            "#07070f",
        }}
      >
        {/* ── Header ── */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                letterSpacing: -0.5,
                color: "#f0f0f5",
                lineHeight: 1,
                margin: 0,
              }}
            >
              VOICE TRANSLATE
            </h1>
            <p
              style={{
                fontSize: 11,
                fontFamily: "'Courier Prime', monospace",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: 2,
                margin: "3px 0 0",
              }}
            >
              FA ↔ EN · REAL-TIME
            </p>
          </div>

          {/* Mic Language Selector */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              padding: "6px 8px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: "'Courier Prime', monospace",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: 1,
              }}
            >
              MIC:{" "}
            </span>
            {["fa", "en"].map((l) => (
              <button
                key={l}
                onClick={() => { if (!isListeningRef.current) setMicLang(l); }}
                disabled={isListening}
                style={{
                  padding: "4px 12px",
                  borderRadius: 7,
                  border: "none",
                  cursor: isListening ? "not-allowed" : "pointer",
                  fontFamily: l === "fa" ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: l === "en" ? 1 : 0,
                  background:
                    micLang === l
                      ? l === "fa" ? "#f5a62330" : "#00d4ff25"
                      : "transparent",
                  color:
                    micLang === l
                      ? l === "fa" ? "#f5a623" : "#00d4ff"
                      : "rgba(255,255,255,0.3)",
                  transition: "all 0.2s",
                  outline: "none",
                }}
              >
                {l === "fa" ? "فارسی" : "EN"}
              </button>
            ))}
          </div>
        </header>

        {/* ── Panels ── */}
        <div style={{ flex: 1, display: "flex", gap: 16, minHeight: 0 }}>
          {isPersianInput ? (
            <>
              <TranslationPanel
                title="ENGLISH"
                side="left"
                sentences={sentences}
                isActive={sentences.some((s) => s.translating)}
              />
              <TextPanel
                title="فارسی"
                side="right"
                sentences={sentences}
                interimText={interimTranscript}
                isActive={isListening}
                confidence={confidence}
              />
            </>
          ) : (
            <>
              <TextPanel
                title="ENGLISH"
                side="left"
                sentences={sentences}
                interimText={interimTranscript}
                isActive={isListening}
                confidence={confidence}
              />
              <TranslationPanel
                title="فارسی"
                side="right"
                sentences={sentences}
                isActive={sentences.some((s) => s.translating)}
              />
            </>
          )}
        </div>

        {/* ── Controls ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            paddingBottom: 4,
          }}
        >
          <button
            onClick={clearAll}
            disabled={isListening}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "rgba(255,255,255,0.35)",
              cursor: isListening ? "not-allowed" : "pointer",
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12,
              letterSpacing: 1,
              outline: "none",
            }}
          >
            CLEAR
          </button>

          <MicButton isListening={isListening} onClick={toggleListening} disabled={!supported} />

          <div style={{ minWidth: 80 }}>
            {detectedLang && <LangBadge lang={detectedLang} confidence={confidence} />}
          </div>
        </div>

        {/* ── Volume Bar ── */}
        {isListening && (
          <div
            style={{
              width: "100%",
              maxWidth: 260,
              margin: "0 auto",
              height: 4,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${volume * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #00d4ff, #ff4081)",
                transition: "width 0.1s ease",
                borderRadius: 2,
              }}
            />
          </div>
        )}

        {/* ── Status Messages ── */}
        {!supported && (
          <p style={{ textAlign: "center", color: "#ff6b6b", fontSize: 13, fontFamily: "'Vazirmatn', sans-serif", margin: 0 }}>
            مرورگرت Speech Recognition رو ساپورت نمیکنه. از Chrome استفاده کن.
          </p>
        )}
        {error && (
          <p style={{ textAlign: "center", color: "#ff6b6b", fontSize: 12, fontFamily: "'Courier Prime', monospace", margin: 0 }}>
            {error}
          </p>
        )}
        {isListening && !error && volume < 0.05 && (
          <p style={{ textAlign: "center", color: "#f5a623", fontSize: 12, fontFamily: "'Vazirmatn', sans-serif", margin: 0 }}>
            صدایی شنیده نمیشه — میکروفون رو چک کنید
          </p>
        )}
        {isListening && !error && volume >= 0.05 && (
          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              fontFamily: "'Courier Prime', monospace",
              color: "rgba(255,64,129,0.7)",
              letterSpacing: 2,
              animation: "blink 1.5s ease-in-out infinite",
              margin: 0,
            }}
          >
            ● LISTENING
          </p>
        )}
      </main>
    </>
  );
}
