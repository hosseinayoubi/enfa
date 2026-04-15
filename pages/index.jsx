import React, { useState, useEffect, useRef, useCallback } from "react";

const RealTimeTranslator = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [lang, setLang] = useState("fa-IR");
  const [sentences, setSentences] = useState([]);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const scrollRef = useRef(null);
  const langRef = useRef(lang);

  // اسکرول خودکار به آخرین جمله
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sentences, interimText]);

  // تابع ارسال به API با مدیریت خطا
  const translateText = async (text, id) => {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          sourceLang: langRef.current.split('-')[0] 
        }),
      });
      
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      
      setSentences(prev => prev.map(s => 
        s.id === id ? { ...s, translation: data.translation, loading: false } : s
      ));
    } catch (err) {
      setSentences(prev => prev.map(s => 
        s.id === id ? { ...s, translation: "❌ خطا در ترجمه", loading: false } : s
      ));
    }
  };

  const processText = (text) => {
    const cleanText = text.trim();
    if (!cleanText || cleanText.length < 2) return;

    const id = Math.random().toString(36).substr(2, 9);
    setSentences(prev => [...prev, { id, text: cleanText, translation: "در حال ترجمه...", loading: true }]);
    translateText(cleanText, id);
  };

  const startSpeech = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("مرورگر شما از SpeechRecognition پشتیبانی نمی‌کند.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = langRef.current;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          processText(transcript);
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);

      // تایمر هوشمند سکوت: اگر ۵۰۰ میلی‌ثانیه حرف نزند، متن موقت را نهایی فرض کن
      clearTimeout(silenceTimerRef.current);
      if (interim.trim()) {
        silenceTimerRef.current = setTimeout(() => {
          processText(interim);
          setInterimText("");
        }, 500); 
      }
    };

    rec.onend = () => {
      if (isRecording) rec.start(); // راه اندازی مجدد برای پایداری
    };

    recognitionRef.current = rec;
    rec.start();
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setInterimText("");
    } else {
      setSentences([]);
      setIsRecording(true);
      setError(null);
      startSpeech();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 font-sans text-right" dir="rtl">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-gray-300'}`} />
          <h1 className="text-lg font-bold text-gray-700">مترجم زنده</h1>
        </div>
        
        <div className="flex gap-2">
          <select 
            onChange={(e) => { setLang(e.target.value); langRef.current = e.target.value; }}
            className="bg-gray-50 border-none text-sm p-2 rounded-lg outline-none"
          >
            <option value="fa-IR">فارسی ➔ English</option>
            <option value="en-US">English ➔ فارسی</option>
          </select>
          
          <button 
            onClick={toggleRecording}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              isRecording ? "bg-red-50 text-red-600 border border-red-200" : "bg-blue-600 text-white"
            }`}
          >
            {isRecording ? "توقف" : "شروع ضبط"}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 px-2 pb-20"
      >
        {sentences.map((s) => (
          <div key={s.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm inline-block max-w-[90%] min-w-[150px]">
              <p className="text-gray-500 text-xs mb-1">شما گفتید:</p>
              <p className="text-gray-800 mb-2">{s.text}</p>
              <div className="border-t pt-2 mt-2">
                <p className="text-gray-500 text-xs mb-1">ترجمه:</p>
                <p className={`text-blue-600 font-medium ${s.loading ? 'animate-pulse' : ''}`}>
                  {s.translation}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Interim Text (Live feedback) */}
        {interimText && (
          <div className="flex justify-start">
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl italic text-blue-400">
              {interimText}...
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-24 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-center shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};
export default RealTimeTranslator;
