export type ToneOption = "Roast" | "Fire Up" | "Surprise Me";

export interface GolfNarrationFormData {
  playerName: string;
  courseName: string;
  holeNumber: string;
  par: string;
  tone: ToneOption;
  context: string; // 👈 new field
}
