import { create } from "zustand";

export type ExtractedMedicine = {
  id?: string;

  medicineName: string;
  genericName: string;
  dosage: string;
  medicineType: string;

  frequency: string;

  // backend field name (IMPORTANT)
  timeslots: string[];

  startDate: string;
  endDate: string;

  whenToTake: string;

  specialInstructions: string;
  possibleSideEffects: string;

  currentStock: string;
  lowStockAlert: string;

  refillReminder?: boolean;
  automaticRefill?: boolean;
};


type MedicineState = {
  extractedMedicines: ExtractedMedicine[];
  uploadedImage: string | null;
  prescriptionUploaded: boolean;
  currentMedicine: ExtractedMedicine | null;
  setExtractedMedicines: (m: ExtractedMedicine[]) => void;
  addExtractedMedicine: (m: ExtractedMedicine) => void;
  removeExtractedMedicineById: (id: string) => void;
  setUploadedImage: (uri: string | null) => void;
  setPrescriptionUploaded: (v: boolean) => void;
  setCurrentMedicine: (m: ExtractedMedicine | null) => void;
  clearAll: () => void;
};

export const useMedicineStore = create<MedicineState>((set : any) => ({
  extractedMedicines: [],
  uploadedImage: null,
  prescriptionUploaded: false,
  currentMedicine: null,

  setExtractedMedicines: (m: any) => set({ extractedMedicines: m }),
  addExtractedMedicine: (m: any) =>
    set((s: any) => ({ extractedMedicines: [...s.extractedMedicines, m] })),
  removeExtractedMedicineById: (id: any) =>
    set((s: any) => ({ extractedMedicines: s.extractedMedicines.filter((x: any) => x.id !== id) })),
  setUploadedImage: (uri: any) => set({ uploadedImage: uri }),
  setPrescriptionUploaded: (v: any) => set({ prescriptionUploaded: v }),
  setCurrentMedicine: (m: any) => set({ currentMedicine: m }),
  clearAll: () =>
    set({ extractedMedicines: [], uploadedImage: null, prescriptionUploaded: false, currentMedicine: null }),
}));
