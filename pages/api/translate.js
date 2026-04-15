import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // دریافت متن و زبان مبدا از فرانت‌اند
  const { text, sourceLang } = req.body ?? {};
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "متن خالی یا نامعتبر است." });
  }

  const trimmedText = text.trim();
  if (trimmedText.length > 3000) {
    return res.status(413).json({ error: "متن ورودی بیش از حد طولانی است." });
  }

  // تعیین زبان مقصد بر اساس زبان مبدا
  const targetLang = sourceLang === "fa" ? "English" : "Persian (Farsi)";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 300, // کاهش توکن برای سرعت بیشتر
      messages: [
        {
          role: "system",
          content: `You are an expert translator. Translate the user's text to ${targetLang}. Return ONLY the translated text. No markdown, no quotes, no extra words.`,
        },
        { role: "user", content: trimmedText },
      ],
    });

    const translatedText = completion.choices[0]?.message?.content?.trim() ?? "";

    return res.status(200).json({
      translation: translatedText,
    });

  } catch (error) {
    console.error("[Translate API Error]:", error);
    return res.status(500).json({ error: "خطا در پردازش هوش مصنوعی." });
  }
}
