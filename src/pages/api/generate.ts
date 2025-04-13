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
}

interface ResponseData {
  teeBox: string;
  preShot: string;
  postSwing: string;
}

const buildPrompt = (form: RequestBody, scenario: string): string => {
  const { playerName, courseName, holeNumber, par, tone } = form;

  const location = courseName || "a classic American golf course";
  const hole = holeNumber || "?";
  const parValue = par || "?";

  const toneInstruction = {
    Roast:
      "Make it light-hearted and playfully roast the player. Do not mention specific prior events like previous shots.",
    "Fire Up":
      "Make it sound like an epic motivational speech, full of hype. Do not mention past results or scores.",
    "Surprise Me":
      "Be wildly creative or humorous, but avoid specifics about what happened earlier in the round.",
  }[tone];

  return `
  You are legendary golf commentator Jim Nantz.
  Narrate ${playerName} ${scenario} on hole ${hole} (Par ${parValue}) at ${location}.
  Stay vivid, clever, and in character. 
  ${toneInstruction}
  Do not fabricate factual events or statistics—keep the description entertaining but vague when necessary.
  Keep it under 40 seconds of narration.
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
          model: "gpt-3.5-turbo",
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

    const [teeBox, preShot, postSwing] = results.map(
      (r) => r.choices[0].message.content || ""
    );

    return res.status(200).json({ teeBox, preShot, postSwing });
  } catch (err: unknown) {
    console.error("GPT error:", err);
    return res.status(500).json({ error: "Failed to generate narration" });
  }
}
