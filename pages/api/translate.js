import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: "No text" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Translate text between Persian and English.
- If input is Persian → translate to English, respond: {"detected":"fa","translation":"..."}
- If input is English → translate to Persian, respond: {"detected":"en","translation":"..."}
Always respond with valid JSON only.`,
        },
        { role: "user", content: text.trim() },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json({ detected: parsed.detected, translation: parsed.translation });
  } catch (err) {
    console.error("Translation error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
