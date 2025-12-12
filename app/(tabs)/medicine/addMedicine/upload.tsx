import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useMedicineStore } from "../../../../store/medicineStore";

import { extractPrescription, mockExtractPrescription } from "@/utils/aiExtractor";

/* -------------------------------------------------------------------------- */
/*                             UPLOAD SCREEN                                  */
/* -------------------------------------------------------------------------- */

const UploadScreen = () => {
  const setExtractedMedicines = useMedicineStore((s) => s.setExtractedMedicines);
  const setUploadedImage = useMedicineStore((s) => s.setUploadedImage);
  const setPrescriptionUploaded = useMedicineStore((s) => s.setPrescriptionUploaded);

  const [isUploading, setIsUploading] = useState(false);

  /* ------------------------ PICK IMAGE HANDLER ------------------------ */
  const handlePick = async (mode: "camera" | "gallery" | "file") => {
    if (isUploading) return;

    try {
      setIsUploading(true);

      let base64 = "";
      let uri = "";

      // ---------------- PDF Upload ----------------
      if (mode === "file") {
        const doc = await DocumentPicker.getDocumentAsync({
          type: ["image/*", "application/pdf"],
        });

        if (doc.canceled) return;

        uri = doc.assets?.[0]?.uri || "";
        setUploadedImage(uri);

        const extracted = await mockExtractPrescription(); // PDF AI not supported
        setExtractedMedicines(extracted.medicines);
        setPrescriptionUploaded(true);

        router.push("/(tabs)/medicine/addMedicine/review");
        return;
      }

      // ---------------- Permissions ----------------
      const perm =
        mode === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!perm.granted) {
        Alert.alert("Permission required", "Please enable permissions to continue.");
        return;
      }

      // ---------------- Image Picker ----------------
      const picker =
        mode === "camera"
          ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });

      if (picker.canceled) return;

      uri = picker.assets[0].uri;
      base64 = picker.assets[0].base64 || "";

      setUploadedImage(uri);

      // ---------------- AI Extraction ----------------
      const extracted = await extractPrescription(base64);

      if (extracted.medicines.length === 0) {
        Alert.alert("No medicines detected", "Try again or enter manually.");
        return;
      }

      // ---------------- STORE + NAVIGATE ----------------
      setExtractedMedicines(extracted.medicines);
      setPrescriptionUploaded(true);

      router.push("/(tabs)/medicine/addMedicine/review");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setIsUploading(false);
    }
  };

  /* -------------------------------------------------------------------------- */

  return (
    <View className="flex-1 bg-rose-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#7F1D1D", "#EF4444", "#FCA5A5"]}
          className="h-[300px] rounded-b-[40px] px-6 pt-10"
        >
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/medicine/addMedicine")}
            className="w-11 h-11 bg-white/25 rounded-xl items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>

          <View className="mt-8 items-center">
            <View className="w-24 h-24 bg-white rounded-[26px] items-center justify-center shadow-xl mb-5">
              {isUploading ? (
                <ActivityIndicator size="large" color="#EF4444" />
              ) : (
                <MaterialCommunityIcons
                  name="file-document-plus"
                  size={42}
                  color="#EF4444"
                />
              )}
            </View>

            <Text className="text-white text-2xl font-extrabold mb-1">
              {isUploading ? "Analyzing..." : "Upload Prescription"}
            </Text>
            <Text className="text-rose-100 text-sm text-center">
              {isUploading ? "AI is reading your medicines..." : "Upload via camera, gallery or PDF"}
            </Text>
          </View>
        </LinearGradient>

        <View className="px-5 -mt-10">
          {/* Buttons */}
          {[
            { type: "camera", title: "Scan with Camera", icon: "camera" },
            { type: "gallery", title: "Select from Gallery", icon: "images" },
            { type: "file", title: "Upload PDF", icon: "document-text" },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              disabled={isUploading}
              onPress={() => handlePick(item.type as any)}
              className={`bg-white rounded-2xl px-4 py-5 flex-row items-center mb-5 shadow-xl ${
                isUploading ? "opacity-50" : ""
              }`}
            >
              <LinearGradient
                colors={["#FFF1F2", "#FFE4E6"]}
                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
              >
                <Ionicons name={item.icon as any} size={26} color="#DC2626" />
              </LinearGradient>

              <View className="flex-1">
                <Text className="text-[17px] font-bold text-rose-900 mb-1">
                  {item.title}
                </Text>
                <Text className="text-[13px] text-rose-700">
                  {item.type === "file"
                    ? "Upload a PDF file"
                    : item.type === "camera"
                    ? "Instant scan from camera"
                    : "Pick a saved image"}
                </Text>
              </View>

              <LinearGradient
                colors={["#DC2626", "#F43F5E"]}
                className="w-11 h-11 rounded-xl items-center justify-center"
              >
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default UploadScreen;
