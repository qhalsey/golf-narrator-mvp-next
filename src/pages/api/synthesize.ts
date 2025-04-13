import type { NextApiRequest, NextApiResponse } from "next";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVEN_LABS_VOICE; // Default (Rachel) – can be swapped later

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid text" });
  }

  try {
    const cleanText = text.slice(0, 450); // ~20–25 sec narration

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_monolingual_v1", // or your preferred one
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("❌ ElevenLabs API returned error:", await response.text());
      return res.status(500).json({ error: "Failed to synthesize speech" });
    }

    const audioBuffer = await response.arrayBuffer();

    // Quick sanity check
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.error("⚠️ Received empty audio buffer from ElevenLabs.");
      return res
        .status(500)
        .json({ error: "Empty audio response from ElevenLabs" });
    }

    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    res.status(200).json({ audio: base64Audio });
  } catch (err) {
    console.error("ElevenLabs error", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
