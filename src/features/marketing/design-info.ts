/**
 * Marketing facts about each website design that the manifests don't carry:
 * its name in Arabic, its mood and main colour (for the gallery filters), and
 * whether it is new. Shared by the homepage, the gallery and the header menu.
 */
export type Mood = "floral" | "classic" | "nights";
export type Tone = "blush" | "green" | "blue" | "ivory" | "dark";

export interface DesignInfo {
  ar: string;
  mood: Mood;
  tone: Tone;
  isNew?: boolean;
}

export const DESIGN_INFO: Record<string, DesignInfo> = {
  "swan-lake": { ar: "بحيرة البجع", mood: "floral", tone: "blue" },
  "villa-rosa": { ar: "فيلا روزا", mood: "floral", tone: "blush" },
  "swan-pond": { ar: "بحيرة البجع الصغيرة", mood: "floral", tone: "blue" },
  "something-blue": { ar: "لمسة زرقاء", mood: "floral", tone: "blue" },
  "pressed-garden": { ar: "حديقة الزهور المجففة", mood: "floral", tone: "ivory" },
  "wild-posy": { ar: "باقة برية", mood: "floral", tone: "ivory" },
  "ivory-veil": { ar: "الطرحة العاجية", mood: "classic", tone: "ivory", isNew: true },
  "blush-lace": { ar: "دانتيل وردي", mood: "floral", tone: "blush", isNew: true },
  "wisteria-lake": { ar: "بحيرة الوستارية", mood: "floral", tone: "blush", isNew: true },
  "gouna-lagoon": { ar: "بحيرة الجونة", mood: "nights", tone: "blue" },
  "gouna-sunset": { ar: "غروب الجونة", mood: "floral", tone: "blush", isNew: true },
  "ribbon-pearls": { ar: "شريطة ولؤلؤ", mood: "floral", tone: "blush" },
  "peony-blush": { ar: "زهور الفاوانيا", mood: "floral", tone: "blush" },
  "lemon-terrace": { ar: "شرفة الليمون", mood: "floral", tone: "blue" },
  "linen-meadow": { ar: "مرج الكتان", mood: "floral", tone: "ivory" },
  "henna-tent": { ar: "خيمة الحنة", mood: "nights", tone: "dark" },
  sketchbook: { ar: "كراسة الرسم", mood: "floral", tone: "green" },
  "opening-night": { ar: "ليلة الافتتاح", mood: "nights", tone: "dark" },
  "garden-gate": { ar: "بوابة الحديقة", mood: "floral", tone: "green" },
  "message-in-a-bottle": { ar: "رسالة في زجاجة", mood: "classic", tone: "blue" },
  "paper-fan": { ar: "المروحة الورقية", mood: "floral", tone: "blush" },
  "olive-courtyard": { ar: "فناء الزيتون", mood: "classic", tone: "green", isNew: true },
  "set-sail": { ar: "نُبحر معاً", mood: "classic", tone: "blue" },
  "cotton-press": { ar: "حبر وقطن", mood: "classic", tone: "ivory" },
  "rose-marble": { ar: "رخام وردي", mood: "classic", tone: "blush" },
  "burgundy-envelope": { ar: "الظرف العنابي", mood: "classic", tone: "dark" },
  "the-gate": { ar: "البوابة", mood: "nights", tone: "dark" },
  "moonlit-nile": { ar: "ليلة على النيل", mood: "nights", tone: "dark" },
};

export const MOODS: [Mood, string][] = [
  ["floral", "Floral & romantic"],
  ["classic", "Classic & foil"],
  ["nights", "Egyptian nights"],
];

export const TONES: [Tone, string, string][] = [
  ["blush", "Blush", "#e8b8b0"],
  ["green", "Green", "#7d8f6a"],
  ["blue", "Blue", "#7b9cc0"],
  ["ivory", "Ivory", "#efe6d4"],
  ["dark", "Dark", "#3a2a26"],
];

export const designInfo = (id: string): DesignInfo => DESIGN_INFO[id] ?? { ar: "", mood: "classic", tone: "ivory" };
