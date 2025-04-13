import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mockResponse = {
  teeBox:
    "Quentin walks confidently to the tee box. The sun glints off the clubface as he lines up his shot. Somewhere between calm and chaos lies his swing.",
  preShot:
    "He settles in. One waggle. Two. There's an energy in the air—you can feel it. Whether this shot is greatness or disaster, it's about to be something.",
  postSwing:
    "The ball takes flight! A majestic arc cutting through the Georgia sky. It’s... going somewhere. That's for sure.",
};

type Tone = "Roast" | "Fire Up" | "Surprise Me";

interface RequestBody {
  playerName: string;
  courseName?: string;
  holeNumber?: string;
  par?: string;
  tone: Tone;
  context?: string; // Optional additional context
}

interface ResponseData {
  teeBox: string;
  preShot: string;
  postSwing: string;
}

const buildPrompt = (form: RequestBody, scenario: string): string => {
  const { playerName, courseName, holeNumber, par, tone, context } = form;

  const location = courseName || "a prestigious golf course";
  const hole = holeNumber || "?";
  const parValue = par || "?";

  const toneInstruction = {
    Roast:
      "Use clever, dry wit. Avoid anything crude or direct. Think gentle teasing that still sounds classy.",
    "Fire Up":
      "Use poetic, inspirational language like you're narrating the final hole of a major tournament.",
    "Surprise Me":
      "Be creative, but never break the voice of a serious broadcaster. Jim Nantz doesn't shout or meme.",
  }[tone];

  const optionalContext = context
    ? `Also incorporate this detail if appropriate: "${context}".`
    : "";

  return `
  You are Jim Nantz, the legendary golf broadcaster.
  Narrate the scene of ${playerName} ${scenario} on hole ${hole} (Par ${parValue}) at ${location}.
  
  Speak with the tone and vocabulary of a calm, articulate, deeply experienced broadcaster. Everything should feel important, intentional, and thoughtful — as if millions are watching this moment unfold live on TV.
  
  Avoid all non-verbal cues like "*chuckles*", "(laughs)", or anything that would not be spoken aloud.
  
  Your language should be smooth and ready for direct speech-to-voice conversion. No stage directions or actions. Just beautifully crafted commentary.
  
  ${toneInstruction}
  ${optionalContext}
  
  Limit your response to 2–3 sentences and no more than 70 words total.
  `;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (process.env.MOCK_GPT === "true") {
    return res.status(200).json(mockResponse);
  }

  const body: RequestBody = req.body;

  if (!body.playerName || !body.tone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const scenarios = [
      "walking to the tee box",
      "pre-shot routine",
      "after the ball is hit",
    ];
    const results = await Promise.all(
      scenarios.map((scenario) =>
        openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are Jim Nantz, legendary golf commentator.",
            },
            { role: "user", content: buildPrompt(body, scenario) },
          ],
          temperature: 0.8,
          max_tokens: 300,
        })
      )
    );

    const clean = (text: string) =>
      (text || "")
        .replace(/\*.*?\*|\(.*?\)|\[.*?\]/g, "") // remove *actions*, (stage directions)
        .split(" ")
        .slice(0, 70) // max ~25s of speaking
        .join(" ");

    const [teeBox, preShot, postSwing] = results.map((r) =>
      clean(r.choices[0].message.content || "")
    );

    return res.status(200).json({ teeBox, preShot, postSwing });
  } catch (err: unknown) {
    console.error("GPT error:", err);
    return res.status(500).json({ error: "Failed to generate narration" });
  }
}
