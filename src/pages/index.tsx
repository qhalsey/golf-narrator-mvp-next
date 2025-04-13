import { useState } from "react";
import { GolfNarrationForm } from "../components/GolfNarration";

type NarrationResult = {
  teeBox: string;
  preShot: string;
  postSwing: string;
};

export default function HomePage() {
  const [result, setResult] = useState<NarrationResult | null>(null);

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
            />
            <NarrationBox
              title="Pre-Shot Routine"
              text={result.preShot}
              color="yellow"
            />
            <NarrationBox
              title="After the Swing"
              text={result.postSwing}
              color="red"
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
}: {
  title: string;
  text: string;
  color: "green" | "yellow" | "red";
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
      <p className="text-gray-900">{text}</p>
    </div>
  );
};
