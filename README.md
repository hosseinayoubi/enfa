# 🎙️ Voice Translator — FA ↔ EN

Real-time voice translator between Persian (Farsi) and English using the Web Speech API and OpenAI `gpt-4.1-nano`.

## Features
- 🎤 Real-time microphone input via Web Speech API
- 🌐 Auto language detection (FA/EN) via GPT
- ⚡ Low-latency translation with debouncing
- 🎨 Beautiful dark UI with animated wave bars
- 📱 Works on desktop (Chrome/Edge recommended)

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/your-username/voice-translator
cd voice-translator
npm install
```

### 2. Add API Key
```bash
cp .env.local.example .env.local
# Edit .env.local and add your OpenAI API key
```

### 3. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variable in Vercel dashboard:
   - `OPENAI_API_KEY` → your OpenAI key
4. Deploy! ✅

## ⚠️ Browser Note
Web Speech API requires **Chrome** or **Edge**. Firefox is not supported.
HTTPS is required (Vercel provides this automatically).

## Tech Stack
- Next.js 14 (Pages Router)
- Web Speech API (browser built-in)
- OpenAI API — `gpt-4o-mini`
- Deployed on Vercel
