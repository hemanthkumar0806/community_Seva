// generate code for check auth state and redirect to signin or main app
import { router, Stack } from "expo-router";
import React from "react";  
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Index = () => {
  const [loading, setLoading] = useState(true);
    useEffect(() => {
    const getToken = async () => {
        const token = await AsyncStorage.getItem("token");
        if(token){
            console.log(token)
            router.replace("../(tabs)/medicine/home");
        }else{
            router.replace("../Authentication/signin");
        }
    }
    getToken();
  }, []);
    if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
  }
    return null;


};
export default Index;
