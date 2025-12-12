import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from "@/utils/api";


// TYPE FOR BACKEND MEDICINES
interface Medicine {
  _id: string;

  medicineName: string;
  genericName: string;
  dosage: string;
  medicineType: string;

  frequency: string;
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
}

const HistoryScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [filterMedicine, setFilterMedicine] = useState("All");

  // Edit modal
  const [editVisible, setEditVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [editDosage, setEditDosage] = useState("");
  const [editTimeslot, setEditTimeslot] = useState("");

  // Delete modal
  const [deleteVisible, setDeleteVisible] = useState(false);

  // Calendar helpers
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
    return days;
  };

  const changeMonth = (dir: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + dir);
    setCurrentMonth(newMonth);
  };

  const isPastDate = (dateStr: string) => {
    const today = new Date();
    const d = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isFutureOrToday = (dateStr: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    return dateStr >= todayStr;
  };

  // ------------------------------------------
  // 🔥 FETCH MEDICINES FOR SELECTED DATE
  // ------------------------------------------
  const fetchMedicinesForDate = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.post(
        `${API_URL}/api/medicine/get-medicines-by-date`,
        { date: selectedDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setMedicines(res.data.medicines);
      }
    } catch (error : any) {
      console.log("Fetch error:", error.response.data.message);
      Alert.alert("Error", "Could not fetch medicines for this date.");
    }
  };

  // fetch whenever selectedDate changes
  useEffect(() => {
    fetchMedicinesForDate();
  }, [selectedDate]);

  // FILTERING
  const allNames = ["All", ...new Set(medicines.map((m) => m.medicineName))];
  const filteredMeds =
    filterMedicine === "All"
      ? medicines
      : medicines.filter((m) => m.medicineName === filterMedicine);

  // ------------------------------------------
  // 🔥 UPDATE MEDICINE
  // ------------------------------------------
  const handleUpdate = async () => {
    if (!selectedMedicine) return;

    if (!isFutureOrToday(selectedDate)) {
      Alert.alert("Not allowed", "Cannot edit past medicines.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/medicine/${selectedMedicine._id}`,
        {
          dosage: editDosage,
          timeslots: [editTimeslot],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Updated", "Medicine updated successfully.");
      setEditVisible(false);
      fetchMedicinesForDate();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to update medicine.");
    }
  };

  // ------------------------------------------
  // 🔥 DELETE MEDICINE
  // ------------------------------------------
  const handleDelete = async () => {
    if (!selectedMedicine) return;

    if (!isFutureOrToday(selectedDate)) {
      Alert.alert("Not allowed", "Cannot delete past medicines.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      await axios.delete(`${API_URL}/api/medicine/${selectedMedicine._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Deleted", "Medicine deleted.");
      setDeleteVisible(false);
      fetchMedicinesForDate();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to delete.");
    }
  };

  // ------------------------------------------
  // UI BELOW
  // ------------------------------------------

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 mt-[-40]">
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      
      {/* HEADER */}
      <LinearGradient
        colors={["#7f1d1d", "#dc2626", "#ef4444"]}
        className="px-6 pt-8 pb-7 rounded-b-3xl shadow-2xl"
      >
        <View className="flex-row items-center mb-2">
          <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mr-4">
            <Ionicons name="time-outline" size={26} color="white" />
          </View>
          <View>
            <Text className="text-white text-3xl font-extrabold">History</Text>
            <Text className="text-red-100 text-sm mt-1">
              Medicines for selected date
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CALENDAR CARD */}
        <View className="mx-4 mt-6 bg-white rounded-3xl shadow-xl p-5">
          {/* Month header */}
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={24} color="#DC2626" />
            </TouchableOpacity>

            <Text className="text-gray-900 text-lg font-extrabold">
              {monthNames[currentMonth.getMonth()]}{" "}
              {currentMonth.getFullYear()}
            </Text>

            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={24} color="#DC2626" />
            </TouchableOpacity>
          </View>

          {/* Weekday row */}
          <View className="flex-row mb-3">
            {dayNames.map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-gray-500 text-xs font-bold">{day}</Text>
              </View>
            ))}
          </View>

          {/* Days */}
          <View className="flex-row flex-wrap">
            {generateCalendarDays().map((day, idx) => {
              if (day === null)
                return <View key={idx} className="w-[14.28%] aspect-square" />;

              const dateStr = `${currentMonth.getFullYear()}-${String(
                currentMonth.getMonth() + 1
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              const isSelected = dateStr === selectedDate;
              const isToday =
                dateStr === new Date().toISOString().split("T")[0];

              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDate(dateStr)}
                  className="w-[14.28%] aspect-square p-1"
                >
                  <View
                    className={`flex-1 items-center justify-center rounded-full ${
                      isSelected
                        ? "bg-red-600"
                        : isToday
                        ? "bg-red-100"
                        : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-sm font-extrabold ${
                        isSelected
                          ? "text-white"
                          : isToday
                          ? "text-red-700"
                          : "text-gray-700"
                      }`}
                    >
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* FILTERS */}
        <View className="mx-4 mt-6 bg-white rounded-3xl shadow-xl p-5">
          <Text className="text-gray-900 text-lg font-extrabold mb-4">
            Filters
          </Text>

          {/* Medicine name filter */}
          <Text className="text-gray-700 font-semibold text-sm mb-2">
            Filter by Medicine
          </Text>
          <View className="flex-row flex-wrap">
            {allNames.map((name) => {
              const active = filterMedicine === name;
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => setFilterMedicine(name)}
                  className={`px-5 py-3 rounded-2xl mr-3 mb-3 ${
                    active ? "bg-red-600" : "bg-gray-100 border border-gray-300"
                  }`}
                >
                  <Text
                    className={`font-extrabold text-sm ${
                      active ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* MEDICINES FOR THE DAY */}
        <View className="mx-4 mt-6">
          <Text className="text-gray-900 text-lg font-extrabold mb-4">
            Medicines for {selectedDate}
          </Text>

          {filteredMeds.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 items-center shadow-md">
              <Ionicons
                name="document-text-outline"
                size={40}
                color="#D1D5DB"
              />
              <Text className="text-gray-400 mt-2 font-semibold">
                No medicines for this date
              </Text>
            </View>
          ) : (
            filteredMeds.map((m) => (
              <View
                key={m._id}
                className="bg-white rounded-3xl p-5 mb-4 shadow-md"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-gray-900 text-xl font-extrabold">
                      {m.medicineName}
                    </Text>
                    <Text className="text-gray-600 text-sm font-semibold mt-1">
                      {m.dosage}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {m.frequency}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {m.timeslots.join(", ")}
                    </Text>
                  </View>

                  {/* Edit + Delete */}
                  {isFutureOrToday(selectedDate) && (
                    <View className="flex-row">
                      <TouchableOpacity
                        className="p-2 bg-blue-500 rounded-full mr-2"
                        onPress={() => {
                          setSelectedMedicine(m);
                          setEditDosage(m.dosage);
                          setEditTimeslot(m.timeslots[0] || "");
                          setEditVisible(true);
                        }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={18}
                          color="white"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="p-2 bg-red-600 rounded-full"
                        onPress={() => {
                          setSelectedMedicine(m);
                          setDeleteVisible(true);
                        }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
        <View className="py-12">
            
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center p-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold mb-4">Edit Medicine</Text>

            <Text className="font-semibold mb-2">Dosage</Text>
            <TextInput
              value={editDosage}
              onChangeText={setEditDosage}
              className="bg-gray-100 p-3 rounded-xl mb-4"
            />

            <Text className="font-semibold mb-2">Timeslot</Text>
            <TextInput
              value={editTimeslot}
              onChangeText={setEditTimeslot}
              className="bg-gray-100 p-3 rounded-xl mb-6"
            />

            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setEditVisible(false)}
                className="bg-gray-200 px-4 py-2 rounded-xl mr-2"
              >
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdate}
                className="bg-blue-600 px-4 py-2 rounded-xl"
              >
                <Text className="font-bold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        visible={deleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center p-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold mb-4">Delete Medicine?</Text>

            <Text className="text-gray-700 mb-6">
              Are you sure you want to remove this medicine from schedule?
            </Text>

            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setDeleteVisible(false)}
                className="bg-gray-200 px-4 py-2 rounded-xl mr-2"
              >
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                className="bg-red-600 px-4 py-2 rounded-xl"
              >
                <Text className="font-bold text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HistoryScreen;
