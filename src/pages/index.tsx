import { useState, useEffect } from "react";
import { GolfNarrationForm } from "../components/GolfNarration";

type NarrationResult = {
  teeBox: string;
  preShot: string;
  postSwing: string;
  audio?: {
    teeBox: string;
    preShot: string;
    postSwing: string;
  };
};

export default function HomePage() {
  const [result, setResult] = useState<NarrationResult | null>(null);

  useEffect(() => {
    if (!result || result.audio) return;

    const synthesizeAudio = async () => {
      const synthesize = async (
        text: string,
        label: string
      ): Promise<string> => {
        try {
          const res = await fetch("/api/synthesize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });

          if (!res.ok) {
            throw new Error(`Failed ${label}: ${res.status}`);
          }

          const data = await res.json();
          if (!data.audio) {
            throw new Error(`No audio returned for ${label}`);
          }

          return `data:audio/mpeg;base64,${data.audio}`;
        } catch (err) {
          console.warn(`🛑 Audio generation failed for ${label}`, err);
          return ""; // fallback to empty audio string
        }
      };

      try {
        const teeBox = await synthesize(result.teeBox, "Tee Box");
        const preShot = await synthesize(result.preShot, "Pre-Shot");
        const postSwing = await synthesize(result.postSwing, "Post-Swing");

        setResult(
          (prev) =>
            prev && {
              ...prev,
              audio: {
                teeBox,
                preShot,
                postSwing,
              },
            }
        );
      } catch (error) {
        console.error("Audio generation failed:", error);
      }
    };

    synthesizeAudio();
  }, [result]);

  return (
    <div className="min-h-screen bg-green-100 p-6">
      <h1 className="text-3xl font-bold text-center text-green-900 mb-6">
        Golf Narrator 🎙️
      </h1>
      <div className="max-w-xl mx-auto bg-white shadow-lg p-6 rounded-lg">
        <GolfNarrationForm onResult={setResult} />

        {result && (
          <div className="mt-8 space-y-4">
            <NarrationBox
              title="Walking to the Tee Box"
              text={result.teeBox}
              color="green"
              audioSrc={result.audio?.teeBox}
            />
            <NarrationBox
              title="Pre-Shot Routine"
              text={result.preShot}
              color="yellow"
              audioSrc={result.audio?.preShot}
            />
            <NarrationBox
              title="After the Swing"
              text={result.postSwing}
              color="red"
              audioSrc={result.audio?.postSwing}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const NarrationBox = ({
  title,
  text,
  color,
  audioSrc,
}: {
  title: string;
  text: string;
  color: "green" | "yellow" | "red";
  audioSrc?: string;
}) => {
  const borderColor = {
    green: "border-green-500",
    yellow: "border-yellow-500",
    red: "border-red-500",
  }[color];

  const textColor = {
    green: "text-green-700",
    yellow: "text-yellow-700",
    red: "text-red-700",
  }[color];

  const bgColor = {
    green: "bg-green-50",
    yellow: "bg-yellow-50",
    red: "bg-red-50",
  }[color];

  return (
    <div
      className={`border-l-4 pl-4 ${borderColor} ${bgColor} p-4 rounded shadow-sm`}
    >
      <h2 className={`text-lg font-semibold mb-1 ${textColor}`}>{title}</h2>
      <p className="text-gray-900 mb-2">{text}</p>
      {audioSrc ? (
        <audio controls src={audioSrc} className="w-full" />
      ) : (
        <p className="text-sm italic text-gray-500">🎙️ Generating audio...</p>
      )}
    </div>
  );
};
