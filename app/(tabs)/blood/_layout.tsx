import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const RED = "#f5211dff"; // Active red color
const LIGHT_RED = "#fd8490ff"; // Inactive lighter red

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: RED,
        tabBarInactiveTintColor: LIGHT_RED,
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 10,
        },
      }}
    >
     

      {/* ACCEPT TAB */}
      <Tabs.Screen
        name="accept"
        options={{
          tabBarLabel: "Accept",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={26}
              color={color}
              style={{ opacity: focused ? 1 : 0.5 }}
            />
          ),
        }}
      />
       {/* DONATE TAB */}
      <Tabs.Screen
        name="donate"
        options={{
          tabBarLabel: "Donate",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "water" : "water-outline"}
              size={26}
              color={color}
              style={{ opacity: focused ? 1 : 0.5 }} // subtle fade for inactive
            />
          ),
        }}
      />

      {/* DETECTION TAB */}
      <Tabs.Screen
        name="detection"
        options={{
          tabBarLabel: "Detection",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "scan" : "scan-outline"}
              size={26}
              color={color}
              style={{ opacity: focused ? 1 : 0.5 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
