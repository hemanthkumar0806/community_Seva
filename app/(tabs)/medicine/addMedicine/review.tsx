import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMedicineStore } from "../../../../store/medicineStore";
import { router } from "expo-router";

const medicineIcons: Record<string, string> = {
  Tablet: "💊",
  Capsule: "🔴",
  Syrup: "🍯",
  Injection: "💉",
  Drops: "💧",
  Cream: "🧴",
  Inhaler: "🌬️",
  Other: "🧪",
};

const ReviewScreen: React.FC = () => {
  const extractedMedicines = useMedicineStore((s) => s.extractedMedicines);
  const uploadedImage = useMedicineStore((s) => s.uploadedImage);
  const removeById = useMedicineStore((s) => s.removeExtractedMedicineById);
  const setCurrentMedicine = useMedicineStore((s) => s.setCurrentMedicine);
  const setPrescriptionUploaded = useMedicineStore((s) => s.setPrescriptionUploaded);

  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [scaleAnim] = useState(new Animated.Value(0));

  const openConfirmModal = (medicine: any) => {
    setSelectedMedicine(medicine);
    setConfirmModal(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const closeConfirmModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setConfirmModal(false);
      setSelectedMedicine(null);
    });
  };

  const handleConfirmMedicine = () => {
    if (selectedMedicine) {
      console.log("Confirmed and scheduling:", selectedMedicine.medicineName);
      setCurrentMedicine(selectedMedicine);
      removeById(selectedMedicine.id);
      
      if (extractedMedicines.length === 1) {
        setPrescriptionUploaded(false);
      }
      router.push("/(tabs)/medicine/addMedicine/manual")
      closeConfirmModal();
    }
  };

  const renderMedicineCard = (medicine: any) => (
    <View
      key={medicine.id}
      style={{
        backgroundColor: "white",
        borderRadius: 24,
        padding: 0,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <View style={{ padding: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24, paddingBottom: 24, borderBottomWidth: 2, borderBottomColor: "#F3F4F6" }}>
          <Text style={{ fontSize: 48, marginRight: 16 }}>{medicineIcons[medicine.medicineType] || "💊"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>{medicine.medicineName || "Medicine Name"}</Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#EF4444", marginTop: 4 }}>{medicine.genericName || `${medicine.dosage} - ${medicine.medicineType}`}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 24, gap: 12 }}>
          <View style={{ width: "47%", backgroundColor: "#FEE2E2", borderRadius: 16, padding: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: "#6B7280", marginBottom: 4 }}>DOSAGE</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>{medicine.dosage || "N/A"}</Text>
          </View>

          <View style={{ width: "47%", backgroundColor: "#FFE4E6", borderRadius: 16, padding: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: "#6B7280", marginBottom: 4 }}>FREQUENCY</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>{medicine.frequency || "N/A"}</Text>
          </View>

          <View style={{ width: "100%", backgroundColor: "#FFEDD5", borderRadius: 16, padding: 16 }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: "#6B7280", marginBottom: 4 }}>SCHEDULE</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>{(medicine.timeSlots || []).join(", ") || "Anytime"}</Text>
          </View>
        </View>

        {medicine.instructions && (
          <View style={{ backgroundColor: "#DBEAFE", borderLeftWidth: 4, borderLeftColor: "#3B82F6", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginRight: 12, marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "bold", color: "#111827", marginBottom: 4 }}>Instructions</Text>
                <Text style={{ fontSize: 13, color: "#4B5563" }}>{medicine.instructions}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity onPress={() => openConfirmModal(medicine)} style={{ flex: 1 }} activeOpacity={0.7}>
            <LinearGradient colors={["#EF4444", "#DC2626"]} style={{ borderRadius: 16, padding: 16, alignItems: "center" }}>
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={{ fontSize: 13, fontWeight: "bold", color: "white", marginTop: 8 }}>Add to Tracker</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FEF2F2" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
          <TouchableOpacity
            onPress={() => {
              useMedicineStore.getState().setPrescriptionUploaded(false);
              router.push("/(tabs)/medicine/addMedicine/upload");
            }}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
          >
            <Ionicons name="arrow-back" size={24} color="#DC2626" />
            <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "600", color: "#DC2626" }}>Back to Upload</Text>
          </TouchableOpacity>

          <LinearGradient colors={["#34D399", "#10B981"]} style={{ borderRadius: 20, padding: 20, marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 48, height: 48, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 24, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                <Ionicons name="sparkles" size={28} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 4 }}>AI Analysis Complete!</Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.9)" }}>Review and add the {extractedMedicines.length} medicine(s) below.</Text>
              </View>
            </View>
          </LinearGradient>

          {uploadedImage && (
            <View style={{ marginBottom: 24, borderRadius: 20, overflow: "hidden" }}>
              <Image source={{ uri: uploadedImage }} style={{ width: "100%", height: 180 }} resizeMode="cover" />
            </View>
          )}

          {extractedMedicines.map(renderMedicineCard)}

          {extractedMedicines.length === 0 && (
            <View style={{ backgroundColor: "white", borderRadius: 24, padding: 32, alignItems: "center" }}>
              <Ionicons name="checkmark-circle-outline" size={40} color="#10B981" style={{ marginBottom: 16 }} />
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 8 }}>All Medicines Confirmed</Text>
              <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}>All medicines from this prescription have been successfully added to your tracker.</Text>
              <TouchableOpacity onPress={() => { useMedicineStore.getState().setPrescriptionUploaded(false); router.push("/(tabs)/medicine/addMedicine"); }} style={{ marginTop: 20, width: "100%", backgroundColor: "#10B981", borderRadius: 16, padding: 16, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModal}
        transparent
        animationType="fade"
        onRequestClose={closeConfirmModal}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              backgroundColor: "white",
              borderRadius: 28,
              width: "100%",
              maxWidth: 400,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {/* Header with Gradient */}
            <LinearGradient colors={["#4c2222ff", "#DC2626"]} style={{ paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24, alignItems: "center" }}>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "white", textAlign: "center" }}>Confirm Addition</Text>
            </LinearGradient>

            {/* Content */}
            <View style={{ padding: 24 }}>
              <View style={{ backgroundColor: "#FEF2F2", borderRadius: 16, padding: 20, marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111827", marginBottom: 8, textAlign: "center" }}>
                  {selectedMedicine?.medicineName || "Medicine"}
                </Text>
                <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 12 }}>
                  {selectedMedicine?.dosage} • {selectedMedicine?.frequency}
                </Text>
                {selectedMedicine?.timeSlots && selectedMedicine.timeSlots.length > 0 && (
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
                    <Ionicons name="time-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, color: "#EF4444", fontWeight: "600" }}>
                      {selectedMedicine.timeSlots.join(", ")}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={{ fontSize: 15, color: "#4B5563", textAlign: "center", marginBottom: 24, lineHeight: 22 }}>
                Are you sure you want to add this medicine to your tracker? You'll receive reminders based on the schedule.
              </Text>

              {/* Action Buttons */}
              <View style={{ gap: 12 }}>
                <TouchableOpacity onPress={handleConfirmMedicine} activeOpacity={0.8}>
                  <LinearGradient colors={["#10B981", "#059669"]} style={{ borderRadius: 16, padding: 18, alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
                    <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>Yes, Add to Tracker</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={closeConfirmModal} activeOpacity={0.8} style={{ backgroundColor: "#F3F4F6", borderRadius: 16, padding: 18, alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#6B7280" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default ReviewScreen;