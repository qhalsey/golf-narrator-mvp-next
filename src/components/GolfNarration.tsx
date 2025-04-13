import React, { useState } from "react";
import { GolfNarrationFormData } from "@/types/GolfNarration";

export interface NarrationResult {
  teeBox: string;
  preShot: string;
  postSwing: string;
}

interface Props {
  onResult: (result: NarrationResult) => void;
}

const toneOptions: GolfNarrationFormData["tone"][] = [
  "Roast",
  "Fire Up",
  "Surprise Me",
];

export const GolfNarrationForm: React.FC<Props> = ({ onResult }) => {
  const [form, setForm] = useState<GolfNarrationFormData>({
    playerName: "",
    courseName: "",
    holeNumber: "",
    par: "",
    tone: "Roast",
    context: "", // 👈
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev: GolfNarrationFormData) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.playerName.trim()) {
      alert("Player Name is required!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        onResult(data);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Request failed", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Player Name *
        </label>
        <input
          name="playerName"
          value={form.playerName}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Golf Course
        </label>
        <input
          name="courseName"
          value={form.courseName}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            Hole #
          </label>
          <input
            name="holeNumber"
            value={form.holeNumber}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Par</label>
          <input
            name="par"
            value={form.par}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tone *
        </label>
        <select
          name="tone"
          value={form.tone}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          {toneOptions.map((tone) => (
            <option key={tone} value={tone}>
              {tone}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Additional Context (optional)
        </label>
        <textarea
          name="context"
          value={form.context}
          onChange={handleChange}
          placeholder="Mention anything specific you'd like in the narration..."
          className="mt-1 block w-full border border-gray-400 rounded-md shadow-sm p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 text-white font-semibold py-2 px-4 rounded hover:bg-green-800 transition disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Narration"}
      </button>
    </form>
  );
};
