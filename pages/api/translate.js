import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",          // ✅ مدل مطمئن‌تر برای JSON
      max_tokens: 500,
      response_format: { type: "json_object" },   // ✅ مجبور می‌کنه همیشه JSON بده
      messages: [
        {
          role: "system",
          content: `You are a real-time translator between Persian (Farsi) and English.
Detect the language of the input text.
If it is Persian/Farsi → translate to English.
If it is English → translate to Persian/Farsi.
If it is mixed → translate the full text to whichever language is less dominant.

You MUST respond with a valid JSON object in this exact format:
{"detected": "fa", "translation": "your translation here"}
or
{"detected": "en", "translation": "your translation here"}`,
        },
        {
          role: "user",
          content: text.trim(),
        },
      ],
    });

    const raw = response.choices[0].message.content.trim();

    // ✅ اگه مدل code fence گذاشت، پاکش کن
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.detected || !parsed.translation) {
      throw new Error("Invalid response structure");
    }

    return res.status(200).json({
      detected: parsed.detected,
      translation: parsed.translation,
    });
  } catch (err) {
    console.error("Translation error:", err.message);
    return res.status(500).json({ error: "Translation failed", detail: err.message });
  }
}
