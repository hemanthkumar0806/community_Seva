import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import './globals.css'
const _layout = () => {
  return (
      <Stack>
        <Stack.Screen   name="index"   options={{ headerShown: false }} />
        <Stack.Screen  name="Authentication"  options={{ headerShown: false }}  />
        <Stack.Screen name="(tabs)"  options={{ headerShown: false }}  />
        <Stack.Screen  name="landing"  options={{ headerShown: false }} />
    </Stack>
  )
}

export default _layout

const styles = StyleSheet.create({})
