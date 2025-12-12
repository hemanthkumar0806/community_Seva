// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   Switch,
//   Alert,
//   Modal,
//   StyleSheet,
//   ActivityIndicator,
//   Image,
// } from "react-native";
// import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';

// // Configuration - Choose your AI provider
// const AI_CONFIG = {
//   provider: 'gemini', // 'openai' or 'gemini'
//   
//   // For Google Gemini
//   geminiApiKey: 'AIzaSyB9ow_xqIZq4KuJcFdUli8E5niJEQ9KL7c', // ← ADD YOUR GEMINI KEY
//   geminiModel: 'gemini-2.5-flash', // Available: gemini-1.5-flash-latest, gemini-1.5-pro-latest, gemini-pro-vision
//   
//   // For OpenAI (alternative)
//   openaiApiKey: 'sk-proj-your-openai-key-here',
//   openaiApiUrl: 'https://api.openai.com/v1/chat/completions',
//   
//   useAI: true, // Set to true when you have a valid API key
// };

//  // --- Type Definitions ---
//  interface MedicineForm {
//    medicineName: string;
//    genericName: string;
//    dosage: string;
//    medicineType: string;
//    manufacturer: string;
//    frequency: string;
//    timeSlots: string[];
//    startDate: string;
//    endDate: string;
//    withFood: string;
//    instructions: string;
//    sideEffects: string;
//    currentStock: string;
//    lowStockThreshold: string;
//    refillReminder: boolean;
//    autoRefill: boolean;
//  }
//  
//  type MedicineType = 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Drops' | 'Cream' | 'Inhaler' | 'Other';
//  type FrequencyType = 'Once Daily' | 'Twice Daily' | 'Thrice Daily' | 'As Needed' | 'Custom';
//  type FoodRelation = 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach' | 'Anytime';
//  type EntryMode = null | 'manual' | 'prescription';

//  // Interface used for parsed AI results 
//  interface ExtractedMedicine {
//    id: string; // Added for unique key in lists
//    medicineName: string;
//    genericName: string;
//    dosage: string;
//    medicineType: MedicineType | string;
//    manufacturer: string;
//    frequency: FrequencyType | string;
//    timeSlots: string[];
//    startDate: string;
//    endDate: string;
//    withFood: FoodRelation | string;
//    instructions: string;
//    sideEffects: string;
//    currentStock: string;
//    lowStockThreshold: string;
//  }

// // Interface for the full AI response (contains the array)
// interface ExtractedMedicinesResponse {
//     medicines: ExtractedMedicine[];
// }


// const medicineIcons: Record<string, string> = {
//   'Tablet': '💊',
//   'Capsule': '🔴',
//   'Syrup': '🍯',
//   'Injection': '💉',
//   'Drops': '💧',
//   'Cream': '🧴',
//   'Inhaler': '🌬️',
//   'Other': '🧪',
// };

// // --- AI Integration Function for Gemini (Keeps returning the full array) ---
// const extractPrescriptionWithGemini = async (imageBase64: string): Promise<ExtractedMedicinesResponse> => {
//   try {
//     if (!AI_CONFIG.geminiApiKey || AI_CONFIG.geminiApiKey === 'your-gemini-api-key-here') {
//       throw new Error("AI_NOT_CONFIGURED");
//     }

//     const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${AI_CONFIG.geminiModel}:generateContent?key=${AI_CONFIG.geminiApiKey}`;
//     
//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [{
//           parts: [
//             {
//               text: `Analyze this prescription image and extract ALL medicines listed. Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, no explanation, no trailing commas):

// {
//   "medicines": [
//     {
//       "medicineName": "exact medicine name from prescription",
//       "genericName": "generic/chemical name if visible",
//       "dosage": "dosage with unit like 500mg or 10ml",
//       "medicineType": "must be one of: Tablet, Capsule, Syrup, Injection, Drops, Cream, Inhaler, Other",
//       "manufacturer": "company/brand name if visible",
//       "frequency": "must be one of: Once Daily, Twice Daily, Thrice Daily, As Needed",
//       "timeSlots": ["morning time like 8:00 AM", "afternoon time like 2:00 PM", "evening time like 8:00 PM"],
//       "startDate": "start date in DD/MM/YYYY format if visible",
//       "endDate": "end date in DD/MM/YYYY format if visible or empty",
//       "withFood": "must be one of: Before Food, After Food, With Food, Empty Stomach, Anytime",
//       "instructions": "any special instructions from prescription",
//       "sideEffects": "possible side effects if mentioned",
//       "currentStock": "estimated quantity as number string",
//       "lowStockThreshold": "suggested low stock alert number"
//     }
//   ]
// }

// CRITICAL INSTRUCTIONS:
// - Extract EVERY medicine visible in the prescription
// - If prescription has 5 medicines, return all 5 in the array
// - Return empty string "" for fields not visible in the image
// - Return [] for empty timeSlots array
// - Ensure medicineType, frequency, and withFood use ONLY the exact values specified
// - NO trailing commas in JSON
// - If no medicines found, return: {"medicines": []}`
//             },
//             {
//               inline_data: {
//                 mime_type: "image/jpeg",
//                 data: imageBase64
//               }
//             }
//           ]
//         }],
//         generationConfig: {
//           temperature: 0.1,
//           topK: 32,
//           topP: 1,
//           maxOutputTokens: 4096,
//         },
//        
//       })
//     });

//     if (!response.ok) {
//       let errorMessage = `API Error: ${response.status}`;
//       try {
//         const errorData = await response.json();
//         errorMessage = errorData?.error?.message || errorMessage;
//       } catch (e) {
//         errorMessage = `HTTP ${response.status}: ${response.statusText}`;
//       }
//       throw new Error(errorMessage);
//     }

//     const data = await response.json();
//     console.log("Full API response:", JSON.stringify(data, null, 2));
//     
//     if (data.promptFeedback?.blockReason) {
//       throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
//     }
//     
//     if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
//       throw new Error("No candidates in API response. The image might be unclear.");
//     }

//     const candidate = data.candidates[0];
//     
//     if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
//       throw new Error(`Response filtered: ${candidate.finishReason}. Try a different image.`);
//     }

//     if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts)) {
//       throw new Error("Invalid response structure from API");
//     }

//     if (candidate.content.parts.length === 0 || !candidate.content.parts[0].text) {
//       throw new Error("No text content in API response");
//     }

//     let extractedText = candidate.content.parts[0].text;
//     console.log("Raw Gemini response:", extractedText);
//     
//     extractedText = extractedText
//       .replace(/```json\n?/g, '')
//       .replace(/```\n?/g, '')
//       .replace(/^\s*json\s*/i, '')
//       .trim();
//     
//     const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
//     
//     if (!jsonMatch) {
//       throw new Error("No JSON object found in response. The image might not be a prescription.");
//     }
//     
//     let jsonStr = jsonMatch[0];
//     jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
//     jsonStr = jsonStr.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
//     jsonStr = jsonStr.replace(/[\u201C\u201D]/g, '"');
//     jsonStr = jsonStr.replace(/[\u2018\u2019]/g, "'");
//     
//     console.log("Cleaned JSON:", jsonStr);
//     
//     try {
//       const parsed = JSON.parse(jsonStr);
//       console.log("Parsed Gemini response:", parsed);
//       
//       if (!parsed.medicines || !Array.isArray(parsed.medicines)) {
//         throw new Error("Invalid response format - medicines array not found");
//       }

//       if (parsed.medicines.length === 0) {
//         throw new Error("No medicines found in the prescription. Please ensure the image is clear and contains medicine information.");
//       }
//       
//       const medicines: ExtractedMedicine[] = parsed.medicines.map((med: any, index: number) => {
//         const result: ExtractedMedicine = {
//           id: `med_${med.medicineName || index}_${Date.now()}_${index}`, 
//           medicineName: med.medicineName || "",
//           genericName: med.genericName || "",
//           dosage: med.dosage || "",
//           medicineType: med.medicineType || "Tablet", // Default to Tablet if empty
//           manufacturer: med.manufacturer || "",
//           frequency: med.frequency || "Once Daily", // Default to Once Daily
//           timeSlots: [],
//           startDate: med.startDate || "",
//           endDate: med.endDate || "",
//           withFood: med.withFood || "Anytime", // Default to Anytime
//           instructions: med.instructions || "",
//           sideEffects: med.sideEffects || "",
//           currentStock: med.currentStock || "",
//           lowStockThreshold: med.lowStockThreshold || "",
//         };
//         
//         if (typeof med.timeSlots === 'string') {
//           result.timeSlots = [med.timeSlots];
//         } else if (Array.isArray(med.timeSlots)) {
//           result.timeSlots = med.timeSlots.filter((slot: any) => slot && slot.trim());
//         }
//         
//         // Use default time slots based on frequency if timeSlots is empty
//         if (result.timeSlots.length === 0) {
//           if (result.frequency === 'Once Daily') result.timeSlots = ["9:00 AM"];
//           if (result.frequency === 'Twice Daily') result.timeSlots = ["9:00 AM", "7:00 PM"];
//           if (result.frequency === 'Thrice Daily') result.timeSlots = ["8:00 AM", "1:00 PM", "6:00 PM"];
//         }

//         return result;
//       });
//       
//       const validMedicines = medicines.filter(med => med.medicineName && med.medicineName.trim());
//       
//       if (validMedicines.length === 0) {
//         throw new Error("Could not extract any valid medicine names. Please try a clearer photo.");
//       }
//       
//       // Return the full list of extracted medicines
//       return { medicines: validMedicines };
//     } catch (parseError: any) {
//       console.error("JSON parse error:", parseError.message);
//       console.error("Problematic JSON:", jsonStr);
//       throw new Error("Could not parse AI response. Try capturing the image again.");
//     }
//   } catch (error: any) {
//     console.error("Gemini extraction error:", error);
//     if (error.message.includes("API Error") || error.message.includes("fetch")) {
//       throw new Error("Network error. Check your internet connection and API key.");
//     }
//     throw error;
//   }
// };
// // --- AI Integration Function for OpenAI (Keeps returning the full array) ---
// const extractPrescriptionWithOpenAI = async (imageBase64: string): Promise<ExtractedMedicinesResponse> => {
//   // ... (OpenAI implementation remains similar to Gemini, returning ExtractedMedicinesResponse)
//   try {
//     if (!AI_CONFIG.openaiApiKey || AI_CONFIG.openaiApiKey === 'sk-proj-your-openai-key-here') {
//       throw new Error("AI_NOT_CONFIGURED");
//     }
//     
//     const response = await fetch(AI_CONFIG.openaiApiUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${AI_CONFIG.openaiApiKey}`
//       },
//       body: JSON.stringify({
//         model: "gpt-4-vision-preview",
//         messages: [{
//           role: "user",
//           content: [
//             {
//               type: "text",
//               text: `Analyze this prescription image and extract ALL medicines.
// Return ONLY valid JSON in this exact structure:

// {
//   "medicines": [
//     {
//       "medicineName": "",
//       "genericName": "",
//       "dosage": "",
//       "medicineType": "Tablet|Capsule|Syrup|Injection|Drops|Cream|Inhaler|Other",
//       "manufacturer": "",
//       "frequency": "Once Daily|Twice Daily|Thrice Daily|As Needed",
//       "timeSlots": ["8:00 AM", "2:00 PM", "8:00 PM"],
//       "withFood": "Before Food|After Food|With Food|Empty Stomach|Anytime",
//       "instructions": "",
//       "sideEffects": "",
//       "currentStock": "",
//       "lowStockThreshold": ""
//     }
//   ]
// }

// Extract EVERY medicine visible in the image. If no data found return:

// { "medicines": [] }

// Return ONLY pure JSON.`

//             },
//             {
//               type: "image_url",
//               image_url: {
//                 url: `data:image/jpeg;base64,${imageBase64}`
//               }
//             }
//           ]
//         }],
//         max_tokens: 1000
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`API Error: ${response.status} - ${response.statusText}`);
//     }

//     const data = await response.json();
//     
//     if (data.error) {
//       throw new Error(data.error.message || "API Error");
//     }
//     
//     const extractedText = data.choices[0].message.content;
//     const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
//     
//     if (jsonMatch) {
//       // Map to ExtractedMedicine with unique IDs
//       const parsed = JSON.parse(jsonMatch[0]);
//       const medicines = parsed.medicines.map((med: any, index: number) => ({
//         ...med,
//         id: `med_${med.medicineName || index}_${Date.now()}_${index}`,
//         medicineType: med.medicineType || "Tablet",
//         frequency: med.frequency || "Once Daily",
//         withFood: med.withFood || "Anytime",
//         timeSlots: Array.isArray(med.timeSlots) ? med.timeSlots : (med.timeSlots ? [med.timeSlots] : ["9:00 AM"]),
//       }));
//       return { medicines };
//     }
//     
//     throw new Error("Failed to parse AI response");
//   } catch (error: any) {
//     console.error("AI extraction error:", error);
//     throw error;
//   }
// };

// // Mock function for testing (Keeps returning the full array)
// const mockExtractPrescription = async (): Promise<ExtractedMedicinesResponse> => {
//   await new Promise(resolve => setTimeout(resolve, 2500));
    
//     // Hardcoded data based on the Parsed Gemini response provided in the prompt
//     const mockMedicines: ExtractedMedicine[] = [
//         {
//             id: 'med_betaloc_1',
//             medicineName: "Betaloc",
//             genericName: "Metoprolol",
//             dosage: "100mg",
//             medicineType: "Tablet",
//             manufacturer: "AstraZeneca",
//             frequency: "Twice Daily",
//             timeSlots: ["9:00 AM", "7:00 PM"], // Default slots based on freq
//             startDate: "08/12/2025",
//             endDate: "",
//             withFood: "Anytime",
//             instructions: "1 tab",
//             sideEffects: "Dizziness, slow heart rate",
//             currentStock: "30",
//             lowStockThreshold: "7",
//         },
//         {
//             id: 'med_dorzolamidum_2',
//             medicineName: "Dorzolamidum",
//             genericName: "Dorzolamide",
//             dosage: "10mg",
//             medicineType: "Drops",
//             manufacturer: "Mylan",
//             frequency: "Twice Daily",
//             timeSlots: ["8:00 AM", "8:00 PM"],
//             startDate: "08/12/2025",
//             endDate: "",
//             withFood: "Anytime",
//             instructions: "1 drop in each eye",
//             sideEffects: "Eye irritation",
//             currentStock: "1",
//             lowStockThreshold: "0",
//         },
//         {
//             id: 'med_cimetidine_3',
//             medicineName: "Cimetidine",
//             genericName: "Tagamet",
//             dosage: "50mg",
//             medicineType: "Tablet",
//             manufacturer: "GSK",
//             frequency: "Thrice Daily",
//             timeSlots: ["8:00 AM", "1:00 PM", "6:00 PM"],
//             startDate: "08/12/2025",
//             endDate: "15/12/2025",
//             withFood: "With Food",
//             instructions: "2 tabs",
//             sideEffects: "Headache",
//             currentStock: "42",
//             lowStockThreshold: "10",
//         },
//         {
//             id: 'med_oxprelol_4',
//             medicineName: "Oxprelol",
//             genericName: "Oxprenolol",
//             dosage: "50mg",
//             medicineType: "Capsule",
//             manufacturer: "Novartis",
//             frequency: "Once Daily",
//             timeSlots: ["9:00 PM"],
//             startDate: "08/12/2025",
//             endDate: "",
//             withFood: "After Food",
//             instructions: "1 tab",
//             sideEffects: "",
//             currentStock: "60",
//             lowStockThreshold: "15",
//         },
//     ];

//     return { medicines: mockMedicines };
// };

// // --- Unified AI Extraction Function ---
// const extractPrescriptionWithAI = async (imageBase64: string): Promise<ExtractedMedicinesResponse> => {
//   if (AI_CONFIG.provider === 'gemini') {
//     return extractPrescriptionWithGemini(imageBase64);
//   } else {
//     return extractPrescriptionWithOpenAI(imageBase64);
//   }
// };

// // --- Styles (ORIGINAL STYLES) ---
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FEF2F2',
//   },
//   scrollContent: {
//     paddingBottom: 100,
//   },
//   cardShadow: {
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   gradientCard: {
//     borderRadius: 24,
//     padding: 24,
//     marginBottom: 16,
//   },
//   whiteCard: {
//     backgroundColor: 'white',
//     borderRadius: 24,
//     padding: 24,
//     marginBottom: 16,
//   },
//   headerIcon: {
//     width: 96,
//     height: 96,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 16,
//   },
//   input: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderWidth: 2,
//     borderColor: '#E5E7EB',
//     fontSize: 16,
//     color: '#1F2937',
//   },
//   inputFocused: {
//     borderColor: '#EF4444',
//   },
//   button: {
//     borderRadius: 16,
//     padding: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonPrimary: {
//     backgroundColor: '#EF4444',
//   },
//   buttonSecondary: {
//     backgroundColor: '#E5E7EB',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '90%',
//     backgroundColor: 'white',
//     borderRadius: 24,
//     overflow: 'hidden',
//     maxHeight: '80%',
//   },
//   infoBox: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     paddingVertical: 6,
//   },
//   chip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginRight: 8,
//   },
// });

// // --- Main Component ---
// const MedicineTracker: React.FC = () => {
//   const [entryMode, setEntryMode] = useState<EntryMode>(null);
//   const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadedImage, setUploadedImage] = useState<string | null>(null);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [currentTimeSlot, setCurrentTimeSlot] = useState(0);
//   const [datePickerType, setDatePickerType] = useState<'start' | 'end'>('start');


//   // State to hold ALL extracted medicines
//   const [extractedMedicines, setExtractedMedicines] = useState<ExtractedMedicine[]>([]);
//   // State to hold the current medicine that is being reviewed/edited/saved
//   const [currentMedicine, setCurrentMedicine] = useState<ExtractedMedicine | null>(null);


//   // State to hold the SINGLE medicine being reviewed/edited/saved
//   const [form, setForm] = useState<MedicineForm>({
//     medicineName: "", genericName: "", dosage: "", medicineType: "", manufacturer: "",
//     frequency: "", timeSlots: ["", ""], startDate: "", endDate: "", withFood: "",
//     instructions: "", sideEffects: "", currentStock: "", lowStockThreshold: "",
//     refillReminder: true, autoRefill: false,
//   });

//   const [selectedType, setSelectedType] = useState("");
//   const [selectedFrequency, setSelectedFrequency] = useState("");
//   const [selectedFoodRelation, setSelectedFoodRelation] = useState("");

//   const medicineTypes: MedicineType[] = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops', 'Cream', 'Inhaler', 'Other'];
//   const frequencies: FrequencyType[] = ['Once Daily', 'Twice Daily', 'Thrice Daily', 'As Needed', 'Custom'];
//   const foodRelations: FoodRelation[] = ['Before Food', 'After Food', 'With Food', 'Empty Stomach', 'Anytime'];

//   
//  // Helper to convert ExtractedMedicine to MedicineForm structure
//  const convertToForm = (medicine: ExtractedMedicine): MedicineForm => ({
//     medicineName: medicine.medicineName || "",
//     genericName: medicine.genericName || "",
//     dosage: medicine.dosage || "",
//     medicineType: medicine.medicineType as string || "Tablet",
//     manufacturer: medicine.manufacturer || "",
//     frequency: medicine.frequency as string || "Once Daily",
//     timeSlots: medicine.timeSlots.length > 0 ? medicine.timeSlots : ["", ""],
//     startDate: medicine.startDate || "",
//     endDate: medicine.endDate || "",
//     withFood: medicine.withFood as string || "Anytime",
//     instructions: medicine.instructions || "",
//     sideEffects: medicine.sideEffects || "",
//     currentStock: medicine.currentStock || "",
//     lowStockThreshold: medicine.lowStockThreshold || "",
//     refillReminder: true,
//     autoRefill: false,
// });


//   // Function to handle when a specific card is confirmed
//   const handleConfirmMedicine = (medicine: ExtractedMedicine) => {
//     // Simulate saving the medicine to the tracker
//     console.log("Confirmed and scheduling:", medicine.medicineName);
//     
//     // Pre-fill form state for the success modal display
//     const formState = convertToForm(medicine);
//     setForm(formState);
//     setSelectedType(formState.medicineType);
//     setSelectedFrequency(formState.frequency);
//     setSelectedFoodRelation(formState.withFood);

//     setShowSuccessModal(true);

//     // Remove the confirmed medicine from the review list
//     setExtractedMedicines(prev => prev.filter(m => m.id !== medicine.id));
//     if (extractedMedicines.length === 1) {
//         setPrescriptionUploaded(false); // If it was the last one, go back to upload screen
//     }
//   };
    
//   // Function to handle when a specific card needs editing (moves to manual form pre-filled)
//  


//   // --- Image Upload Handler ---
//   const handleImageUpload = async (type: 'camera' | 'gallery' | 'file') => {
//     if (isUploading) return;
//     
//     try {
//       if (type === 'camera' || type === 'gallery') {
//         // Request permissions
//         const permissionResult = type === 'camera' 
//           ? await ImagePicker.requestCameraPermissionsAsync()
//           : await ImagePicker.requestMediaLibraryPermissionsAsync();

//         if (!permissionResult.granted) {
//           Alert.alert("Permission Required", `Please grant ${type} access to continue.`);
//           return;
//         }

//         setIsUploading(true);

//         // Launch camera or gallery
//         const result = type === 'camera'
//           ? await ImagePicker.launchCameraAsync({
//               mediaTypes: ImagePicker.MediaTypeOptions.Images,
//               allowsEditing: true,
//               aspect: [4, 3],
//               quality: 0.8,
//               base64: true,
//             })
//           : await ImagePicker.launchImageLibraryAsync({
//               mediaTypes: ImagePicker.MediaTypeOptions.Images,
//               allowsEditing: true,
//               aspect: [4, 3],
//               quality: 0.8,
//               base64: true,
//             });

//         if (!result.canceled && result.assets && result.assets[0]) {
//           const imageUri = result.assets[0].uri;
//           const imageBase64 = result.assets[0].base64;
//           
//           setUploadedImage(imageUri);

//           try {
//             let extractedData: ExtractedMedicinesResponse;
//             
//             // Try AI extraction first if enabled
//             if (AI_CONFIG.useAI) {
//               const apiKey = AI_CONFIG.provider === 'gemini' ? AI_CONFIG.geminiApiKey : AI_CONFIG.openaiApiKey;
//               
//               if (apiKey && apiKey !== 'your-gemini-api-key-here' && apiKey !== 'sk-proj-your-openai-key-here') {
//                 // AI function retrieves ALL medicines
//                 extractedData = await extractPrescriptionWithAI(imageBase64!);
//                 Alert.alert("Success", `Prescription analyzed by ${AI_CONFIG.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} successfully! Found ${extractedData.medicines.length} medicine(s).`);
//               } else {
//                 // API key not configured, use mock data
//                 extractedData = await mockExtractPrescription();
//                 Alert.alert("Demo Mode", `Using demo data (AI key not configured). Found ${extractedData.medicines.length} medicine(s).`);
//               }
//             } else {
//               // AI disabled, use mock data
//               extractedData = await mockExtractPrescription();
//               Alert.alert("Demo Mode", `Using demo data (AI disabled). Found ${extractedData.medicines.length} medicine(s).`);
//             }
             
//              // --- LOGIC TO LOAD ALL EXTRACTED MEDICINES FOR REVIEW ---
//             if (extractedData.medicines.length > 0) {
//                 setExtractedMedicines(extractedData.medicines); 
//                 setPrescriptionUploaded(true);
//             } else {
//                 Alert.alert("Error", "No valid medicines found in the prescription data.");
//             }
//           } catch (aiError: any) {
//             console.error("AI Error:", aiError);
//             
//             // If AI fails, offer fallback options
//             Alert.alert(
//               "AI Analysis Failed",
//               aiError.message || "Unable to extract data from image. Choose an option:",
//               [
//                 { 
//                   text: "Use Demo Data", 
//                   onPress: async () => {
//                     const mockData = await mockExtractPrescription();
//                     setExtractedMedicines(mockData.medicines);
//                     setPrescriptionUploaded(true);
//                   }
//                 },
//                 { text: "Enter Manually", onPress: () => setEntryMode('manual') },
//                 { text: "Cancel", style: "cancel" }
//               ]
//             );
//           }
//         }
//       } else {
//         // File picker for PDFs
//         setIsUploading(true);
//         const result = await DocumentPicker.getDocumentAsync({
//           type: ['application/pdf', 'image/*'],
//           copyToCacheDirectory: true,
//         });

//         // DocumentPickerResult may not include a "type" property in the TS types,
//         // so check for the presence of "uri" which indicates a successful pick.
//         if ('uri' in result && result.uri) {
//           setUploadedImage(result.uri as string);
//           
//           // For PDFs, you'd need additional processing
//           Alert.alert("PDF Upload", "PDF processing requires additional setup. Using mock data for demo.");
//           
//           const extractedData = await mockExtractPrescription();
//           setExtractedMedicines(extractedData.medicines);
//           setPrescriptionUploaded(true);
//         }
//       }
//     } catch (error) {
//       Alert.alert("Error", "Failed to process image. Please try again.");
//       console.error(error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

// const handleSave = () => {

//   if (!form.medicineName.trim()) {
//     Alert.alert("Validation Error", "Please enter medicine name");
//     return;
//   }

//   if (!form.dosage.trim()) {
//     Alert.alert("Validation Error", "Please enter dosage");
//     return;
//   }

//   if (!selectedType) {
//     Alert.alert("Validation Error", "Please select medicine type");
//     return;
//   }

//   // ✅ If editing extracted medicine – remove that card
//   if (currentMedicine) {
//     setExtractedMedicines(prev =>
//       prev.filter(m => m.id !== currentMedicine.id)
//     );
//     setCurrentMedicine(null);
//   }

//   // ✅ ONLY show modal — DO NOT change screen here
//   setShowSuccessModal(true);
// };

//   const resetForm = () => {
//     setForm({
//       medicineName: "", genericName: "", dosage: "", medicineType: "", manufacturer: "",
//       frequency: "", timeSlots: ["", ""], startDate: "", endDate: "", withFood: "",
//       instructions: "", sideEffects: "", currentStock: "", lowStockThreshold: "",
//       refillReminder: true, autoRefill: false,
//     });
//     setSelectedType("");
//     setSelectedFrequency("");
//     setSelectedFoodRelation("");
//     setUploadedImage(null);
//     setPrescriptionUploaded(false);
//     setExtractedMedicines([]); // Keep this to track that all medicines were cleared
//   };


// // --- RENDER FUNCTION FOR A SINGLE MEDICINE CARD (Used inside the map in Review Screen) ---
// const renderMedicineCard = (medicine: ExtractedMedicine) => {
//     return (
//         <View key={medicine.id} style={[styles.whiteCard, styles.cardShadow, { borderTopWidth: 8, borderTopColor: '#EF4444', padding: 0 }]}>
//             <View style={{ padding: 24 }}>
//                 {/* Header */}
//                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottomWidth: 2, borderBottomColor: '#F3F4F6' }}>
//                     <Text style={{ fontSize: 48, marginRight: 16 }}>
//                         {medicineIcons[medicine.medicineType] || '💊'}
//                     </Text>
//                     <View style={{ flex: 1 }}>
//                         <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
//                             {medicine.medicineName || "Medicine Name"}
//                         </Text>
//                         <Text style={{ fontSize: 14, fontWeight: '600', color: '#EF4444', marginTop: 4 }}>
//                             {medicine.genericName || `${medicine.dosage} - ${medicine.medicineType}`}
//                         </Text>
//                     </View>
//                 </View>

//                 {/* Details Grid */}
//                 <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, gap: 12 }}>
//                     <View style={{ width: '47%', backgroundColor: '#FEE2E2', borderRadius: 16, padding: 16 }}>
//                         <Text style={{ fontSize: 10, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>DOSAGE</Text>
//                         <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>{medicine.dosage || 'N/A'}</Text>
//                     </View>
//                     <View style={{ width: '47%', backgroundColor: '#FFE4E6', borderRadius: 16, padding: 16 }}>
//                         <Text style={{ fontSize: 10, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>FREQUENCY</Text>
//                         <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>{medicine.frequency || 'N/A'}</Text>
//                     </View>
//                     <View style={{ width: '100%', backgroundColor: '#FFEDD5', borderRadius: 16, padding: 16 }}>
//                         <Text style={{ fontSize: 10, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>SCHEDULE</Text>
//                         <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>{medicine.timeSlots.join(', ') || 'Anytime'}</Text>
//                     </View>
//                 </View>

//                 {/* Instructions */}
//                 {medicine.instructions && (
//                     <View style={{ backgroundColor: '#DBEAFE', borderLeftWidth: 4, borderLeftColor: '#3B82F6', borderRadius: 12, padding: 16, marginBottom: 16 }}>
//                         <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
//                             <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginRight: 12, marginTop: 2 }} />
//                             <View style={{ flex: 1 }}>
//                                 <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>Instructions</Text>
//                                 <Text style={{ fontSize: 13, color: '#4B5563' }}>{medicine.instructions}</Text>
//                             </View>
//                         </View>
//                     </View>
//                 )}

//                 {/* Action Buttons */}
//                 <View style={{ flexDirection: 'row', gap: 16 }}>
                    

//                     <TouchableOpacity
//                         onPress={() => handleConfirmMedicine(medicine)}
//                         style={{ flex: 1 }}
//                         activeOpacity={0.7}
//                     >
//                         <LinearGradient
//                             colors={['#EF4444', '#DC2626']}
//                             style={{ borderRadius: 16, padding: 16, alignItems: 'center' }}
//                         >
//                             <Ionicons name="add-circle" size={24} color="white" />
//                             <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'white', marginTop: 8 }}>Add to Tracker</Text>
//                         </LinearGradient>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </View>
//     );
// };

//   if (!entryMode) {
//     return (
//       <View className="flex-1 bg-white">
//       <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
//         <View className="px-5 pt-16">

//           {/* ===== HEADER ===== */}
//           <View className="items-center mb-10">
//             <LinearGradient
//               colors={["#FECACA", "#EF4444", "#B91C1C"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               className="w-24 h-24 rounded-2xl items-center justify-center shadow-2xl"
//             >
//               <FontAwesome5 name="medkit" size={40} color="white" />
//             </LinearGradient>

//             <Text className="text-4xl font-extrabold text-gray-900 mt-4">MyMeds Tracker</Text>
//             <Text className="text-sm text-gray-500 text-center mt-2 px-6 leading-5">
//               Choose how you'd like to add your medicine and stay consistent with your treatment.
//             </Text>
//           </View>

//           {/* ===== AI PRESCRIPTION CARD ===== */}
//           <TouchableOpacity onPress={() => setEntryMode("prescription")} activeOpacity={0.92} className="mb-5">
//             <LinearGradient
//               colors={["#EF4444", "#DC2626", "#991B1B"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               className="rounded-3xl p-5 overflow-hidden shadow-2xl"
//             >
//               {/* glow circle */}
//               <View className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-white/10" />

//               <View className="flex-row">
//                 <View className="w-16 h-16 bg-white/20 rounded-xl items-center justify-center mr-4">
//                   <MaterialCommunityIcons name="brain" size={30} color="white" />
//                 </View>

//                 <View className="flex-1">
//                   <View className="flex-row items-center mb-2">
//                     <Text className="text-lg font-extrabold text-white mr-3">AI Prescription Scan</Text>
//                     <View className="bg-amber-400 px-3 py-1 rounded-full">
//                       <Text className="text-xs font-bold text-gray-900">SMART</Text>
//                     </View>
//                   </View>

//                   <Text className="text-sm text-white/90 mb-3">
//                     Upload a photo to auto-extract all details instantly
//                   </Text>

//                   {/* info points */}
//                   <View className="space-y-2">
//                     <View className="flex-row items-start">
//                       <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.9)" className="mr-3 mt-0.5" />
//                       <Text className="text-xs text-white/90 flex-1">
//                         Automatic data extraction from prescriptions
//                       </Text>
//                     </View>
//                     <View className="flex-row items-start">
//                       <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.9)" className="mr-3 mt-0.5" />
//                       <Text className="text-xs text-white/90 flex-1">
//                         Supports handwritten and printed formats
//                       </Text>
//                     </View>
//                     <View className="flex-row items-start">
//                       <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.9)" className="mr-3 mt-0.5" />
//                       <Text className="text-xs text-white/90 flex-1">
//                         Saves time — No manual typing required
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* ===== MANUAL ENTRY CARD ===== */}
//           <TouchableOpacity onPress={() => setEntryMode("manual")} activeOpacity={0.92}>
//             <View className="bg-white rounded-3xl p-5 shadow-md border-t-4 border-red-600">
//               <View className="flex-row">
//                 <View className="w-16 h-16 bg-red-50 rounded-xl items-center justify-center mr-4">
//                   <Ionicons name="pencil" size={28} color="#EF4444" />
//                 </View>

//                 <View className="flex-1">
//                   <Text className="text-lg font-extrabold text-gray-900 mb-1">Manual Entry</Text>
//                   <Text className="text-sm text-gray-500 mb-3">Fill in all medicine details step-by-step</Text>

//                   {/* info points */}
//                   <View className="space-y-2">
//                     <View className="flex-row items-start">
//                       <Ionicons name="information-circle" size={16} color="#6B7280" className="mr-3 mt-0.5" />
//                       <Text className="text-xs text-gray-600 flex-1">Complete control over all information</Text>
//                     </View>
//                     <View className="flex-row items-start">
//                       <Ionicons name="information-circle" size={16} color="#6B7280" className="mr-3 mt-0.5" />
//                       <Text className="text-xs text-gray-600 flex-1">Ideal when prescription is not available</Text>
//                     </View>
//                     <View className="flex-row items-start">
//                       <Ionicons name="information-circle" size={16} color="#6B7280" className="mr-3 mt-0.5" />
//                       <Text className="text-xs text-gray-600 flex-1">Set custom schedules and reminders</Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </TouchableOpacity>

//         </View>
//       </ScrollView>
//     </View>
//     );


//   }

//   
//   if (entryMode === 'prescription' && !prescriptionUploaded) {
//     return (
//       <View className="flex-1 bg-rose-50">
//   <ScrollView showsVerticalScrollIndicator={false}>

//     {/* 🔴 Gradient Header */}
//     <LinearGradient
//       colors={['#7F1D1D', '#EF4444', '#FCA5A5']}
//       className="h-[300px] rounded-b-[40px] px-6 pt-10"
//     >
//       {/* Back Button */}
//       <TouchableOpacity
//         onPress={() => setEntryMode(null)}
//         className="w-11 h-11 bg-white/25 rounded-xl items-center justify-center"
//       >
//         <Ionicons name="arrow-back" size={22} color="white" />
//       </TouchableOpacity>

//       {/* Header Content */}
//       <View className="mt-8 items-center">
//         <View className="w-24 h-24 bg-white rounded-[26px] items-center justify-center shadow-xl mb-5">
//           {isUploading ? (
//             <ActivityIndicator size="large" color="#EF4444" />
//           ) : (
//             <MaterialCommunityIcons
//               name="file-document-plus"
//               size={42}
//               color="#EF4444"
//             />
//           )}
//         </View>

//         <Text className="text-white text-2xl font-extrabold mb-1">
//           {isUploading ? 'Analyzing...' : 'Upload Prescription'}
//         </Text>

//         <Text className="text-rose-100 text-sm text-center">
//           {isUploading
//             ? 'AI is reading your medicines'
//             : 'Upload via camera, gallery or PDF'}
//         </Text>
//       </View>
//     </LinearGradient>

//     {/* 🔘 Upload Options */}
//     <View className="px-5 -mt-10">
//       {[
//         {
//           type: 'camera',
//           icon: 'camera',
//           title: 'Scan with Camera',
//           subtitle: 'Instant scan from camera',
//         },
//         {
//           type: 'gallery',
//           icon: 'images',
//           title: 'Select from Gallery',
//           subtitle: 'Pick saved prescription',
//         },
//         {
//           type: 'file',
//           icon: 'document-text',
//           title: 'Upload PDF',
//           subtitle: 'Upload a digital file',
//         },
//       ].map((item, index) => (
//         <TouchableOpacity
//           key={index}
//           onPress={() => handleImageUpload(item.type as any)}
//           disabled={isUploading}
//           activeOpacity={0.85}
//           className={`bg-white rounded-2xl px-4 py-5 flex-row items-center mb-5 shadow-xl ${
//             isUploading ? 'opacity-50' : ''
//           }`}
//         >
//           {/* Left Icon */}
//           <LinearGradient
//             colors={['#FFF1F2', '#FFE4E6']}
//             className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
//           >
//             <Ionicons name={item.icon as any} size={26} color="#DC2626" />
//           </LinearGradient>

//           {/* Text */}
//           <View className="flex-1">
//             <Text className="text-[17px] font-bold text-rose-900 mb-1">
//               {item.title}
//             </Text>
//             <Text className="text-[13px] text-rose-700">
//               {item.subtitle}
//             </Text>
//           </View>

//           {/* Arrow */}
//           <LinearGradient
//             colors={['#DC2626', '#F43F5E']}
//             className="w-11 h-11 rounded-xl items-center justify-center"
//           >
//             <Ionicons name="arrow-forward" size={20} color="white" />
//           </LinearGradient>
//         </TouchableOpacity>
//       ))}
//     </View>
//   </ScrollView>
// </View>

//     );
//   }

//   if (entryMode === 'prescription' && prescriptionUploaded) {
//     return (
//       <View style={styles.container}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
//             {/* Back Button */}
//             <TouchableOpacity
//               onPress={() => { setPrescriptionUploaded(false); setEntryMode(null); }}
//               style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}
//             >
//               <Ionicons name="arrow-back" size={24} color="#DC2626" />
//               <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#DC2626' }}>Back to Upload</Text>
//             </TouchableOpacity>

//             {/* Success Banner */}
//             <LinearGradient
//               colors={['#34D399', '#10B981']}
//               style={[{ borderRadius: 20, padding: 20, marginBottom: 24 }, styles.cardShadow]}
//             >
//               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <View style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
//                   <Ionicons name="sparkles" size={28} color="white" />
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
//                     AI Analysis Complete!
//                   </Text>
//                   <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
//                     Review and add the **{extractedMedicines.length}** medicine(s) below.
//                   </Text>
//                 </View>
//               </View>
//             </LinearGradient>

//             {/* Uploaded Image Preview (Optional) */}
//             {uploadedImage && (
//               <View style={[styles.cardShadow, { marginBottom: 24, borderRadius: 20, overflow: 'hidden' }]}>
//                 <Image
//                   source={{ uri: uploadedImage }}
//                   style={{ width: '100%', height: 180 }}
//                   resizeMode="cover"
//                 />
//               </View>
//             )}

//             {/* --- MAPPED MEDICINE CARDS (USING ORIGINAL STYLING) --- */}
//             {extractedMedicines.map((medicine) => renderMedicineCard(medicine))}
//             {/* --------------------------------------------- */}

//             {/* No Medicines Found Fallback */}
//             {extractedMedicines.length === 0 && (
//               <View style={[styles.whiteCard, styles.cardShadow, { padding: 32, alignItems: 'center' }]}>
//                 <Ionicons name="checkmark-circle-outline" size={40} color="#10B981" style={{ marginBottom: 16 }} />
//                 <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>All Medicines Confirmed</Text>
//                 <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
//                   All medicines from this prescription have been successfully added to your tracker.
//                 </Text>
//                 <TouchableOpacity
//                     onPress={() => { setPrescriptionUploaded(false); setEntryMode(null); }}
//                     style={[styles.button, styles.buttonPrimary, { marginTop: 20, width: '100%', backgroundColor: '#10B981' }]}
//                 >
//                     <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Go to Home</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>
//         </ScrollView>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       style={styles.container}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
//           {/* Back Button (UPDATED to return to review screen if in edit context) */}
//           <TouchableOpacity
//             onPress={() => {
//                 if (currentMedicine) {
//                     setEntryMode('prescription');
//                     setCurrentMedicine(null);
//                 } else {
//                     Alert.alert("Discard Changes", "Are you sure you want to discard?", [
//                         { text: "Cancel", style: "cancel" },
//                         { text: "Discard", onPress: () => { setEntryMode(null); resetForm(); } }
//                     ]);
//                 }
//             }}
//             style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}
//           >
//             <Ionicons name="arrow-back" size={24} color="#DC2626" />
//             <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#DC2626' }}>
//                 {currentMedicine ? 'Back to Review' : 'Back'}
//             </Text>
//           </TouchableOpacity>

//           {/* Header */}
//           <View style={{ alignItems: 'center', marginBottom: 32 }}>
//             <LinearGradient
//               colors={['#FCA5A5', '#EF4444']}
//               style={[{ width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, styles.cardShadow]}
//             >
//               <Ionicons name="document-text-outline" size={32} color="white" />
//             </LinearGradient>
//             <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
//                 {currentMedicine ? 'Edit Medicine' : 'Manual Entry'}
//             </Text>
//             <Text style={{ fontSize: 14, color: '#6B7280' }}>Fill in the required fields below</Text>
//           </View>

//           {/* Basic Information Section */}
//           <View style={[styles.whiteCard, styles.cardShadow]}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
//               <Ionicons name="medical-outline" size={20} color="#EF4444" />
//               <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginLeft: 8 }}>Basic Information</Text>
//             </View>

//           <View style={{ marginBottom: 16 }}>
//   <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>Medicine Name <Text style={{ color: '#EF4444' }}>*</Text></Text>
//   <TextInput
//     style={styles.input}
//     placeholder="e.g., Paracetamol"
//     value={form.medicineName}
//     onChangeText={(v) => setForm({ ...form, medicineName: v })}
//     placeholderTextColor="#9CA3AF"
//   />
// </View>


//             <View style={{ marginBottom: 16 }}>
//               <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>Generic Name</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="e.g., Acetaminophen"
//                 value={form.genericName}
//                 onChangeText={(v) => setForm({...form, genericName: v})}
//                 placeholderTextColor="#9CA3AF"
//               />
//             </View>

//             <View style={{ flexDirection: 'row', marginBottom: 16, gap: 12 }}>
//               <View style={{ flex: 1 }}>
//                 <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }} className="ml-[-60]">
//                   Dosage <Text style={{ color: '#EF4444' }}>*</Text>
//                 </Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="500mg"
//                   value={form.dosage}
//                   onChangeText={(v) => setForm({...form, dosage: v})}
//                   placeholderTextColor="#9CA3AF"
//                 />
//               </View>
// {/*               <View style={{ flex: 1 }}>
//                 <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>Manufacturer</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="e.g., GSK"
//                   value={form.manufacturer}
//                   onChangeText={(v) => setForm({...form, manufacturer: v})}
//                   placeholderTextColor="#9CA3AF"
//                 />
//               </View> */}
//             </View>

//             <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }} className="ml-[-45]">
//               Medicine Type <Text style={{ color: '#EF4444' }}>*</Text>
//             </Text>
//             <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//               {medicineTypes.map((type) => (
//                 <TouchableOpacity
//                   key={type}
//                   onPress={() => setSelectedType(type)}
//                   style={{
//                     width: '23%',
//                     padding: 12,
//                     borderRadius: 16,
//                     borderWidth: 2,
//                     borderColor: selectedType === type ? '#EF4444' : '#E5E7EB',
//                     backgroundColor: selectedType === type ? '#FEE2E2' : 'white',
//                     alignItems: 'center',
//                   }}
//                 >
//                   <Text style={{ fontSize: 24, marginBottom: 4 }}>{medicineIcons[type]}</Text>
//                   <Text style={{ fontSize: 10, fontWeight: '600', color: '#374151' }}>{type}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           {/* Schedule Section */}
//          <View style={styles.whiteCard}>
//   <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
//     <Ionicons name="calendar-outline" size={20} color="#EF4444" />
//     <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginLeft: 8 }}>
//       Dosing Schedule
//     </Text>
//   </View>

//   {/* Frequency */}
//   <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>
//     Frequency <Text style={{ color: '#EF4444' }}>*</Text>
//   </Text>

//   <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
//     {frequencies.map((freq) => (
//       <TouchableOpacity
//         key={freq}
//         onPress={() => {
//           setSelectedFrequency(freq);
//           const slots =
//             freq === 'Once Daily' ? 1 :
//             freq === 'Twice Daily' ? 2 :
//             freq === 'Thrice Daily' ? 3 : 2;

//           setForm({ ...form, frequency: freq, timeSlots: Array(slots).fill("") });
//         }}
//         style={{
//           paddingVertical: 10,
//           paddingHorizontal: 14,
//           borderRadius: 10,
//           borderWidth: 1,
//           borderColor: selectedFrequency === freq ? '#EF4444' : '#D1D5DB',
//           backgroundColor: selectedFrequency === freq ? '#FEE2E2' : '#FFFFFF',
//         }}
//       >
//         <Text
//           style={{
//             fontSize: 13,
//             fontWeight: '600',
//             color: selectedFrequency === freq ? '#DC2626' : '#374151',
//           }}
//         >
//           {freq}
//         </Text>
//       </TouchableOpacity>
//     ))}
//   </View>

//   {/* Time Slots */}
//   {selectedFrequency && selectedFrequency !== 'As Needed' && (
//     <View style={{ marginBottom: 16 }}>
//       <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>
//         Time Slots
//       </Text>

//       <View style={{ flexDirection: 'row', gap: 8 }}>
//         {form.timeSlots.map((slot, i) => (
//           <TouchableOpacity
//             key={i}
//             onPress={() => {
//               setCurrentTimeSlot(i);
//               setShowTimePicker(true);
//             }}
//             style={{
//               flex: 1,
//               borderWidth: 1,
//               borderColor: '#D1D5DB',
//               borderRadius: 10,
//               padding: 12,
//               alignItems: 'center',
//               backgroundColor: '#FFFFFF',
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 13,
//                 fontWeight: '600',
//                 color: slot ? '#111827' : '#9CA3AF',
//               }}
//             >
//               {slot || `Slot ${i + 1}`}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   )}

//   {/* Start & End Date */}
//   <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
//     <View style={{ flex: 1 }}>
//       <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>
//         Start Date
//       </Text>
//       <TouchableOpacity
//         onPress={() => {
//           setDatePickerType('start');
//           setShowDatePicker(true);
//         }}
//         style={{
//           borderWidth: 1,
//           borderColor: '#D1D5DB',
//           borderRadius: 10,
//           padding: 12,
//           backgroundColor: '#FFFFFF',
//         }}
//       >
//         <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
//           {form.startDate || 'Select date'}
//         </Text>
//       </TouchableOpacity>
//     </View>

//     <View style={{ flex: 1 }}>
//       <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>
//         End Date
//       </Text>
//       <TouchableOpacity
//         onPress={() => {
//           setDatePickerType('end');
//           setShowDatePicker(true);
//         }}
//         style={{
//           borderWidth: 1,
//           borderColor: '#D1D5DB',
//           borderRadius: 10,
//           padding: 12,
//           backgroundColor: '#FFFFFF',
//         }}
//       >
//         <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
//           {form.endDate || 'Ongoing'}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// </View>

//           {/* Food & Instructions Section */}
//           <View style={[styles.whiteCard, styles.cardShadow]}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
//               <Ionicons name="restaurant-outline" size={20} color="#EF4444" />
//               <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginLeft: 8 }}>Food & Instructions</Text>
//             </View>

//             <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>When to Take</Text>
//             <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
//               {foodRelations.map((relation) => (
//                 <TouchableOpacity
//                   key={relation}
//                   onPress={() => setSelectedFoodRelation(relation)}
//                   style={{
//                     width: '48%',
//                     paddingVertical: 12,
//                     paddingHorizontal: 12,
//                     borderRadius: 16,
//                     borderWidth: 2,
//                     borderColor: selectedFoodRelation === relation ? '#EF4444' : '#E5E7EB',
//                     backgroundColor: selectedFoodRelation === relation ? '#FEE2E2' : 'white',
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                   }}
//                 >
//                   <View style={{
//                     width: 16,
//                     height: 16,
//                     borderRadius: 8,
//                     borderWidth: 2,
//                     borderColor: selectedFoodRelation === relation ? '#EF4444' : '#9CA3AF',
//                     backgroundColor: selectedFoodRelation === relation ? '#EF4444' : 'transparent',
//                     marginRight: 8,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}>
//                     {selectedFoodRelation === relation && (
//                       <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'white' }} />
//                     )}
//                   </View>
//                   <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>{relation}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <View style={{ marginBottom: 16 }}>
//               <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>Special Instructions</Text>
//               <TextInput
//                 style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
//                 placeholder="e.g., Take with water..."
//                 value={form.instructions}
//                 onChangeText={(v) => setForm({...form, instructions: v})}
//                 placeholderTextColor="#9CA3AF"
//                 multiline
//                 numberOfLines={3}
//               />
//             </View>

//             <View>
//               <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>Possible Side Effects</Text>
//               <TextInput
//                 style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
//                 placeholder="e.g., Nausea, dizziness..."
//                 value={form.sideEffects}
//                 onChangeText={(v) => setForm({...form, sideEffects: v})}
//                 placeholderTextColor="#9CA3AF"
//                 multiline
//                 numberOfLines={3}
//               />
//             </View>
//           </View>

//           {/* Stock Management Section */}
//           <View style={[styles.whiteCard, styles.cardShadow]}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
//               <Ionicons name="cube-outline" size={20} color="#EF4444" />
//               <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginLeft: 8 }}>Stock & Refill</Text>
//             </View>

//             <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
//               <View style={{ flex: 1 }}>
//                 <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>Current Stock</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="30"
//                   value={form.currentStock}
//                   onChangeText={(v) => setForm({...form, currentStock: v})}
//                   placeholderTextColor="#9CA3AF"
//                   keyboardType="numeric"
//                 />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={{ fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>Low Stock Alert</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="5"
//                   value={form.lowStockThreshold}
//                   onChangeText={(v) => setForm({...form, lowStockThreshold: v})}
//                   placeholderTextColor="#9CA3AF"
//                   keyboardType="numeric"
//                 />
//               </View>
//             </View>

//             <View style={{ backgroundColor: '#FEE2E2', borderWidth: 2, borderColor: '#FCA5A5', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
//               <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>Refill Reminder</Text>
//               <Switch
//                 value={form.refillReminder}
//                 onValueChange={(v) => setForm({...form, refillReminder: v})}
//                 trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
//                 thumbColor={form.refillReminder ? "#EF4444" : "#F3F4F6"}
//               />
//             </View>

//             <View style={{ backgroundColor: '#FEE2E2', borderWidth: 2, borderColor: '#FCA5A5', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
//               <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>Auto Refill Order</Text>
//               <Switch
//                 value={form.autoRefill}
//                 onValueChange={(v) => setForm({...form, autoRefill: v})}
//                 trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
//                 thumbColor={form.autoRefill ? "#EF4444" : "#F3F4F6"}
//               />
//             </View>
//           </View>

//           {/* Action Buttons */}
//           <View style={{ flexDirection: 'row', gap: 16, marginBottom: 40 }}>
//             <TouchableOpacity
//               onPress={() => { setEntryMode(null); resetForm(); }}
//               style={{ flex: 1, backgroundColor: '#E5E7EB', borderRadius: 16, padding: 18, alignItems: 'center' }}
//               activeOpacity={0.7}
//             >
//               <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#374151' }}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={handleSave}
//               style={{ flex: 1 }}
//               activeOpacity={0.7}
//             >
//               <LinearGradient
//                 colors={['#EF4444', '#DC2626']}
//                 style={{ borderRadius: 16, padding: 18, alignItems: 'center' }}
//               >
//                 <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Save Medicine</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Time Picker Modal */}
//       <Modal
//         visible={showTimePicker}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowTimePicker(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { padding: 24 }]}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
//               <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>Select Time</Text>
//               <TouchableOpacity onPress={() => setShowTimePicker(false)}>
//                 <Ionicons name="close-circle" size={30} color="#EF4444" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={{ maxHeight: 400 }}>
//               {['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'].map((time) => (
//                 <TouchableOpacity
//                   key={time}
//                   onPress={() => {
//                     const newSlots = [...form.timeSlots];
//                     newSlots[currentTimeSlot] = time;
//                     setForm({...form, timeSlots: newSlots});
//                     setShowTimePicker(false);
//                   }}
//                   style={{ padding: 16, backgroundColor: '#FEE2E2', marginBottom: 8, borderRadius: 12 }}
//                 >
//                   <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', textAlign: 'center' }}>{time}</Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* Date Picker Modal */}
//       <Modal
//         visible={showDatePicker}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowDatePicker(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalContent, { padding: 24 }]}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
//               <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>Select Date</Text>
//               <TouchableOpacity onPress={() => setShowDatePicker(false)}>
//                 <Ionicons name="close-circle" size={30} color="#EF4444" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={{ maxHeight: 400 }}>
//               {['07/12/2025', '08/12/2025', '09/12/2025', '10/12/2025', '15/12/2025', '20/12/2025', '01/01/2026'].map((date) => (
//                 <TouchableOpacity
//                   key={date}
//                   onPress={() => {
//                     if (datePickerType === 'start') {
//                       setForm({...form, startDate: date});
//                     } else {
//                       setForm({...form, endDate: date});
//                     }
//                     setShowDatePicker(false);
//                   }}
//                   style={{ padding: 16, backgroundColor: '#FEE2E2', marginBottom: 8, borderRadius: 12 }}
//                 >
//                   <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', textAlign: 'center' }}>{date}</Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//         </View>
//      </View>
//       </Modal>

//       {/* Success Modal */}
//      <Modal
//   visible={showSuccessModal}
//   transparent={true}
//   animationType="fade"
//   onRequestClose={() => setShowSuccessModal(false)}
// >
//   <View style={styles.modalOverlay}>
//     <View style={[styles.modalContent, { padding: 24 }]}>

//       {/* TOP SUCCESS ICON */}
//       <View style={{ alignItems: "center", marginBottom: 20 }}>
//         <View
//           style={{
//             width: 70,
//             height: 70,
//             borderRadius: 35,
//             backgroundColor: "#DCFCE7",
//             alignItems: "center",
//             justifyContent: "center",
//             marginBottom: 12,
//           }}
//         >
//           <Ionicons name="checkmark-circle" size={42} color="#16A34A" />
//         </View>

//         <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 4 }}>
//           Medicine Added!
//         </Text>

//         <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}>
//           Your medicine schedule has been saved successfully
//         </Text>
//       </View>

//       {/* MEDICINE SUMMARY */}
//       <View
//         style={{
//           backgroundColor: "#F9FAFB",
//           borderRadius: 12,
//           padding: 16,
//           marginBottom: 20,
//           borderWidth: 1,
//           borderColor: "#E5E7EB",
//         }}
//       >
//         <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
//           <Text style={{ fontSize: 36, marginRight: 12 }}>
//             {medicineIcons[selectedType] || "💊"}
//           </Text>
//           <View style={{ flex: 1 }}>
//             <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>
//               {form.medicineName}
//             </Text>
//             <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
//               {form.dosage} • {selectedFrequency}
//             </Text>
//           </View>
//         </View>

//         {form.timeSlots.filter(Boolean).length > 0 && (
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Ionicons
//               name="time-outline"
//               size={16}
//               color="#6B7280"
//               style={{ marginRight: 8 }}
//             />
//             <Text style={{ fontSize: 13, color: "#6B7280" }}>
//               {form.timeSlots.filter(Boolean).join(", ")}
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* ACTION BUTTON */}
//       <TouchableOpacity
//         onPress={() => {
//           setShowSuccessModal(false);
//           setEntryMode(null);
//           resetForm();
//         }}
//         activeOpacity={0.7}
//         style={{
//           backgroundColor: "#EF4444",
//           borderRadius: 12,
//           padding: 14,
//           alignItems: "center",
//         }}
//       >
//         <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>
//           Go to My Tracker
//         </Text>
//       </TouchableOpacity>

//     </View>
//   </View>
// </Modal>

//     </KeyboardAvoidingView>

//   );
// };

// export default MedicineTracker;