import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMedicineStore } from "../../../../store/medicineStore";
import { router } from "expo-router";
import axios from "axios";
import { API_URL } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const medicineIcons: Record<string, string> = {
  Tablet: "💊",
  Capsule: "🔴",
  Syrup: "🍯",
  Injection: "💉",
  Drops: "💧",
  Ointment: "🧴",
  Inhaler: "🌬️",
  Other: "🧪",
};

// Use backend enum values exactly
const medicineTypes = ["Tablet", "Capsule", "Syrup", "Injection", "Drops", "Ointment", "Inhaler", "Other"];
const frequencies = ["Once a day", "Twice a day", "Thrice a day",];
const foodRelations = ["Before Food", "After Food", "With Food", "Empty Stomach", "Anytime"];

const ManualScreen: React.FC = () => {
  const currentMedicine = useMedicineStore((s) => s.currentMedicine);
  const setCurrentMedicine = useMedicineStore((s) => s.setCurrentMedicine);
  const addExtractedMedicine = useMedicineStore((s) => s.addExtractedMedicine);

  const [form, setForm] = useState({
    medicineName: "",
    genericName: "",
    dosage: "",
    medicineType: "",
    frequency: "",
    timeslots: ["", ""], // backend key
    startDate: "",
    endDate: "",
    whenToTake: "",
    specialInstructions: "",
    possibleSideEffects: "",
    currentStock: "",
    lowStockAlert: "",
    refillReminder: true,
    automaticRefill: false,
  });

  const [selectedType, setSelectedType] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedFoodRelation, setSelectedFoodRelation] = useState("");

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentTimeSlot, setCurrentTimeSlot] = useState(0);
  const [datePickerType, setDatePickerType] = useState<"start" | "end">("start");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (currentMedicine) {
      setForm({
        medicineName: currentMedicine.medicineName || "",
        genericName: currentMedicine.genericName || "",
        dosage: currentMedicine.dosage || "",
        medicineType: currentMedicine.medicineType || "Tablet",
        frequency: currentMedicine.frequency || "Once a day",
        timeslots:
          Array.isArray((currentMedicine as any).timeslots) && (currentMedicine as any).timeslots.length > 0
            ? (currentMedicine as any).timeslots
            : ["", ""],
        startDate: currentMedicine.startDate || "",
        endDate: currentMedicine.endDate || "",
        whenToTake: currentMedicine.whenToTake || "Anytime",
        specialInstructions: currentMedicine.specialInstructions || "",
        possibleSideEffects: currentMedicine.possibleSideEffects || "",
        currentStock: currentMedicine.currentStock || "",
        lowStockAlert: currentMedicine.lowStockAlert || "",
        refillReminder: currentMedicine.refillReminder ?? true,
        automaticRefill: currentMedicine.automaticRefill ?? false,
      });

      setSelectedType(currentMedicine.medicineType || "Tablet");
      setSelectedFrequency(currentMedicine.frequency || "Once a day");
      setSelectedFoodRelation(currentMedicine.whenToTake || "Anytime");
    } else {
      // if no currentMedicine ensure defaults
      setSelectedType("");
      setSelectedFrequency("");
      setSelectedFoodRelation("");
    }
  }, [currentMedicine]);

  const convertToISO = (dateStr: string) => {
  if (!dateStr) return "";

  // Expecting DD/MM/YYYY
  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;

  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};


  const handleSave = async () => {
    // basic validation
    if (!form.medicineName.trim()) {
      Alert.alert("Validation Error", "Please enter medicine name");
      return;
    }
    if (!form.dosage.trim()) {
      Alert.alert("Validation Error", "Please enter dosage");
      return;
    }
    if (!selectedType) {
      Alert.alert("Validation Error", "Please select medicine type");
      return;
    }
    if (!selectedFrequency) {
      Alert.alert("Validation Error", "Please select frequency");
      return;
    }
    if (!form.startDate) {
      Alert.alert("Validation Error", "Please select start date");
      return;
    }
    if (!selectedFoodRelation) {
      Alert.alert("Validation Error", "Please select when to take");
      return;
    }

    // if custom frequency make sure timeslots filled
    if (selectedFrequency === "custom") {
      if (!Array.isArray(form.timeslots) || form.timeslots.some((t) => !t || !t.trim())) {
        Alert.alert("Validation Error", "Please fill all timeslots for custom frequency");
        return;
      }
    }

    const token = await AsyncStorage.getItem("token");

    const payload = {
      medicineName: form.medicineName,
      genericName: form.genericName,
      dosage: form.dosage,
      medicineType: selectedType,
      frequency: selectedFrequency,
      timeslots: form.timeslots,
      startDate: convertToISO(form.startDate),
      endDate: convertToISO(form.endDate),
      whenToTake: selectedFoodRelation,
      specialInstructions: form.specialInstructions,
      possibleSideEffects: form.possibleSideEffects,
      currentStock: form.currentStock,
      lowStockAlert: form.lowStockAlert,
      refillReminder: form.refillReminder,
      automaticRefill: form.automaticRefill,
    };

    try {
      const response = await axios.post(`${API_URL}/api/medicine/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        console.log("Medicine added successfully");
        // addExtractedMedicine expects ExtractedMedicine-like object; cast payload accordingly
        addExtractedMedicine(payload as any);
      } else {
        console.warn("API responded but success=false", response.data);
        Alert.alert("Error", response.data?.message || "Failed to add medicine");
      }
    } catch (error: any) {
      console.error("ADD MEDICINE ERROR:", error?.response?.data || error.message || error);
      Alert.alert("Error", "Something went wrong while saving medicine");
      return ;
    }

    if (currentMedicine) {
      setCurrentMedicine(null);
    }

    setShowSuccessModal(true);
  };

  const resetForm = () => {
    setForm({
      medicineName: "",
      genericName: "",
      dosage: "",
      medicineType: "",
      frequency: "",
      timeslots: ["", ""],
      startDate: "",
      endDate: "",
      whenToTake: "",
      specialInstructions: "",
      possibleSideEffects: "",
      currentStock: "",
      lowStockAlert: "",
      refillReminder: true,
      automaticRefill: false,
    });
    setSelectedType("");
    setSelectedFrequency("");
    setSelectedFoodRelation("");
    useMedicineStore.getState().setUploadedImage(null);
    useMedicineStore.getState().setPrescriptionUploaded(false);
    useMedicineStore.getState().setExtractedMedicines([]);
  };

  // compute default time slots when frequency is changed
  const applyFrequencySlots = (freq: string) => {
    let slots = 2;
    if (freq === "Once a day") slots = 1;
    else if (freq === "Twice a day") slots = 2;
    else if (freq === "Thrice a day") slots = 3;
    else if (freq === "As needed") slots = 0;
    else if (freq === "custom") slots = 2; // keep 2 by default for custom
    setForm((prev) => ({ ...prev, frequency: freq, timeslots: Array(slots).fill("") }));
    setSelectedFrequency(freq);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#FEF2F2" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
          <TouchableOpacity
            onPress={() => {
              if (currentMedicine) {
                router.push("/(tabs)/medicine/addMedicine/review");
                useMedicineStore.getState().setCurrentMedicine(null);
              } else {
                Alert.alert("Discard Changes", "Are you sure you want to discard?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Discard",
                    onPress: () => {
                      router.push("/(tabs)/medicine/addMedicine");
                      resetForm();
                    },
                  },
                ]);
              }
            }}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
          >
            <Ionicons name="arrow-back" size={24} color="#DC2626" />
            <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "600", color: "#DC2626" }}>{currentMedicine ? "Back to Review" : "Back"}</Text>
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <LinearGradient colors={["#FCA5A5", "#EF4444"]} style={{ width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Ionicons name="document-text-outline" size={32} color="white" />
            </LinearGradient>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: "#111827", marginBottom: 8 }}>{currentMedicine ? "Edit Medicine" : "Manual Entry"}</Text>
            <Text style={{ fontSize: 14, color: "#6B7280" }}>Fill in the required fields below</Text>
          </View>

          {/* Basic section (medicineName, genericName, dosage, type selection) */}
          <View style={{ backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 8 }}>Medicine Name <Text style={{ color: "#EF4444" }}>*</Text></Text>
            <TextInput
              style={{ backgroundColor: "white", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: "#E5E7EB", fontSize: 16, color: "#1F2937" }}
              placeholder="e.g., Paracetamol"
              value={form.medicineName}
              onChangeText={(v) => setForm({ ...form, medicineName: v })}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginTop: 12, marginBottom: 8 }}>Generic Name</Text>
            <TextInput
              style={{ backgroundColor: "white", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: "#E5E7EB", fontSize: 16, color: "#1F2937" }}
              placeholder="e.g., Acetaminophen"
              value={form.genericName}
              onChangeText={(v) => setForm({ ...form, genericName: v })}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginTop: 12, marginBottom: 8 }}>Dosage <Text style={{ color: "#EF4444" }}>*</Text></Text>
            <TextInput
              style={{ backgroundColor: "white", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: "#E5E7EB", fontSize: 16, color: "#1F2937" }}
              placeholder="500mg"
              value={form.dosage}
              onChangeText={(v) => setForm({ ...form, dosage: v })}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginTop: 12, marginBottom: 8 }}>Medicine Type <Text style={{ color: "#EF4444" }}>*</Text></Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {medicineTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => { setSelectedType(type); setForm({ ...form, medicineType: type }); }}
                  style={{
                    width: "23%",
                    padding: 12,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: selectedType === type ? "#EF4444" : "#E5E7EB",
                    backgroundColor: selectedType === type ? "#FEE2E2" : "white",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{medicineIcons[type]}</Text>
                  <Text style={{ fontSize: 10, fontWeight: "600", color: "#374151" }}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Schedule section */}
          <View style={{ backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 8 }}>Frequency <Text style={{ color: "#EF4444" }}>*</Text></Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {frequencies.map((freq) => (
                <TouchableOpacity
                  key={freq}
                  onPress={() => applyFrequencySlots(freq)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: selectedFrequency === freq ? "#EF4444" : "#D1D5DB",
                    backgroundColor: selectedFrequency === freq ? "#FEE2E2" : "#FFFFFF",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: selectedFrequency === freq ? "#DC2626" : "#374151" }}>{freq}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedFrequency && selectedFrequency !== "As needed" && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 8 }}>Time Slots</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {form.timeslots.map((slot, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setCurrentTimeSlot(i);
                        setShowTimePicker(true);
                      }}
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: "#D1D5DB",
                        borderRadius: 10,
                        padding: 12,
                        alignItems: "center",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: slot ? "#111827" : "#9CA3AF" }}>{slot || `Slot ${i + 1}`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 8 }}>Start Date</Text>
                <TouchableOpacity onPress={() => { setDatePickerType("start"); setShowDatePicker(true); }} style={{ borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, padding: 12, backgroundColor: "#FFFFFF" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>{form.startDate || "Select date"}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 8 }}>End Date</Text>
                <TouchableOpacity onPress={() => { setDatePickerType("end"); setShowDatePicker(true); }} style={{ borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, padding: 12, backgroundColor: "#FFFFFF" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>{form.endDate || "Ongoing"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Food & Instructions */}
          <View style={{ backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 8 }}>When to Take</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {foodRelations.map((relation) => (
                <TouchableOpacity
                  key={relation}
                  onPress={() => { setSelectedFoodRelation(relation); setForm({ ...form, whenToTake: relation }); }}
                  style={{
                    width: "48%",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: selectedFoodRelation === relation ? "#EF4444" : "#E5E7EB",
                    backgroundColor: selectedFoodRelation === relation ? "#FEE2E2" : "white",
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <View style={{
                    width: 16, height: 16, borderRadius: 8, borderWidth: 2,
                    borderColor: selectedFoodRelation === relation ? "#EF4444" : "#9CA3AF",
                    backgroundColor: selectedFoodRelation === relation ? "#EF4444" : "transparent",
                    marginRight: 8, alignItems: "center", justifyContent: "center",
                  }}>
                    {selectedFoodRelation === relation && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "white" }} />}
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#374151" }}>{relation}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 8 }}>Special Instructions</Text>
            <TextInput
              style={{ backgroundColor: "white", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: "#E5E7EB", fontSize: 16, color: "#1F2937", minHeight: 80, textAlignVertical: "top" }}
              placeholder="e.g., Take with water..."
              value={form.specialInstructions}
              onChangeText={(v) => setForm({ ...form, specialInstructions: v })}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />

            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginTop: 12, marginBottom: 8 }}>Possible Side Effects</Text>
            <TextInput
              style={{ backgroundColor: "white", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: "#E5E7EB", fontSize: 16, color: "#1F2937", minHeight: 80, textAlignVertical: "top" }}
              placeholder="e.g., Nausea, dizziness..."
              value={form.possibleSideEffects}
              onChangeText={(v) => setForm({ ...form, possibleSideEffects: v })}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Stock & Refill */}
          <View style={{ backgroundColor: "white", borderRadius: 24, padding: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 8 }}>Current Stock</Text>
            <TextInput
              style={{ backgroundColor: "white", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: "#E5E7EB", fontSize: 16, color: "#1F2937" }}
              placeholder="30"
              value={form.currentStock}
              onChangeText={(v) => setForm({ ...form, currentStock: v })}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />

            <Text style={{ fontSize: 12, fontWeight: "600", color: "#4B5563", marginTop: 12, marginBottom: 8 }}>Low Stock Alert</Text>
            <TextInput
              style={{ backgroundColor: "white", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: "#E5E7EB", fontSize: 16, color: "#1F2937" }}
              placeholder="5"
              value={form.lowStockAlert}
              onChangeText={(v) => setForm({ ...form, lowStockAlert: v })}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />

            <View style={{ backgroundColor: "#FEE2E2", borderWidth: 2, borderColor: "#FCA5A5", borderRadius: 16, padding: 16, marginTop: 12, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>Refill Reminder</Text>
              <Switch
                value={form.refillReminder}
                onValueChange={(v) => setForm({ ...form, refillReminder: v })}
                trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
                thumbColor={form.refillReminder ? "#EF4444" : "#F3F4F6"}
              />
            </View>

            <View style={{ backgroundColor: "#FEE2E2", borderWidth: 2, borderColor: "#FCA5A5", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>Auto Refill Order</Text>
              <Switch
                value={form.automaticRefill}
                onValueChange={(v) => setForm({ ...form, automaticRefill: v })}
                trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
                thumbColor={form.automaticRefill ? "#EF4444" : "#F3F4F6"}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 16, marginBottom: 40 }}>
            <TouchableOpacity onPress={() => { resetForm(); router.push("/(tabs)/medicine/addMedicine"); }} style={{ flex: 1, backgroundColor: "#E5E7EB", borderRadius: 16, padding: 18, alignItems: "center" }} activeOpacity={0.7}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#374151" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} style={{ flex: 1 }} activeOpacity={0.7}>
              <LinearGradient colors={["#EF4444", "#DC2626"]} style={{ borderRadius: 16, padding: 18, alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>Save Medicine</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent={true} animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: "90%", backgroundColor: "white", borderRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close-circle" size={30} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"].map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => {
                    const newSlots = [...form.timeslots];
                    newSlots[currentTimeSlot] = time;
                    setForm({ ...form, timeslots: newSlots });
                    setShowTimePicker(false);
                  }}
                  style={{ padding: 16, backgroundColor: "#FEE2E2", marginBottom: 8, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", textAlign: "center" }}>{time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent={true} animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: "90%", backgroundColor: "white", borderRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close-circle" size={30} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {["07/12/2025", "08/12/2025", "09/12/2025", "10/12/2025", "15/12/2025", "20/12/2025", "01/01/2026"].map((date) => (
                <TouchableOpacity
                  key={date}
                  onPress={() => {
                    if (datePickerType === "start") {
                      setForm({ ...form, startDate: date });
                    } else {
                      setForm({ ...form, endDate: date });
                    }
                    setShowDatePicker(false);
                  }}
                  style={{ padding: 16, backgroundColor: "#FEE2E2", marginBottom: 8, borderRadius: 12 }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", textAlign: "center" }}>{date}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent={true} animationType="fade" onRequestClose={() => setShowSuccessModal(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: "90%", backgroundColor: "white", borderRadius: 24, padding: 24 }}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Ionicons name="checkmark-circle" size={42} color="#16A34A" />
              </View>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 4 }}>Medicine Added!</Text>
              <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}>Your medicine schedule has been saved successfully</Text>
            </View>

            <View style={{ backgroundColor: "#F9FAFB", borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#E5E7EB" }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 36, marginRight: 12 }}>{medicineIcons[selectedType] || "💊"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>{form.medicineName}</Text>
                  <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>{form.dosage} • {selectedFrequency}</Text>
                </View>
              </View>

              {form.timeslots.filter(Boolean).length > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 13, color: "#6B7280" }}>{form.timeslots.filter(Boolean).join(", ")}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={() => { setShowSuccessModal(false); router.push("/(tabs)/medicine/addMedicine"); resetForm(); }} style={{ backgroundColor: "#EF4444", borderRadius: 12, padding: 14, alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}>Go to My Tracker</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ManualScreen;
