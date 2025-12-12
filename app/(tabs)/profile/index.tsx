import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/utils/api";
import { Calendar, Droplet, User, Mail, Phone, MapPin, Edit2, Users } from "lucide-react-native";

const PRIMARY_RED = "#DC2626";

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ----- Profile State -----
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    dob: "",
    city: "",
    district: "",
    state: "",
  });

  const genders = ["Male", "Female", "Other"];

  const donations = [
    { id: 1, date: "15 Nov 2024", location: "City Blood Bank, Vijayawada", units: "1 Unit" },
    { id: 2, date: "20 Aug 2024", location: "Government Hospital", units: "1 Unit" },
    { id: 3, date: "05 May 2024", location: "Red Cross Society", units: "1 Unit" },
  ];

  // -------------------- FETCH PROFILE --------------------
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const user = res.data.user;

        setProfile({
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          gender: user.gender,
          dob: user.dob,
          city: user.address[0].city,
          district: user.address[0].district,
          state: user.address[0].state,
        });
      }

      setLoading(false);
    } catch (error) {
      console.log("Profile fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // -------------------- UPDATE PROFILE --------------------
  const saveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/auth/update-profile`,
        {
          name: profile.name,
          email: profile.email,
          mobile: profile.mobile,
          gender: profile.gender,
          dob: profile.dob,
          address: [
            {
              city: profile.city,
              district: profile.district,
              state: profile.state,
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsEditing(false);
    } catch (error) {
      console.log("Update failed:", error);
    }
  };

  // -------------------- AVATAR --------------------
  const avatarUri =
    profile.gender?.toLowerCase() === "female"
      ? "https://cdn-icons-png.flaticon.com/512/706/706830.png"
      : profile.gender?.toLowerCase() === "male"
      ? "https://cdn-icons-png.flaticon.com/512/706/706807.png"
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-red-50">
        <Text className="text-red-600 text-lg font-bold">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-red-50">
      <ScrollView className="p-4">

        {/* PROFILE CARD */}
        <View className="bg-white p-5 rounded-2xl border border-red-200 shadow mb-5">

          {/* AVATAR + EDIT BUTTON */}
          <View className="items-center border-b border-red-200 pb-5 mb-5">
            <Image
              source={{ uri: avatarUri }}
              className="w-28 h-28 rounded-full border-4 border-red-500"
            />

            <TouchableOpacity
              onPress={() => {
                if (isEditing) saveProfile();
                else setIsEditing(true);
              }}
              className="flex-row items-center mt-4 px-4 py-2 border border-red-600 rounded-full bg-white"
            >
              <Edit2 size={16} color={PRIMARY_RED} />
              <Text className="text-red-600 font-semibold ml-2">
                {isEditing ? "Save" : "Edit Profile"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* PERSONAL INFO */}
          <Text className="text-lg font-bold text-red-900 mb-3">Personal Information</Text>

          {/* FULL NAME */}
          <Field
            label="Full Name"
            icon={User}
            editable={isEditing}
            value={profile.name}
            onChange={(t : any) => setProfile({ ...profile, name: t })}
          />

          {/* EMAIL */}
          <Field
            label="Email"
            icon={Mail}
            editable={isEditing}
            value={profile.email}
            onChange={(t : any) => setProfile({ ...profile, email: t })}
          />

          {/* MOBILE */}
          <Field
            label="Mobile"
            icon={Phone}
            editable={isEditing}
            value={profile.mobile}
            onChange={(t : any) => setProfile({ ...profile, mobile: t })}
          />

          {/* GENDER */}
          <GenderField
            label="Gender"
            icon={Users}
            editable={isEditing}
            value={profile.gender}
            onPress={() => setShowGenderModal(true)}
          />

          {/* DOB */}
          <Field
            label="Date of Birth"
            icon={Calendar}
            editable={isEditing}
            value={profile.dob}
            onChange={(t : any) => setProfile({ ...profile, dob: t })}
          />

          {/* ADDRESS — split into 3 fields */}
          <View className="mt-4">
            <View className="flex-row items-center mb-1">
              <MapPin size={18} color={PRIMARY_RED} />
              <Text className="text-red-900 font-semibold ml-2">Address</Text>
            </View>

            {!isEditing ? (
              <Text className="ml-8 text-red-900">
                {profile.city}, {profile.district}, {profile.state}
              </Text>
            ) : (
              <>
                <TextInput
                  placeholder="City"
                  value={profile.city}
                  onChangeText={(t) => setProfile({ ...profile, city: t })}
                  className="border border-red-200 rounded-xl p-3 bg-white text-red-900 mb-2"
                />
                <TextInput
                  placeholder="District"
                  value={profile.district}
                  onChangeText={(t) => setProfile({ ...profile, district: t })}
                  className="border border-red-200 rounded-xl p-3 bg-white text-red-900 mb-2"
                />
                <TextInput
                  placeholder="State"
                  value={profile.state}
                  onChangeText={(t) => setProfile({ ...profile, state: t })}
                  className="border border-red-200 rounded-xl p-3 bg-white text-red-900"
                />
              </>
            )}
          </View>
        </View>

        {/* DONATION ACTIVITY — UNCHANGED */}
        <View className="bg-white p-5 rounded-2xl border border-red-200 shadow mb-10">
          <View className="flex-row items-center mb-3">
            <Droplet size={22} color={PRIMARY_RED} />
            <Text className="text-lg font-bold text-red-900 ml-2">My Donation Activity</Text>
          </View>

          <Text className="text-red-900 mb-4">
            Total Donations: <Text className="font-bold text-red-600">{donations.length}</Text>
          </Text>

          {donations.map((d) => (
            <View key={d.id} className="flex-row p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
              <View className="w-14 h-14 rounded-full bg-white items-center justify-center mr-3">
                <Droplet size={24} color={PRIMARY_RED} />
              </View>

              <View className="flex-1">
                <Text className="text-red-900 font-bold">{d.date}</Text>
                <Text className="text-red-800">{d.location}</Text>
                <Text className="text-red-600 font-semibold">{d.units}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* GENDER MODAL */}
        <Modal visible={showGenderModal} transparent animationType="fade">
          <View className="flex-1 bg-black/50 justify-center p-6">
            <View className="bg-white rounded-2xl p-5 border border-red-200">
              <Text className="text-xl font-bold text-red-600 text-center mb-4">Select Gender</Text>

              {genders.map((g) => (
                <TouchableOpacity
                  key={g}
                  className="p-3 border-b border-red-100"
                  onPress={() => {
                    setProfile({ ...profile, gender: g });
                    setShowGenderModal(false);
                  }}
                >
                  <Text
                    className={`text-lg ${
                      profile.gender === g ? "text-red-600 font-bold" : "text-red-800"
                    }`}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setShowGenderModal(false)}
                className="mt-4 bg-red-600 rounded-xl p-3"
              >
                <Text className="text-white text-center font-bold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------ REUSABLE FIELDS ------------------ */
function Field({ label, icon: Icon, editable, value, onChange }: { label: string; icon: any; editable: boolean; value: string; onChange: (text: string) => void }) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-1">
        <Icon size={18} color={PRIMARY_RED} />
        <Text className="text-red-900 font-semibold ml-2">{label}</Text>
      </View>

      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          className="border border-red-200 rounded-xl p-3 bg-white text-red-900"
        />
      ) : (
        <Text className="text-red-900 ml-8">{value}</Text>
      )}
    </View>
  );
}

function GenderField({ label, icon: Icon, editable, value, onPress }: { label: string; icon: any; editable: boolean; value: string; onPress: () => void }) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-1">
        <Icon size={18} color={PRIMARY_RED} />
        <Text className="text-red-900 font-semibold ml-2">{label}</Text>
      </View>

      {editable ? (
        <TouchableOpacity
          onPress={onPress}
          className="border border-red-200 rounded-xl p-3 bg-white"
        >
          <Text className="text-red-900">{value}</Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-red-900 ml-8">{value}</Text>
      )}
    </View>
  );
}
