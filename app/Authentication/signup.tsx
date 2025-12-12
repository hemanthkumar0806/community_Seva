import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";
import { API_URL } from "../../utils/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Signup = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Address fields
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");

  const handleSendOtp = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/send-otp`, { mobile });
      if (res.data.success) {
        setOtpSent(true);
        Alert.alert("Success", res.data.message);
      }
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        mobile,
        otp,
      });

      if (res.data.success) {
        setOtpVerified(true);
        Alert.alert("Success", "OTP Verified!");
      } else {
        Alert.alert("Error", "Invalid OTP");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to verify OTP");
    }
  };

  const handleSubmit = async () => {
    try {
      const register = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        mobile,
        dob,
        gender,
        city,
        district,
        state,
      });

      if (register.data.success) {
        await AsyncStorage.setItem("token", register.data.token);
        Alert.alert("Success", "Account Created!");
        router.push("../(tabs)/blood/donate");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Registration failed");
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isSubmitDisabled = !(
    name &&
    otpVerified &&
    emailRegex.test(email) &&
    gender &&
    dob &&
    city &&
    district &&
    state
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <Text className="text-3xl font-extrabold text-center text-red-600 mb-8">
              Create Account
            </Text>

            {/* NAME */}
            <View className="mb-5">
              <Text className="mb-2 text-gray-700 font-semibold text-sm">
                Full Name
              </Text>
              <TextInput
                className="border border-gray-300 rounded-2xl px-4 py-3.5 bg-gray-50"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* MOBILE */}
            <View className="mb-5">
              <Text className="mb-2 text-gray-700 font-semibold text-sm">
                Mobile Number
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-2xl px-4 py-3.5 bg-gray-50">
                <Text className="mr-2 font-semibold text-gray-700">+91</Text>
                <TextInput
                  className="flex-1"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                  editable={!otpVerified}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {!otpSent && mobile.length === 10 && (
                <TouchableOpacity onPress={handleSendOtp} className="mt-3">
                  <Text className="text-red-600 font-semibold text-right text-sm">
                    Send OTP →
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* OTP */}
            {otpSent && !otpVerified && (
              <View className="mb-5">
                <Text className="mb-2 font-semibold text-gray-700 text-sm">
                  Enter OTP
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-2xl px-4 py-3.5 bg-gray-50"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#9CA3AF"
                />

                <TouchableOpacity onPress={handleSendOtp} className="mt-3">
                  <Text className="text-right text-red-600 font-semibold text-sm">
                    Resend OTP
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={otp.length !== 6}
                  className={`py-3.5 mt-4 rounded-2xl ${
                    otp.length === 6 ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <Text className="text-center text-white font-bold">
                    Verify OTP
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {otpVerified && (
              <View className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-5">
                <Text className="text-green-700 text-center font-semibold">
                  ✓ Mobile Number Verified
                </Text>
              </View>
            )}

            {/* EMAIL + GENDER + DOB + ADDRESS */}
            {otpVerified && (
              <>
                {/* EMAIL */}
                <View className="mb-5">
                  <Text className="mb-2 text-gray-700 font-semibold text-sm">
                    Email Address
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-2xl px-4 py-3.5 bg-gray-50"
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* GENDER */}
                <View className="mb-5">
                  <Text className="mb-2 text-gray-700 font-semibold text-sm">
                    Gender
                  </Text>
                  <View className="flex-row justify-between">
                    {["Male", "Female", "Other"].map((g) => (
                      <TouchableOpacity
                        key={g}
                        className={`flex-1 mx-1 py-3 rounded-2xl border ${
                          gender === g
                            ? "bg-red-600 border-red-600"
                            : "border-gray-300 bg-gray-50"
                        }`}
                        onPress={() => setGender(g)}
                      >
                        <Text
                          className={`font-semibold text-center ${
                            gender === g ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* DOB DATE PICKER */}
                <View className="mb-5">
                  <Text className="mb-2 text-gray-700 font-semibold text-sm">
                    Date of Birth
                  </Text>
                  <TouchableOpacity onPress={() => setShowPicker(true)}>
                    <View className="border border-gray-300 rounded-2xl px-4 py-3.5 bg-gray-50">
                      <Text className={dob ? "text-gray-900" : "text-gray-400"}>
                        {dob || "Select your date of birth"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {showPicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    maximumDate={new Date()}
                    onChange={(event, date) => {
                        setShowPicker(Platform.OS === "ios");

                        if (date) {
                          setSelectedDate(date);

                          const day = date.getDate().toString().padStart(2, "0");
                          const month = (date.getMonth() + 1).toString().padStart(2, "0");
                          const year = date.getFullYear();

                          const formatted = `${year}-${month}-${day}`;
                          setDob(formatted);
                        }
                      }}
                  />
                )}

                {/* ADDRESS INPUTS */}
                <View className="mb-5">
                  <Text className="mb-2 text-gray-700 font-semibold text-sm">
                    City
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-2xl px-4 py-3.5 bg-gray-50"
                    placeholder="Enter your city"
                    value={city}
                    onChangeText={setCity}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View className="mb-5">
                  <Text className="mb-2 text-gray-700 font-semibold text-sm">
                    District
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-2xl px-4 py-3.5 bg-gray-50"
                    placeholder="Enter your district"
                    value={district}
                    onChangeText={setDistrict}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View className="mb-6">
                  <Text className="mb-2 text-gray-700 font-semibold text-sm">
                    State
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-2xl px-4 py-3.5 bg-gray-50"
                    placeholder="Enter your state"
                    value={state}
                    onChangeText={setState}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* SUBMIT */}
                <TouchableOpacity
                  disabled={isSubmitDisabled}
                  onPress={handleSubmit}
                  className={`py-4 rounded-2xl shadow-md ${
                    isSubmitDisabled ? "bg-gray-300" : "bg-red-600"
                  }`}
                >
                  <Text className="text-center text-white font-bold text-lg">
                    Create Account
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* SIGNIN LINK */}
          <View className="mt-6 mb-4 flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("../Authentication/signin")}
            >
              <Text className="text-red-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;