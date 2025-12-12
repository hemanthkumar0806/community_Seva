import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from '@/utils/api';


interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  pillCount: number;
  instructions: string;
  timeInMinutes: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // -------------------------
  // Convert "9:00 AM" → minutes
  // -------------------------
  const convertTimeToMinutes = (time: string) => {
    const [t, modifier] = time.split(" ");
    let [hours, minutes] = t.split(":").map(Number);

    if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  

  // -------------------------
  // Fetch Today's Medicines
  // -------------------------
  
  const fetchTodayMedicines = async () => {
    try {
      
      const token = await AsyncStorage.getItem("token");
      const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
      
      const res = await axios.post(
        `${API_URL}/api/medicine/get-medicines-by-date`,
        { date: today },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (res.data.success) {
        console.log(res.data.medicines)
        
        // Convert backend medicines into your UI structure
        const formatted = res.data.medicines.flatMap((med: any) => {
            // If no timeslots, still create a placeholder entry
            if (!med.timeslots || med.timeslots.length === 0) {
              return [{
                id: med._id,
                name: med.medicineName,
                dosage: med.dosage,
                instructions: med.whenToTake,
                taken: false,
                pillCount: Number(med.currentStock) || 0,
                time: "Anytime",
                timeInMinutes: 0,
              }];
            }

            // If timeslots exist
            return med.timeslots.map((time: string) => ({
              id: med._id,
              name: med.medicineName,
              dosage: med.dosage,
              instructions: med.whenToTake,
              taken: false,
              pillCount: Number(med.currentStock) || 0,
              time,
              timeInMinutes: convertTimeToMinutes(time),
            }));
          });

        console.log(formatted)

        setMedicines(formatted);
      }
    } catch (err) {
      console.log("ERROR FETCHING TODAY MEDICINES:", err);
    }
  };

  // -------------------------
  // On Screen Load
  // -------------------------
  useEffect(() => {
    fetchTodayMedicines();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentTimeInMinutes = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return hours * 60 + minutes;
  };

  const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[currentTime.getDay()]}, ${months[currentTime.getMonth()]} ${currentTime.getDate()}`;
  };

  const upcomingReminders = [
    { time: '12:00 PM', medicine: 'Metformin', dosage: '850mg' },
    { time: '8:00 PM', medicine: 'Omega-3', dosage: '1000mg' },
    { time: '10:00 PM', medicine: 'Ginseng', dosage: '200mg' },
  ];

  const quickQuestions = [
    { icon: 'warning', text: 'Side effects' },
    { icon: 'restaurant', text: 'Food interactions' },
    { icon: 'time', text: 'Dosage timing' },
    { icon: 'thermometer', text: 'Storage tips' },
  ];

  // ✅ Check if a medicine time slot is editable (current time >= medicine time)
  const isEditable = (timeInMinutes: number) => {
    return getCurrentTimeInMinutes() >= timeInMinutes;
  };

  const handleTake = (id: string, timeInMinutes: number) => {
    // ✅ Only allow editing if time has arrived
    if (!isEditable(timeInMinutes)) {
      return;
    }
    
    setMedicines(
      medicines.map((med) =>
        med.id === id && med.timeInMinutes === timeInMinutes
          ? { ...med, taken: true }
          : med
      )
    );
  };

  const handleSkip = (id: string, timeInMinutes: number) => {
    // ✅ Only allow editing if time has arrived
    if (!isEditable(timeInMinutes)) {
      return;
    }
    
    setMedicines(
      medicines.map((med) =>
        med.id === id && med.timeInMinutes === timeInMinutes
          ? { ...med, taken: false }
          : med
      )
    );
  };

  // Group by time
  const groupedMedicines = medicines.reduce((acc, med) => {
    if (!acc[med.time]) {
      acc[med.time] = [];
    }
    acc[med.time].push(med);
    return acc;
  }, {} as Record<string, Medicine[]>);

  const sortedTimes = Object.keys(groupedMedicines).sort((a, b) => {
    const timeA = groupedMedicines[a][0].timeInMinutes;
    const timeB = groupedMedicines[b][0].timeInMinutes;
    return timeA - timeB;
  });

  const isTimePassed = (timeInMinutes: number) => {
    return getCurrentTimeInMinutes() >= timeInMinutes;
  };

  const getCurrentTimeSection = () => {
    const currentMinutes = getCurrentTimeInMinutes();
    for (let i = 0; i < sortedTimes.length; i++) {
      const timeInMinutes = groupedMedicines[sortedTimes[i]][0].timeInMinutes;
      const nextTimeInMinutes = i < sortedTimes.length - 1
        ? groupedMedicines[sortedTimes[i + 1]][0].timeInMinutes
        : 24 * 60;

      if (currentMinutes >= timeInMinutes && currentMinutes < nextTimeInMinutes) {
        return i;
      }
    }
    return -1;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-gray-900">Welcome</Text>
          <Text className="text-sm text-gray-500 mt-2">{formatDate()}</Text>
        </View>

        <View className="mx-6 mb-6">
          <LinearGradient
            colors={["#ef4444", "#dc2626", "#b91c1c"]}  // 🔥 Red gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-5 shadow-2xl relative overflow-hidden"
          >
            {/* Decorative Glow Circles */}
            <View className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10" />
            <View className="absolute -left-10 -bottom-10 w-28 h-28 rounded-full bg-white/10" />

            {/* Header */}
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-2xl bg-white/25 items-center justify-center mr-3">
                <Ionicons name="bulb" size={26} color="white" />
              </View>

              <View className="flex-1">
                <Text className="text-white font-extrabold text-xl">
                  Health Tip
                </Text>
                <Text className="text-white/80 text-xs">
                  Stay consistent with your routine
                </Text>
              </View>
            </View>

            {/* Tip Text */}
            <Text className="text-white/95 text-base leading-6 font-medium">
              Remember to take{" "}
              <Text className="font-bold text-white">Metformin (850mg)</Text> with your
              meal at{" "}
              <Text className="font-bold text-white">12:00 PM</Text> for best absorption
              and to reduce stomach upset.
            </Text>

            {/* Bottom Highlight */}
            <View className="mt-4 flex-row justify-between items-center">
              <Text className="text-white/80 text-xs">
                Suggested by AI Assistant
              </Text>

              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">
                  Daily Tip
                </Text>
              </View>
            </View>
          </LinearGradient> 
      </View>


        {/* Today's Schedule */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 px-6 mb-6">
            Today's Schedule
          </Text>

          <View className="relative">
            {sortedTimes.map((time, timeIndex) => {
              const meds = groupedMedicines[time];
              const totalPills = meds.length;
              const timeInMinutes = meds[0].timeInMinutes;
              const passed = isTimePassed(timeInMinutes);
              const currentSection = getCurrentTimeSection();
              const isCurrentSection = currentSection === timeIndex;
              const canEdit = isEditable(timeInMinutes); // ✅ Check if this time slot is editable

              return (
                <View key={time} className="relative px-6 mb-8">
                  {/* Timeline Container */}
                  <View className="absolute left-12 top-14 w-1 bg-gray-200 rounded-full" 
                    style={{ height: meds.length * 110 + 20 }} 
                  />
                  
                  {/* Red Progress Line */}
                  {passed && (
                    <View 
                      className="absolute left-12 top-14 w-1 rounded-full z-10"
                      style={{ 
                        height: isCurrentSection 
                          ? ((getCurrentTimeInMinutes() - timeInMinutes) / 60) * 30
                          : meds.length * 110 + 20,
                        backgroundColor: '#E63946'
                      }} 
                    />
                  )}
                  
                  {/* Time Header */}
                  <View className="flex-row items-center mb-4">
                    <View className={`w-14 h-14 rounded-2xl ${
                      passed ? 'bg-[#E63946]' : 'bg-white border-2 border-gray-300'
                    } items-center justify-center shadow-lg z-20`}>
                      <Ionicons 
                        name={passed ? "time" : "time-outline"} 
                        size={24} 
                        color={passed ? "#fff" : "#6b7280"} 
                      />
                    </View>
                    
                    <View className="ml-4 flex-1">
                      <Text className={`text-xl font-bold ${passed ? 'text-[#E63946]' : 'text-gray-900'}`}>
                        {time}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {totalPills} {totalPills === 1 ? 'pill' : 'pills'}
                      </Text>
                    </View>

                    {isCurrentSection && (
                      <View className="bg-[#E63946] px-3 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-bold">NOW</Text>
                      </View>
                    )}
                    
                    {/* ✅ Show LOCKED badge for future time slots */}
                    {!canEdit && (
                      <View className="bg-gray-300 px-3 py-1.5 rounded-full flex-row items-center">
                        <Ionicons name="lock-closed" size={12} color="#6b7280" />
                        <Text className="text-gray-600 text-xs font-bold ml-1">LOCKED</Text>
                      </View>
                    )}
                  </View>

                  {/* Medicines List */}
                  <View className="ml-20 space-y-3">
                    {meds.map((medicine) => (
                      <View
                        key={`${medicine.id}-${medicine.timeInMinutes}`}
                        className={`bg-white rounded-2xl p-4 shadow-md border-2 ${
                          medicine.taken ? 'border-green-300' : 
                          !canEdit ? 'border-gray-200' : 'border-gray-100'
                        } ${!canEdit ? 'opacity-60' : ''}`}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <View
                              className={`w-12 h-12 rounded-xl ${
                                medicine.taken ? 'bg-green-500' : 
                                !canEdit ? 'bg-gray-400' : 'bg-[#E63946]'
                              } items-center justify-center shadow-lg`}
                            >
                              <Ionicons
                                name={!canEdit ? "lock-closed" : "medical"}
                                size={24}
                                color="#fff"
                              />
                            </View>
                            
                            <View className="ml-3 flex-1">
                              <Text className="text-base font-bold text-gray-900 mb-0.5">
                                {medicine.name}
                              </Text>
                              <Text className="text-xs text-gray-600">
                                {medicine.dosage}
                              </Text>
                              <Text className="text-xs text-gray-500 mt-0.5">
                                {medicine.instructions}
                              </Text>
                            </View>
                          </View>

                          {/* Action Icons - ✅ Only show if editable */}
                          <View className="flex-row items-center ml-2">
                            {canEdit ? (
                              medicine.taken ? (
                                <>
                                  <View className="w-9 h-9 rounded-xl bg-green-100 items-center justify-center mr-2">
                                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                  </View>
                                  <TouchableOpacity
                                    onPress={() => handleSkip(medicine.id, medicine.timeInMinutes)}
                                    className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center"
                                  >
                                    <Ionicons name="close" size={20} color="#6b7280" />
                                  </TouchableOpacity>
                                </>
                              ) : (
                                <>
                                  <TouchableOpacity
                                    onPress={() => handleTake(medicine.id, medicine.timeInMinutes)}
                                    className="w-9 h-9 rounded-xl bg-green-500 items-center justify-center mr-2 shadow-md"
                                  >
                                    <Ionicons name="checkmark" size={22} color="#fff" />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => handleSkip(medicine.id, medicine.timeInMinutes)}
                                    className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center"
                                  >
                                    <Ionicons name="close" size={20} color="#6b7280" />
                                  </TouchableOpacity>
                                </>
                              )
                            ) : (
                              // ✅ Show locked icon for future pills
                              <View className="w-9 h-9 rounded-xl bg-gray-200 items-center justify-center">
                                <Ionicons name="lock-closed" size={18} color="#9ca3af" />
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        
        {/* AI Assistant Card */}
<View className="mx-6 mb-6 rounded-3xl overflow-hidden shadow-2xl">
  <LinearGradient
    colors={["#0f172a", "#1e1b4b", "#312e81"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    className="p-6 relative"
  >
    {/* Glow Effects */}
    <View className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-blue-400/10" />
    <View className="absolute -left-12 -bottom-12 w-36 h-36 rounded-full bg-indigo-400/10" />

    {/* ===== HEADER ===== */}
    <View className="flex-row items-center mb-5">
      <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mr-4">
        <Ionicons name="sparkles" size={30} color="white" />
      </View>

      <View className="flex-1">
        <Text className="text-white font-extrabold text-2xl">
          Medi-AI Assistant
        </Text>
        <Text className="text-blue-200 text-xs mt-1">
          Your personal medicine guide
        </Text>
      </View>

      {/* ✅ ONLY THIS BUTTON NAVIGATES */}
      <TouchableOpacity
        onPress={() => router.push('/medicine/ai')}
        activeOpacity={0.7}
        className="ml-2"
      >
        <Ionicons name="arrow-forward-circle" size={34} color="white" />
      </TouchableOpacity>
    </View>

    {/* ===== AI TIP BOX ===== */}
    <View className="bg-white/15 rounded-2xl p-4 mb-5 border border-white/20">
      <View className="flex-row items-start">
        <View className="w-9 h-9 rounded-xl bg-white/20 items-center justify-center mr-3">
          <Ionicons name="bulb" size={20} color="white" />
        </View>

        <View className="flex-1">
          <Text className="text-white/80 text-[11px] font-bold mb-1 tracking-wider">
            TODAY'S AI TIP
          </Text>
          <Text className="text-white text-sm leading-5 font-medium">
            Avoid coffee with iron tablets. It reduces absorption by up to 60%.
          </Text>
        </View>
      </View>
    </View>

    {/* ===== QUICK ACTIONS ===== */}
    <View className="flex-row flex-wrap -mx-1">
      {quickQuestions.map((question, index) => (
        <View key={index} className="w-1/2 px-1 mb-2">
          <View className="bg-white/15 rounded-xl p-3 border border-white/20">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-white/20 items-center justify-center mr-2">
                <Ionicons name={question.icon as any} size={15} color="white" />
              </View>
              <Text
                className="text-white text-xs font-semibold flex-1"
                numberOfLines={1}
              >
                {question.text}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  </LinearGradient>
</View>


        {/* Next Doses */}
{/* ✅ OUTER CLIP WRAPPER (THIS IS THE KEY FIX) */}
<View className="mx-4 mb-20 rounded-3xl overflow-hidden shadow-2xl">

  {/* ✅ ACTUAL RED BACKGROUND GOES HERE */}
  <View className="bg-red-50 rounded-3xl">

    {/* Section Header */}
    <View className="flex-row items-center justify-between px-5 pt-5 mb-4">
      <Text className="text-xl font-extrabold text-gray-900">
        Next Doses
      </Text>

      <View className="bg-red-200 px-3 py-1 rounded-full">
        <Text className="text-red-800 text-xs font-bold">
          Next Day
        </Text>
      </View>
    </View>

    {/* Horizontal Scroll */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-5 pb-5"
    >
      {upcomingReminders.map((reminder, index) => (
        <LinearGradient
          key={index}
          colors={["#7f1d1d", "#dc2626", "#f87171"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mr-4 border border-transparent rounded-3xl p-[2px] overflow-hidden"
        >
          {/* ✅ INNER CARD (ALREADY ROUNDED) */}
          <View className="bg-white/15 rounded-3xl p-4 w-44 ">
            
            {/* Time Row */}
            <View className="flex-row items-center mb-3">
              <View className="w-9 h-9 rounded-xl bg-white/25 items-center justify-center mr-2">
                <Ionicons name="medical" size={18} color="white" />
              </View>

              <View>
                <Text className="text-white font-extrabold text-sm">
                  {reminder.time}
                </Text>
                <Text className="text-white/70 text-[10px]">
                  Next Dose
                </Text>
              </View>
            </View>

            <Text className="text-white text-base font-bold mb-1" numberOfLines={1}>
              {reminder.medicine}
            </Text>

            <Text className="text-white/80 text-xs mb-3">
              {reminder.dosage}
            </Text>

            <View className="flex-row justify-between items-center">
              <View className="bg-red-500/30 px-3 py-1 rounded-full">
                <Text className="text-red-200 text-[10px] font-bold">
                  PENDING
                </Text>
              </View>

              <Ionicons name="ellipse" size={16} color="white" />
            </View>
          </View>
        </LinearGradient>
      ))}
    </ScrollView>

  </View>
</View>

        <View className="h-8" />
      

      </ScrollView>
    </SafeAreaView>
  );
}