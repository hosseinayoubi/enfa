import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text } = req.body ?? {};
  if (!text?.trim()) return res.status(400).json({ error: "empty text" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Translate between Persian and English. ' +
            'Persian→English: {"detected":"fa","translation":"..."} ' +
            'English→Persian: {"detected":"en","translation":"..."} ' +
            'Respond with JSON only, no extra text.',
        },
        { role: "user", content: text.trim() },
      ],
    });

    const raw = completion.choices[0].message.content ?? "";
    // strip markdown fences just in case
    const clean = raw.replace(/```json|```/g, "").trim();
    const { detected, translation } = JSON.parse(clean);

    if (!detected || !translation) throw new Error("bad response structure");
    return res.status(200).json({ detected, translation });

  } catch (err) {
    console.error("[translate]", err.message);
    return res.status(500).json({ error: err.message });
  }
}
