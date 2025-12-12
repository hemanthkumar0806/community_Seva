// utils/aiExtractor.ts

import { ExtractedMedicine } from "@/store/medicineStore";

/* -------------------------------------------------------------------------- */
/*                               CONFIGURATION                                */
/* -------------------------------------------------------------------------- */

// LOAD KEY FROM ENV (RECOMMENDED)
const GEMINI_KEY = "AIzaSyB9ow_xqIZq4KuJcFdUli8E5niJEQ9KL7c";

// MODEL
const GEMINI_MODEL = "gemini-2.5-flash";

// API URL
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

/* -------------------------------------------------------------------------- */
/*                        MOCK FALLBACK (ALWAYS WORKS)                        */
/* -------------------------------------------------------------------------- */
export const mockExtractPrescription = async (): Promise<{ medicines: ExtractedMedicine[] }> => {
  await new Promise((res) => setTimeout(res, 800));

  return {
    medicines: [
      {
        id: "mock1",
        medicineName: "Betaloc",
        genericName: "Metoprolol",
        dosage: "100mg",
        medicineType: "Tablet",
        frequency: "Twice a day",
        timeslots: ["9:00 AM", "7:00 PM"],
        startDate: "08/12/2025",
        endDate: "",
        whenToTake: "After Food",
        specialInstructions: "1 tab",
        possibleSideEffects: "Dizziness",
        currentStock: "30",
        lowStockAlert: "7",
        refillReminder: true,
        automaticRefill: false,
      },
      {
        id: "mock2",
        medicineName: "Dorzolamidum",
        genericName: "Dorzolamide",
        dosage: "10mg",
        medicineType: "Drops",
        frequency: "Twice a day",
        timeslots: ["8:00 AM", "8:00 PM"],
        startDate: "08/12/2025",
        endDate: "",
        whenToTake: "Anytime",
        specialInstructions: "1 drop",
        possibleSideEffects: "",
        currentStock: "1",
        lowStockAlert: "0",
        refillReminder: true,
        automaticRefill: false,
      },
    ],
  };
};

/* -------------------------------------------------------------------------- */
/*                        GEMINI AI MEDICINE EXTRACTOR                        */
/* -------------------------------------------------------------------------- */

const extractWithGemini = async (
  base64: string
): Promise<{ medicines: ExtractedMedicine[] }> => {
  // Missing or invalid key? → fallback safely
  if (!GEMINI_KEY || GEMINI_KEY.length < 10) {
    console.log("⚠ Gemini key missing → using mock extraction");
    return mockExtractPrescription();
  }

  const prompt = `
Extract all medicines from this prescription.
Return ONLY valid JSON:

{
 "medicines": [
   {
     "medicineName": "",
     "genericName": "",
     "dosage": "",
     "medicineType": "",
     "frequency": "",
     "timeslots": [],
     "startDate": "",
     "endDate": "",
     "whenToTake": "",
     "specialInstructions": "",
     "possibleSideEffects": "",
     "currentStock": "",
     "lowStockAlert": "",
     "refillReminder": true,
     "automaticRefill": false
   }
 ]
}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: base64 } },
        ],
      },
    ],
    generationConfig: { temperature: 0.1 },
  };

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON format");

    const clean = match[0].replace(/,(\s*[}\]])/g, "$1");

    const parsed = JSON.parse(clean);

    return {
      medicines: parsed.medicines.map((m: any, index: number) => ({
        ...m,
        id: `med_${index}_${Date.now()}`,
        timeslots: m.timeslots || [],
      })),
    };
  } catch (error) {
    console.log("❌ Gemini Error → Using mock", error);
    return mockExtractPrescription();
  }
};

/* -------------------------------------------------------------------------- */
/*                   UNIVERSAL EXTRACTOR — SINGLE ENTRY POINT                 */
/* -------------------------------------------------------------------------- */

export const extractPrescription = async (base64: string) => {
  try {
    return await extractWithGemini(base64);
  } catch {
    return await mockExtractPrescription();
  }
};
