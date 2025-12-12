import React, { useEffect, useState } from "react";
import { Drawer } from "expo-router/drawer";
import { View, Text, Image, TouchableOpacity } from "react-native";
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

          <View className="w-px bg-gray-200" />

          <View className="items-center">
            <Text className="text-red-600 font-bold text-lg">450</Text>
            <Text className="text-gray-500 text-xs">Impact Score</Text>
          </View>

          <View className="w-px bg-gray-200" />

          <View className="items-center">
            <Text className="text-red-600 font-bold text-lg">8</Text>
            <Text className="text-gray-500 text-xs">Lives Saved</Text>
          </View>
        </View>

        {/* Section Label */}
        <View className="px-6 pt-6 pb-2">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
            Main Menu
          </Text>
        </View>

        <View className="px-2">
          <DrawerItemList {...props} />
        </View>

        {/* QUICK ACTIONS */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
            Quick Actions
          </Text>

          <TouchableOpacity className="flex-row items-center bg-white p-3 rounded-xl mb-2 shadow-sm border border-gray-100">
            <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center">
              <Ionicons name="notifications-outline" size={20} color="#dc2626" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-800 font-semibold">Notifications</Text>
              <Text className="text-gray-500 text-xs">3 new alerts</Text>
            </View>

            <View className="bg-red-600 w-6 h-6 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center">
              <Ionicons name="settings-outline" size={20} color="#dc2626" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-gray-800 font-semibold">Settings</Text>
              <Text className="text-gray-500 text-xs">App preferences</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* HELP */}
        <View className="px-6 pt-4 pb-4">
          <TouchableOpacity className="flex-row items-center bg-red-50 p-4 rounded-xl border border-red-100">
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
              <Ionicons name="help-circle-outline" size={22} color="#dc2626" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-gray-800 font-bold">Need Help?</Text>
              <Text className="text-gray-600 text-xs">Contact support team</Text>
            </View>
          </TouchableOpacity>
        </View>
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
          drawerLabel: "Organ Donation",
          title: "Organ Donation",
          drawerIcon: ({ color }) => (
            <View className="w-9 h-9 items-center justify-center">
              <FontAwesome5 name="heartbeat" size={20} color={color} />
            </View>
          ),
        }}
      />

      <Drawer.Screen
        name="medicine"
        options={{
          drawerLabel: "Medicine Help",
          title: "Medicine Help",
          drawerIcon: ({ color }) => (
            <View className="w-9 h-9 items-center justify-center">
              <MaterialCommunityIcons name="pill" size={22} color={color} />
            </View>
          ),
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: "My Profile",
          drawerIcon: ({ color }) => (
            <View className="w-9 h-9 items-center justify-center">
              <Ionicons name="person-outline" size={22} color={color} />
            </View>
          ),
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer>
  );
}
