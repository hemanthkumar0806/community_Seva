import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";
import { API_URL } from "../../utils/api";

const Signin = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (mobileNumber.length !== 10) return;

    try {
      const res = await axios.post(`${API_URL}/api/auth/send-otp`, {
        mobile: mobileNumber,
      });
      

      if (res.data.success) {
        setOtpSent(true);
        Alert.alert("Success", "OTP Sent!");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to send OTP");
    }
  };

  const handleSubmit = async () => {
    try {
      
      const verify = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        mobile: mobileNumber,
        otp: otp,
      });

      if (!verify.data.success) {
        return Alert.alert("Error", "Invalid OTP");
      }

      
      const login = await axios.post(`${API_URL}/api/auth/login`, {
        mobile: mobileNumber,
      } , {withCredentials: true});
      

      if (login.data.success) {
        await AsyncStorage.setItem("token", login.data.token);
        Alert.alert("Success", "Login Successful!");
        router.push("../(tabs)/blood/accept");
      }
    } catch (error) {
      Alert.alert("Error", "Login failed");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          <View className="bg-white p-6 rounded-3xl shadow-lg border border-red-200">
            
            <View className="mb-10">
              <Text className="text-4xl font-extrabold text-red-600 text-center">
                Welcome Back
              </Text>
              <Text className="text-gray-600 text-center">
                Login to continue
              </Text>
            </View>

            {/* MOBILE INPUT */}
            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-semibold">Mobile Number</Text>

              <View className="flex-row items-center border border-red-400 rounded-2xl px-4 py-3">
                <Text className="mr-2 font-semibold text-gray-700">+91</Text>
                <TextInput
                  className="flex-1"
                  placeholder="Enter mobile number"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  editable={!otpSent}
                />
              </View>

              {!otpSent && mobileNumber.length === 10 && (
                <TouchableOpacity onPress={handleSendOtp} className="mt-2">
                  <Text className="text-right text-red-600 underline">Send OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* OTP INPUT */}
            {otpSent && (
              <View className="mb-8">
                <Text className="text-gray-700 font-semibold mb-2">OTP</Text>
                <TextInput
                  className="border border-red-400 rounded-2xl px-4 py-3"
                  placeholder="Enter OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />

                <TouchableOpacity onPress={handleSendOtp} className="mt-2">
                  <Text className="text-right text-red-600 underline">Resend OTP</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* SUBMIT */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!otpSent || otp.length !== 6}
              className={`rounded-2xl py-4 ${
                otp.length === 6 ? "bg-red-600" : "bg-red-300"
              }`}
            >
              <Text className="text-white text-center font-bold text-lg">
                Verify & Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* SIGN UP LINK */}
          <View className="mt-6">
            <Text className="text-center">
              Don’t have an account?{" "}
              <Text
                className="text-red-600 underline"
                onPress={() => router.push("../Authentication/signup")}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signin;

const styles = StyleSheet.create({});
