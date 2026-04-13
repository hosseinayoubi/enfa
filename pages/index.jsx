import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";

// ── Wave bars animation component ──────────────────────────────────────────
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
      <style>{`
        @keyframes wave {
          from { height: 6px; }
          to   { height: 32px; }
        }
      `}</style>
    </div>
  );
}

// ── Language Badge ──────────────────────────────────────────────────────────
function LangBadge({ lang }) {
  const map = {
    fa: { label: "فارسی", color: "#f5a623" },
    en: { label: "English", color: "#00d4ff" },
  };
  if (!lang) return null;
  const { label, color } = map[lang] || {};
  return (
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
  );
}

// ── Mic Button ──────────────────────────────────────────────────────────────
function MicButton({ isListening, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        position: "relative",
        width: 80,
        height: 80,
        borderRadius: "50%",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: isListening
          ? "radial-gradient(circle, #ff4081, #c2185b)"
          : "radial-gradient(circle, #1e1e35, #141428)",
        boxShadow: isListening
          ? "0 0 0 0 rgba(255,64,129,0.5), 0 0 30px rgba(255,64,129,0.4)"
          : "0 0 0 0 transparent, 0 4px 20px rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform: isListening ? "scale(1.1)" : "scale(1)",
        animation: isListening ? "pulse-ring 1.4s ease-out infinite" : "none",
        outline: "none",
        flexShrink: 0,
      }}
      aria-label={isListening ? "Stop" : "Start listening"}
    >
      {isListening ? (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
          <path
            d="M19 11a7 7 0 0 1-14 0"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
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

// ── Original Speech Panel ───────────────────────────────────────────────────
function TextPanel({ title, sentences, interimText, isActive, side }) {
  const isPersian = side === "right";
  const borderColor = side === "right" ? "#f5a623" : "#00d4ff";
  const glowColor = side === "right" ? "rgba(245,166,35,0.12)" : "rgba(0,212,255,0.1)";
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sentences, interimText]);

  const hasContent = sentences.length > 0 || interimText;

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
          justifyContent: hasContent ? "flex-start" : "center",
          alignItems: hasContent ? "stretch" : "center",
        }}
      >
        {!hasContent ? (
          <p
            style={{
              color: "rgba(255,255,255,0.12)",
              fontSize: 13,
              fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
              letterSpacing: isPersian ? 0 : 1,
              textAlign: "center",
            }}
          >
            {isPersian ? "اینجا نشون داده میشه..." : "will appear here..."}
          </p>
        ) : (
          <>
            {sentences.map((s, idx) => {
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
                  <p
                    style={{
                      fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
                      fontSize: isPersian ? 17 : 15,
                      lineHeight: 1.8,
                      color: isLast ? "rgba(240,240,245,0.95)" : "rgba(240,240,245,0.5)",
                      letterSpacing: isPersian ? 0 : 0.3,
                      wordSpacing: isPersian ? 4 : 0,
                      margin: 0,
                      transition: "color 0.4s",
                    }}
                  >
                    {s.original}
                  </p>
                </div>
              );
            })}

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
                    color: `${borderColor}66`,
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  {interimText}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Translation Panel ───────────────────────────────────────────────────────
function TranslationPanel({ title, sentences, isActive, side }) {
  const isPersian = side === "right";
  const borderColor = side === "right" ? "#f5a623" : "#00d4ff";
  const glowColor = side === "right" ? "rgba(245,166,35,0.12)" : "rgba(0,212,255,0.1)";
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sentences]);

  const hasContent = sentences.some((s) => s.translation || s.translating);

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
          justifyContent: hasContent ? "flex-start" : "center",
          alignItems: hasContent ? "stretch" : "center",
        }}
      >
        {!hasContent ? (
          <p
            style={{
              color: "rgba(255,255,255,0.12)",
              fontSize: 13,
              fontFamily: isPersian ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
              letterSpacing: isPersian ? 0 : 1,
              textAlign: "center",
            }}
          >
            {isPersian ? "ترجمه اینجا میاد..." : "translation appears here..."}
          </p>
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
                      color: `${borderColor}44`,
                      fontFamily: "'Courier Prime', monospace",
                      animation: "blink 0.9s ease-in-out infinite",
                      margin: 0,
                      letterSpacing: 4,
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
                      color: isLast ? "rgba(240,240,245,0.95)" : "rgba(240,240,245,0.5)",
                      letterSpacing: isPersian ? 0 : 0.3,
                      wordSpacing: isPersian ? 4 : 0,
                      margin: 0,
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
      </div>
    </div>
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

  // Each item: { id, original, translation, translating }
  const [sentences, setSentences] = useState([]);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const idCounterRef = useRef(0);
  const restartRef = useRef(null); // always points to latest createAndStart fn

  // ── Translate a single sentence immediately ─────────────────────────────
  const translateSentence = useCallback(async (id, text) => {
    setSentences((prev) =>
      prev.map((s) => (s.id === id ? { ...s, translating: true } : s))
    );
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
        prev.map((s) =>
          s.id === id ? { ...s, translation: data.translation, translating: false } : s
        )
      );
    } catch {
      setError("ترجمه ناموفق بود. API key رو چک کن.");
      setSentences((prev) =>
        prev.map((s) => (s.id === id ? { ...s, translating: false } : s))
      );
    }
  }, []);

  // ── Create a fresh recognition instance and start it ───────────────────
  // Called both on first start AND on every auto-restart after onend.
  // Creating a NEW instance each time avoids Chrome's InvalidStateError
  // when trying to re-start a recognition that already stopped.
  const createAndStart = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    if (!isListeningRef.current) return; // user already stopped

    // Stop & discard old instance cleanly
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
          const finalText = result[0].transcript.trim();
          if (!finalText) continue;
          const newId = ++idCounterRef.current;
          setSentences((prev) => [
            ...prev,
            { id: newId, original: finalText, translation: null, translating: false },
          ]);
          translateSentence(newId, finalText);
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
    };

    rec.onerror = (e) => {
      // no-speech is normal Chrome behaviour during silence — ignore it
      if (e.error === "no-speech" || e.error === "aborted") return;
      setError(`خطا: ${e.error}`);
      isListeningRef.current = false;
      setIsListening(false);
    };

    rec.onend = () => {
      // Chrome can end the session for many reasons even with continuous=true.
      // Wait 200 ms then call restartRef (always the latest createAndStart),
      // which creates a BRAND NEW instance — avoids InvalidStateError.
      if (isListeningRef.current) {
        setTimeout(() => restartRef.current?.(), 200);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error("Recognition start failed:", err);
      // retry once after a short delay
      setTimeout(() => restartRef.current?.(), 500);
    }
  }, [micLang, translateSentence]);

  // Keep restartRef always pointing to the latest createAndStart
  useEffect(() => {
    restartRef.current = createAndStart;
  }, [createAndStart]);

  // ── Toggle Listening ────────────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      // Stop
      isListeningRef.current = false;
      try { recognitionRef.current?.stop(); } catch {}
      recognitionRef.current = null;
      setIsListening(false);
      setInterimTranscript("");
    } else {
      // Start fresh
      setSentences([]);
      setDetectedLang(null);
      setError("");
      setInterimTranscript("");
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
      recognitionRef.current?.stop();
    };
  }, []);

  const originalLang = detectedLang || micLang;

  return (
    <>
      <Head>
        <title>صدا ترجمه | Voice Translator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Real-time Persian ↔ English voice translator" />
      </Head>

      <main
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "24px 28px",
          gap: 20,
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(0,212,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(245,166,35,0.05) 0%, transparent 50%), #07070f",
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
                marginTop: 3,
              }}
            >
              FA ↔ EN · REAL-TIME
            </p>
          </div>

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
              MIC:
            </span>
            {["fa", "en"].map((l) => (
              <button
                key={l}
                onClick={() => { if (!isListeningRef.current) setMicLang(l); }}
                disabled={isListeningRef.current}
                style={{
                  padding: "4px 12px",
                  borderRadius: 7,
                  border: "none",
                  cursor: isListeningRef.current ? "not-allowed" : "pointer",
                  fontFamily: l === "fa" ? "'Vazirmatn', sans-serif" : "'Courier Prime', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: l === "en" ? 1 : 0,
                  background: micLang === l ? (l === "fa" ? "#f5a62330" : "#00d4ff25") : "transparent",
                  color: micLang === l ? (l === "fa" ? "#f5a623" : "#00d4ff") : "rgba(255,255,255,0.3)",
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
          {/* LEFT = English */}
          {originalLang === "en" ? (
            <TextPanel
              title="ENGLISH"
              side="left"
              sentences={sentences}
              interimText={interimTranscript}
              isActive={isListening}
            />
          ) : (
            <TranslationPanel
              title="ENGLISH"
              side="left"
              sentences={sentences}
              isActive={sentences.some((s) => s.translating)}
            />
          )}

          {/* RIGHT = Persian */}
          {originalLang === "fa" ? (
            <TextPanel
              title="فارسی"
              side="right"
              sentences={sentences}
              interimText={interimTranscript}
              isActive={isListening}
            />
          ) : (
            <TranslationPanel
              title="فارسی"
              side="right"
              sentences={sentences}
              isActive={sentences.some((s) => s.translating)}
            />
          )}
        </div>

        {/* ── Control Bar ── */}
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
              transition: "all 0.2s",
              outline: "none",
            }}
          >
            CLEAR
          </button>

          <MicButton isListening={isListening} onClick={toggleListening} disabled={!supported} />

          <div style={{ minWidth: 80, display: "flex", justifyContent: "flex-start" }}>
            {detectedLang && <LangBadge lang={detectedLang} />}
          </div>
        </div>

        {/* ── Status / Errors ── */}
        {!supported && (
          <div style={{ textAlign: "center", color: "#ff6b6b", fontSize: 13, fontFamily: "'Vazirmatn', sans-serif" }}>
            مرورگرت Speech Recognition رو ساپورت نمیکنه. از Chrome استفاده کن.
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", color: "#ff6b6b", fontSize: 12, fontFamily: "'Courier Prime', monospace", letterSpacing: 0.5 }}>
            {error}
          </div>
        )}
        {isListening && !error && (
          <div
            style={{
              textAlign: "center",
              fontSize: 11,
              fontFamily: "'Courier Prime', monospace",
              color: "rgba(255,64,129,0.7)",
              letterSpacing: 2,
              animation: "blink 1.5s ease-in-out infinite",
            }}
          >
            ● LISTENING
          </div>
        )}

        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.3; }
          }
        `}</style>
      </main>
    </>
  );
}
