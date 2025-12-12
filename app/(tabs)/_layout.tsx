import React, { useEffect, useState } from "react";
import { Drawer } from "expo-router/drawer";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "@/utils/api";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CustomDrawerContent = (props: any) => {
  const [username , setUsername] = useState("");
  const [email , setEmail] = useState("");
  const [location , setLocation] = useState("");
  const [mobile , setMobile] = useState("");
  const [gender , setGender] = useState("");
  const [address , setAddress] = useState([{city : "" , district : "" , state : ""}]);
  const [dob , setDob] = useState("");

  const getProfileData = async() => {
    try{
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },  
      });
      if(response.data.success){
        console.log(response.data.user);
        setUsername(response.data.user.name);
        setEmail(response.data.user.email);
        setLocation(response.data.user.location);
        setMobile(response.data.user.mobile);
        setGender(response.data.user.gender);
        setAddress(response.data.user.address);
        setDob(response.data.user.dob);
      }
    }catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    getProfileData(); 
  } , [])

  const handleLogout = async()   =>{
    await AsyncStorage.removeItem("token");
    router.replace("/Authentication/signin");
  }
  const handleProfilePress = () => props.navigation.navigate("profile");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <DrawerContentScrollView {...props} className="pt-0" showsVerticalScrollIndicator={false}>

        {/* HEADER WITHOUT GRADIENT */}
        <View className="bg-red-600 rounded-3xl shadow-xl overflow-hidden">

          {/* Floating decorative circles for premium look */}
          <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

          <TouchableOpacity
            className="p-6 pb-8"
            onPress={handleProfilePress}
            activeOpacity={0.9}
          >


            {/* USER INFO */}
      <View className="items-center w-full mt-2">

        {/* ===== ROW: AVATAR + NAME AREA ===== */}
        <View className="flex-row items-center w-full px-4">

          {/* AVATAR */}
          <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center shadow-xl overflow-hidden mr-4">
            <Image
              source={{
                uri:
                  gender?.trim().toLowerCase() === "female"
                    ? "https://cdn-icons-png.flaticon.com/512/706/706830.png"
                  : gender?.trim().toLowerCase() === "male"
                    ? "https://cdn-icons-png.flaticon.com/512/706/706807.png"
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* NAME + BADGE + SUBTEXT */}
          <View className="flex-1">
            {/* NAME + BADGE */}
            <View className="flex-row items-center mb-1">
              <Text className="text-2xl font-extrabold text-white">{username}</Text>
              <View className="ml-2 bg-white/40 px-2 py-0.5 rounded-full">
                <Text className="text-white text-[12px] font-semibold tracking-wide">PRO</Text>
              </View>
            </View>

            {/* SUBTEXT */}
            <Text className="text-white/80 text-[12px]">
              Blood Donor • Community Hero
            </Text>
          </View>

        </View>

        {/* ===== DETAILS BELOW (FULL WIDTH) ===== */}
        <View className="w-full px-4 mt-4 space-y-1">

          <View className="flex-row items-center">
            <Ionicons name="mail-outline" size={15} color="#fff" />
            <Text className="text-white/90 text-xs ml-2 flex-1" numberOfLines={1}>{email}</Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={15} color="#fff" />
            <Text className="text-white/90 text-xs ml-2">{mobile}</Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={15} color="#fff" />
            <Text className="text-white/90 text-xs ml-2 capitalize">{gender}</Text>
          </View>

          {address?.length > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="home-outline" size={15} color="#fff" />
              <Text className="text-white/90 text-xs ml-2 flex-1" numberOfLines={1}>
                {address[0].city}, {address[0].district}, {address[0].state}
              </Text>
            </View>
          )}

          <View className="flex-row items-center mb-1">
            <Ionicons name="calendar-outline" size={15} color="#fff" />
            <Text className="text-white/90 text-xs ml-2">{dob}</Text>
          </View>

        </View>

        {/* VIEW PROFILE BUTTON */}
        <View className="bg-white/20 px-4 py-2 gap-2 rounded-full flex-row items-center mt-4">
          <Text className="text-white mr-1 text-xs">View Profile</Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </View>
      </View>




          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View className="flex-row justify-around py-4 px-4 bg-white mx-4 rounded-2xl -mt-4 shadow-lg border border-gray-100">
          <View className="items-center">
            <Text className="text-red-600 font-bold text-lg">12</Text>
            <Text className="text-gray-500 text-xs">Donations</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{username}</Text>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </View>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.userLocation}>{location}</Text>
            </View>
            <Text style={styles.viewProfileText}>View Profile</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Default Drawer Items */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* LOGOUT */}
      <View className="border-t border-gray-200 bg-white">
        <TouchableOpacity
          className="flex-row items-center justify-center p-4 active:bg-gray-100"
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-3">
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          </View>
          <Text className="text-red-600 font-bold text-base">Sign Out</Text>
        </TouchableOpacity>


      </View>
    </SafeAreaView>
  );
};

// Main Component
export default function RootLayout() {
  return (
        <Drawer
  drawerContent={(props) => <CustomDrawerContent {...props} />}
  screenOptions={({ route, navigation }) => ({
    headerTitle: route.name === "blood"
      ? "Blood Donation"
      : route.name === "organ"
      ? "Organ Donation"
      : route.name === "medicine"
      ? "Medicine Help"
      : "", // fallback
    headerTitleAlign: "center",
    headerTitleStyle: {
      fontWeight: "bold", // makes text bold
      fontSize: 18,       // optional: adjust font size
    },
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: "#dc2626",
      elevation: 4,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => navigation.toggleDrawer()} // open drawer
        style={{ marginLeft: 15 }}
      >
        <Ionicons name="menu" size={24} color="#fff" />
      </TouchableOpacity>
    ),
    drawerActiveTintColor: "#dc2626",
    drawerActiveBackgroundColor: "#fee2e2",
    drawerInactiveTintColor: "#4b5563",
    drawerLabelStyle: {
      marginLeft: -10,
      fontSize: 15,
      fontWeight: "600",
    },
    drawerItemStyle: {
      borderRadius: 12,
      marginHorizontal: 8,
      marginVertical: 2,
      paddingHorizontal: 8,
    },
  })}
>


      <Drawer.Screen
        name="blood"
        options={{
          drawerLabel: "Blood Donation",
          title: "Blood Donation",
          drawerIcon: ({ color }) => (
            <View className="w-9 h-9 items-center justify-center">
              <MaterialCommunityIcons name="blood-bag" size={22} color={color} />
            </View>
          ),
        }} 
      />
      <Drawer.Screen 
        name="organ" 
        options={{ 
          drawerLabel: 'Organ Donation',
          title: 'Organ Donation',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="medicine" 
        options={{ 
          drawerLabel: 'Medicine Help',
          title: 'Medicine Help',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="medical-outline" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="profile" 
        options={{ 
          drawerLabel: 'My Profile',
          title: 'My Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          drawerItemStyle: { display: 'none' }, // Hide from drawer menu
        }} 
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollViewContent: {
    paddingTop: 0,
  },

  profileSection: {
    padding: 20,
    backgroundColor: "#ffe6e6", // soft red tint
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f5c2c2",
  },

  profileImageContainer: {
    position: "relative",
    marginRight: 18,
  },

  profileImage: {
    width: 105,
    height: 105,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#e74c3c",
  },

  editIconOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#e74c3c",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#e74c3c",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  profileInfo: {
    flex: 1,
  },

  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#b7312a", // darker red themed text
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  userLocation: {
    fontSize: 14,
    color: "#7a7a7a",
    marginLeft: 5,
  },

  viewProfileText: {
    fontSize: 12,
    color: "#e74c3c",
    fontWeight: "600",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#f3b7b7",
    marginVertical: 12,
    marginHorizontal: 15,
  },

  logoutButton: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: "#f2b4b4",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    // subtle shadow
    shadowColor: "#e74c3c",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 5,
    elevation: 6,
  },

  logoutText: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
