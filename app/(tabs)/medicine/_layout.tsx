import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function MedicineLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,

        // ✅ ACTIVE & INACTIVE TEXT COLOR
        tabBarActiveTintColor: "#ff2f6a",
        tabBarInactiveTintColor: "#777",

        tabBarStyle: styles.tabBar,

        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name="home-outline"
              size={27}
              color={color}
            />
          ),
        }}
      />

      {/* AI */}
      <Tabs.Screen
        name="ai"
        options={{
          tabBarLabel: "AI",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name="sparkles-outline"
              size={27}
              color={color}
            />
          ),
        }}
      />

      {/* ADD MEDICINE - FLOATING BUTTON (NO LABEL COLOR CHANGE NEEDED) */}
      <Tabs.Screen
        name="addMedicine"
        options={{
          tabBarLabel: "",
          tabBarIcon: () => (
            <View style={styles.floatingButton}>
              <Ionicons name="add" size={30} color="#fff" />
            </View>
          ),
        }}
      />

      {/* HISTORY */}
      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name="time-outline"
              size={27}
              color={color}
            />
          ),
        }}
      />

      
    <Tabs.Screen
  name="pharmacy"
  options={{
    tabBarLabel: "Pharmacy Finder",
    tabBarIcon: ({focused, color }) => (
      <Ionicons
        name="location-outline"   // you can also use "location-outline" if needed
        size={27}
        color={color}
      />
    ),
  }}
/>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffff",

    elevation: 10, // Android shadow
    shadowColor: "#ff2f6a", // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },

    borderTopWidth: 0,
  },

  floatingButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ff2f6a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    elevation: 8,
  },
});
