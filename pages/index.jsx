import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

// ── Wave bars animation ─────────────────────────────────────────────
function WaveBars({ active, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 20 }}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 1.5,
            background: color,
            height: active ? `${6 + Math.random() * 10}px` : "4px",
            transition: "height 0.15s ease",
            opacity: active ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

// ── Mic Button ──────────────────────────────────────────────────────
function MicButton({ isListening, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 70,
        height: 70,
        borderRadius: "50%",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: isListening
          ? "radial-gradient(circle, #ff4081, #c2185b)"
          : "radial-gradient(circle, #2a2a40, #1a1a30)",
        boxShadow: isListening
          ? "0 0 20px rgba(255,64,129,0.5)"
          : "0 4px 15px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        transform: isListening ? "scale(1.05)" : "scale(1)",
        animation: isListening ? "pulse 1.5s infinite" : "none",
        touchAction: "manipulation",
      }}
    >
      {isListening ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,64,129,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(255,64,129,0); }
        }
      `}</style>
    </button>
  );
}

// ── Panel Component ─────────────────────────────────────────────────
function Panel({ title, sentences, interim, isActive, side, isTranslation }) {
  const isPersian = side === "right";
  const color = side === "right" ? "#f5a623" : "#00d4ff";
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [sentences, interim]);

  const hasContent = sentences.length > 0 || interim;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0, // Critical for mobile
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(160deg, #0f0f1e 0%, #0a0a16 100%)",
        border: `1px solid ${isActive ? color + "60" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12,
        overflow: "hidden",
        direction: isPersian ? "rtl" : "ltr",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: "monospace",
            letterSpacing: 1,
            color: isActive ? color : "rgba(255,255,255,0.3)",
            fontWeight: "bold",
          }}
        >
          {title}
        </span>
        <WaveBars active={isActive} color={color} />
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: 12,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          justifyContent: hasContent ? "flex-start" : "center",
        }}
      >
        {!hasContent && (
          <p
            style={{
              color: "rgba(255,255,255,0.15)",
              fontSize: 12,
              textAlign: "center",
              fontFamily: isPersian ? "Tahoma, sans-serif" : "monospace",
            }}
          >
            {isPersian ? "در انتظار..." : "Waiting..."}
          </p>
        )}

        {sentences.map((s, idx) => {
          const isLast = idx === sentences.length - 1;
          const text = isTranslation ? s.translation : s.text;
          if (isTranslation && !s.translation && !s.translating) return null;

          return (
            <div
              key={s.id}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: isLast ? color + "15" : "transparent",
                borderLeft: isPersian ? "none" : `2px solid ${isLast ? color : "transparent"}`,
                borderRight: isPersian ? `2px solid ${isLast ? color : "transparent"}` : "none",
                animation: s.translating ? "fadeIn 0.3s" : "none",
              }}
            >
              {s.translating ? (
                <span style={{ color: color + "60", fontFamily: "monospace", letterSpacing: 2 }}>• • •</span>
              ) : (
                <p
                  style={{
                    fontFamily: isPersian ? "Tahoma, sans-serif" : "monospace",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: isLast ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
                    margin: 0,
                    wordBreak: "break-word",
                  }}
                >
                  {text}
                </p>
              )}
            </div>
          );
        })}

        {interim && (
          <div style={{ padding: "8px 10px", opacity: 0.7 }}>
            <p
              style={{
                fontFamily: isPersian ? "Tahoma, sans-serif" : "monospace",
                fontSize: 14,
                lineHeight: 1.6,
                color: color,
                margin: 0,
                fontStyle: "italic",
              }}
            >
              {interim}
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
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

  // Translate function
  const translate = useCallback(async (id, text) => {
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
        prev.map((s) => (s.id === id ? { ...s, translation: data.translation, translating: false } : s))
      );
    } catch (e) {
      setError("خطا در ترجمه");
      setSentences((prev) => prev.map((s) => (s.id === id ? { ...s, translating: false } : s)));
    }
  }, []);

  // Start recognition
  const start = useCallback(() => {
    if (!listeningRef.current) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }

    // Cleanup old
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {}
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = micLang === "fa" ? "fa-IR" : "en-US";

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
      // Ignore no-speech (silence is normal)
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed") {
        setError("اجازه دسترسی به میکروفون داده نشد");
        listeningRef.current = false;
        setIsListening(false);
        return;
      }
      console.error("Speech error:", e.error);
    };

    rec.onend = () => {
      // Auto-restart immediately if still listening
      if (listeningRef.current) {
        restartTimerRef.current = setTimeout(() => {
          if (listeningRef.current) start();
        }, 50);
      }
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error("Start failed:", err);
      setTimeout(() => start(), 100);
    }
  }, [micLang, translate]);

  // Toggle listening
  const toggle = useCallback(() => {
    if (listeningRef.current) {
      // Stop
      listeningRef.current = false;
      clearTimeout(restartTimerRef.current);
      try {
        recRef.current?.stop();
      } catch {}
      setIsListening(false);
      setInterim("");
    } else {
      // Start fresh
      setSentences([]);
      setDetectedLang(null);
      setError("");
      setInterim("");
      listeningRef.current = true;
      setIsListening(true);
      start();
    }
  }, [start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      listeningRef.current = false;
      clearTimeout(restartTimerRef.current);
      try {
        recRef.current?.stop();
      } catch {}
    };
  }, []);

  const isPersianInput = detectedLang === "fa" || (!detectedLang && micLang === "fa");

  return (
    <>
      <Head>
        <title>Voice Translator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <main
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: 12,
          gap: 12,
          background: "#07070f",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: "bold", color: "#fff", margin: 0, fontFamily: "sans-serif" }}>
              TRANSLATOR
            </h1>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0 0", fontFamily: "monospace" }}>
              FA ↔ EN
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 4,
              background: "rgba(255,255,255,0.05)",
              padding: 4,
              borderRadius: 8,
            }}
          >
            {["fa", "en"].map((l) => (
              <button
                key={l}
                onClick={() => !isListening && setMicLang(l)}
                disabled={isListening}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: micLang === l ? (l === "fa" ? "#f5a62340" : "#00d4ff30") : "transparent",
                  color: micLang === l ? (l === "fa" ? "#f5a623" : "#00d4ff") : "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  fontWeight: "bold",
                  cursor: isListening ? "not-allowed" : "pointer",
                  fontFamily: l === "fa" ? "Tahoma, sans-serif" : "monospace",
                }}
              >
                {l === "fa" ? "FA" : "EN"}
              </button>
            ))}
          </div>
        </header>

        {/* Panels - Horizontal layout (flex row) for both desktop and mobile */}
        <div style={{ flex: 1, display: "flex", gap: 8, minHeight: 0, flexDirection: "row" }}>
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            flexShrink: 0,
            paddingBottom: 8,
          }}
        >
          <button
            onClick={() => !isListening && setSentences([])}
            disabled={isListening}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              cursor: isListening ? "not-allowed" : "pointer",
              fontFamily: "monospace",
            }}
          >
            Clear
          </button>

          <MicButton isListening={isListening} onClick={toggle} disabled={!supported} />

          <div style={{ minWidth: 40, textAlign: "center" }}>
            {detectedLang && (
              <span
                style={{
                  fontSize: 10,
                  color: detectedLang === "fa" ? "#f5a623" : "#00d4ff",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                {detectedLang === "fa" ? "FA" : "EN"}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        {!supported && (
          <div style={{ textAlign: "center", color: "#ff6b6b", fontSize: 12, paddingBottom: 8 }}>
            مرورگر شما Speech Recognition را پشتیبانی نمی‌کند
          </div>
        )}
        {error && <div style={{ textAlign: "center", color: "#ff6b6b", fontSize: 12, paddingBottom: 8 }}>{error}</div>}
        {isListening && !error && (
          <div style={{ textAlign: "center", color: "#ff4081", fontSize: 11, paddingBottom: 8, fontFamily: "monospace" }}>
            ● LISTENING
          </div>
        )}
      </main>
    </>
  );
}
