import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const IndexScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="px-5 pt-16">
          {/* HEADER */}
          <View className="items-center mb-10">
            <LinearGradient
              colors={["#FECACA", "#EF4444", "#B91C1C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-24 h-24 rounded-2xl items-center justify-center shadow-2xl"
            >
              <Ionicons name="medical" size={40} color="white" />

            </LinearGradient>

            <Text className="text-4xl font-extrabold text-gray-900 mt-4">MyMeds Tracker</Text>
            <Text className="text-sm text-gray-500 text-center mt-2 px-6 leading-5">
              Choose how you'd like to add your medicine and stay consistent with your treatment.
            </Text>
          </View>

          {/* AI PRESCRIPTION CARD */}
          <TouchableOpacity onPress={() => router.push("/(tabs)/medicine/addMedicine/upload")} activeOpacity={0.92} className="mb-5">
            <LinearGradient
              colors={["#EF4444", "#DC2626", "#991B1C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl p-5 overflow-hidden shadow-2xl"
            >
              <View className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-white/10" />
              <View className="flex-row">
                <View className="w-16 h-16 bg-white/20 rounded-xl items-center justify-center mr-4">
                  <MaterialCommunityIcons name="brain" size={30} color="white" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-lg font-extrabold text-white mr-3">AI Prescription Scan</Text>
                    <View className="bg-amber-400 px-3 py-1 rounded-full">
                      <Text className="text-xs font-bold text-gray-900">SMART</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-white/90 mb-3">Upload a photo to auto-extract all details instantly</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* MANUAL ENTRY CARD */}
          <TouchableOpacity onPress={() => router.push("/(tabs)/medicine/addMedicine/manual")} activeOpacity={0.92}>
            <View className="bg-white rounded-3xl p-5 shadow-md border-t-4 border-red-600">
              <View className="flex-row">
                <View className="w-16 h-16 bg-red-50 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="pencil" size={28} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-extrabold text-gray-900 mb-1">Manual Entry</Text>
                  <Text className="text-sm text-gray-500 mb-3">Fill in all medicine details step-by-step</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default IndexScreen;
