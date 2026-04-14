import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ۱. اعتبارسنجی متد
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ۲. اعتبارسنجی ورودی
  const { text } = req.body ?? {};
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "متن خالی یا نامعتبر است." });
  }

  const trimmedText = text.trim();
  // جلوگیری از سوءاستفاده و هزینه‌های ناگهانی
  if (trimmedText.length > 3000) {
    return res.status(413).json({ error: "متن ورودی بیش از حد طولانی است." });
  }

  try {
    // ۳. درخواست بهینه‌شده به OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // جایگزین پایدار برای gpt-4.1-nano (سریع‌تر و ارزان‌تر)
      temperature: 0,       // خروجی قطعی و بدون تغییرات تصادفی برای ترجمه
      max_tokens: 1000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert translator between Persian (Farsi) and English.
1. Detect the input language.
2. If Persian → translate to English. If English → translate to Persian.
3. Return ONLY a valid JSON object with this exact structure:
{"detected": "fa|en", "translation": "translated text here"}
Do not include markdown, code blocks, or any extra text.`,
        },
        { role: "user", content: trimmedText },
      ],
    });

    // ۴. پاکسازی و پارس ایمن
    let raw = completion.choices[0]?.message?.content ?? "";
    raw = raw.replace(/```(?:json)?\s*|\s*```/g, "").trim();

    const parsed = JSON.parse(raw);

    // اعتبارسنجی ساختار پاسخ
    if (!["fa", "en"].includes(parsed.detected) || typeof parsed.translation !== "string") {
      throw new Error("ساختار پاسخ دریافتی نامعتبر است.");
    }

    return res.status(200).json({
      detected: parsed.detected,
      translation: parsed.translation,
    });

  } catch (error) {
    console.error("[Translate API Error]:", error);

    // مدیریت خطاهای رایج OpenAI
    if (error.status === 401) {
      return res.status(500).json({ error: "کلید API نامعتبر یا تنظیم نشده است." });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: "محدودیت تعداد درخواست. لطفاً کمی صبر کنید." });
    }
    if (error.message?.includes("JSON")) {
      return res.status(500).json({ error: "خطا در پردازش پاسخ هوش مصنوعی." });
    }

    return res.status(500).json({
      error: "خطا در انجام ترجمه.",
      detail: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
