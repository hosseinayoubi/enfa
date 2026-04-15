import { useState, useRef, useCallback } from "react";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [sentences, setSentences] = useState([]);
  const [liveTranslation, setLiveTranslation] = useState("");

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); // ✅ FIX: جلوی قطع شدن رو می‌گیره
  const liveTimerRef = useRef(null);
  const idCounterRef = useRef(0);

  // ترجمه نهایی جمله کامل
  const translateSentence = async (id, text) => {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setSentences((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, translation: data.translation } : s
        )
      );
    } catch (e) {
      console.error("translateSentence error:", e);
    }
  };

  // ترجمه زنده روی interim
  const liveTranslate = useCallback(async (text) => {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLiveTranslation(data.translation);
    } catch (e) {
      console.error("liveTranslate error:", e);
    }
  }, []);

  // debounce 300ms روی interim
  const handleInterim = useCallback(
    (text) => {
      clearTimeout(liveTimerRef.current);
      liveTimerRef.current = setTimeout(() => {
        if (text.trim().length > 4) liveTranslate(text);
      }, 300);
    },
    [liveTranslate]
  );

  // ثبت جمله نهایی
  const commitSentence = useCallback((text) => {
    const clean = text.trim();
    if (!clean) return;

    clearTimeout(liveTimerRef.current);
    setLiveTranslation("");
    setInterimTranscript("");

    const newId = ++idCounterRef.current;
    setSentences((prev) => [
      ...prev,
      { id: newId, original: clean, translation: "..." },
    ]);
    translateSentence(newId, clean);
  }, []);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Chrome لازمه (SpeechRecognition)");
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "fa-IR";

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          const finalText = result[0].transcript.trim();
          if (finalText) commitSentence(finalText);
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) {
        setInterimTranscript(interim);
        handleInterim(interim); // real-time translation
      }
    };

    rec.onerror = (e) => {
      if (e.error === "aborted") return;
      console.error("SpeechRecognition error:", e.error);
    };

    // ✅ FIX: از ref استفاده می‌کنه نه state
    // چون state داخل closure کهنه‌ست، ref همیشه لحظه‌ایه
    rec.onend = () => {
      if (isListeningRef.current) rec.start();
    };

    rec.start();
    recognitionRef.current = rec;
    isListeningRef.current = true; // ✅ اول ref
    setIsListening(true);
  };

  const stopListening = () => {
    isListeningRef.current = false; // ✅ اول ref — قبل از stop
    setIsListening(false);
    recognitionRef.current?.stop();
    clearTimeout(liveTimerRef.current);
    setInterimTranscript("");
    setLiveTranslation("");
  };

  const clearAll = () => {
    setSentences([]);
    setInterimTranscript("");
    setLiveTranslation("");
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>🎙️ Real-Time Translator</h2>

      <div style={styles.controls}>
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            ...styles.btn,
            background: isListening ? "#dc2626" : "#16a34a",
          }}
        >
          {isListening ? "⏹ Stop" : "▶ Start"}
        </button>
        <button onClick={clearAll} style={styles.btnSecondary}>
          🗑 Clear
        </button>
      </div>

      {/* نمایش زنده */}
      {(interimTranscript || liveTranslation) && (
        <div style={styles.liveBox}>
          {interimTranscript && (
            <p style={styles.interim}>🎤 {interimTranscript}</p>
          )}
          {liveTranslation && (
            <p style={styles.live}>🌐 {liveTranslation}</p>
          )}
        </div>
      )}

      {/* تاریخچه */}
      <div style={styles.list}>
        {sentences.length === 0 && (
          <p style={styles.empty}>Start رو بزن و حرف بزن...</p>
        )}
        {[...sentences].reverse().map((s) => (
          <div key={s.id} style={styles.item}>
            <p style={styles.original}>🗣 {s.original}</p>
            <p style={styles.translated}>
              {s.translation === "..." ? "⏳ ترجمه..." : `🌍 ${s.translation}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "32px 20px",
    fontFamily: "system-ui, sans-serif",
    background: "#f9fafb",
    minHeight: "100vh",
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#111" },
  controls: { display: "flex", gap: 10, marginBottom: 20 },
  btn: {
    padding: "10px 22px",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "10px 18px",
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fff",
    fontSize: 14,
    cursor: "pointer",
    color: "#666",
  },
  liveBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "14px 18px",
    marginBottom: 16,
  },
  interim: { margin: 0, color: "#1d4ed8", fontSize: 14, marginBottom: 6 },
  live: { margin: 0, color: "#b45309", fontSize: 15, fontWeight: 500 },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  item: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "14px 18px",
  },
  original: { margin: 0, color: "#374151", fontSize: 14, marginBottom: 6 },
  translated: { margin: 0, color: "#065f46", fontSize: 15, fontWeight: 500 },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 40, fontSize: 14 },
};
