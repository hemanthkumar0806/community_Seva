import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Platform,
  Animated,
  StatusBar,
  Keyboard,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ⚠️ IMPORTANT: These two lines are crucial for using the Gemini SDK in React Native
import 'react-native-get-random-values';
import { GoogleGenAI } from '@google/genai';

// --- CONFIGURATION ---

// Set your API key here.
// NOTE: You used 'AIzaSyA7K9K80NtRyqB6yaZp6_Z7pfVjIwRZO1I' in your previous code. Use a secure API key.
const GEMINI_API_KEY = 'AIzaSyDv0Zcv5c4ZoTewW0uxoXRpXY2_CWLw-p8'; 

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// The system instruction enforces the health/medicine restriction
const SYSTEM_INSTRUCTION = "You are a specialized AI medical assistant. Your sole purpose is to provide information related to medicines, dosage, side effects, drug interactions, and general health advice. DO NOT respond to any queries that are not related to health, medicine, or medical topics. For off-topic queries, simply state: 'I can only assist with medicine and health-related questions. How can I help with your medication today?'";

// Initialize chat session with the restriction
const chat = ai.chats.create({ 
    model: "gemini-2.5-flash",
    config: { systemInstruction: SYSTEM_INSTRUCTION }
});

// Message interface
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Static questions data (consolidated)
const INPUT_STATIC_QUESTIONS = [
  'Side effects?',
  'How to take it?',
  'Is this safe with milk?',
  'Interactions?',
  'Missed dose?',
  'Before food or after?',
  'Ask about dosage',
  'Check for side effects',
  'Drug interactions',
  'Safety precautions',
];

// Fallback image URL
const AI_AVATAR_URL = 'https://img.favpng.com/23/23/15/cute-robot-futuristic-ai-robot-on-circuit-platform-1cq1phJW_t.jpg';

export default function AiAssistantScreen() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading indicator
  
  const flatListRef = useRef<FlatList>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const inputBottomPadding = useRef(new Animated.Value(0)).current; // Controls keyboard height padding

  // --- Keyboard and Layout Listeners (Fixes dynamic positioning) ---
  useEffect(() => {
    // Height of the fixed bottom navigation bar (approx 75px)
    const navBarHeight = 75; 
    const additionalPadding = 0; 

    const keyboardShowEvent = Platform.select({ ios: 'keyboardWillShow', default: 'keyboardDidShow' });
    const keyboardHideEvent = Platform.select({ ios: 'keyboardWillHide', default: 'keyboardDidHide' });

    const keyboardShow = Keyboard.addListener(
        keyboardShowEvent as any,
        (e) => {
            const height = e.endCoordinates.height;
            // Animate the input bar up, offset by the fixed navigation bar height
            Animated.timing(inputBottomPadding, {
                toValue: height - navBarHeight + additionalPadding,
                duration: Platform.OS === 'ios' ? 250 : 200,
                useNativeDriver: false,
            }).start(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            });
        }
    );

    const keyboardHide = Keyboard.addListener(
        keyboardHideEvent as any,
        () => {
            // Animate padding back to zero (above the nav bar)
            Animated.timing(inputBottomPadding, {
                toValue: 0,
                duration: Platform.OS === 'ios' ? 250 : 200,
                useNativeDriver: false,
            }).start();
        }
    );

    return () => {
        keyboardShow.remove();
        keyboardHide.remove();
    };
  }, []);

  // --- Animation Logic ---

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    glowAnim.stopAnimation();
    pulseAnim.setValue(1);
    glowAnim.setValue(0);
  };
  
  // --- AI and Message Handling ---

  const sendGeminiMessage = async (text: string) => {
    setIsLoading(true);
    // Add a dummy message to show the typing indicator immediately
    const typingMessage: Message = { id: 'typing', text: '...typing', isUser: false, timestamp: new Date() };
    setMessages(prev => [...prev, typingMessage]);
    
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    try {
        const response = await chat.sendMessage({
            message: text,
        });

        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response?.text ?? '',
            isUser: false,
            timestamp: new Date(),
        };

        // Replace the 'typing' message with the actual response
        setMessages(prev => {
            const newMessages = prev.filter(m => m.id !== 'typing');
            return [...newMessages, aiMessage];
        });
        
    } catch (error) {
        console.error("Gemini API Error:", error);
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I ran into an error connecting to the AI. Please check your API key and network connection.",
            isUser: false,
            timestamp: new Date(),
        };
        // Replace typing message with error
        setMessages(prev => {
            const newMessages = prev.filter(m => m.id !== 'typing');
            return [...newMessages, errorMessage];
        });

    } finally {
        setIsLoading(false);
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }
  };

  // Handle sending a message
  const handleSend = () => {
    if (inputText.trim() === '' || isLoading) return;

    const userText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    
    sendGeminiMessage(userText);
  };

  // Handle quick question chip press (from top list)
  const handleChipPress = (question: string) => {
    const userMessage: Message = {
        id: Date.now().toString(),
        text: question,
        isUser: true,
        timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    sendGeminiMessage(question);
  };

  // Handle static input chip press (above input bar)
  const handleInputStaticChipPress = (question: string) => {
    setInputText(question);
    setIsInputFocused(true); 
  };

  // ⚠️ MIC FIX: Use a simulated result and clear instructions
  const handleVoiceInput = () => {
    if (isLoading) return;
    setIsListening(true);
    startPulseAnimation();

    // 💡 NOTE: This section SIMULATES voice recognition. 
    // For real voice recognition, you must integrate an external library (like expo-speech-recognition).
    setTimeout(() => {
      setIsListening(false);
      stopPulseAnimation();
      
      const recognizedText = 'I need help understanding my prescription.'; // Simulated result
      setInputText(recognizedText); 
      
      // Optional: Automatically send the message after simulation
      // const userMessage: Message = { id: Date.now().toString(), text: recognizedText, isUser: true, timestamp: new Date(), };
      // setMessages((prev) => [...prev, userMessage]);
      // sendGeminiMessage(recognizedText);
      
    }, 2500);
  };

  // Stop listening
  const handleStopListening = () => {
    setIsListening(false);
    stopPulseAnimation();
  };

  // Render message item
  const renderMessage = ({ item }: { item: Message }) => {
    if (item.id === 'typing') return null; 

    return (
        <View className={`mb-3 ${item.isUser ? 'items-end' : 'items-start'}`}>
            {item.isUser ? (
                <View className="bg-red-500 rounded-2xl px-5 py-3 max-w-[75%] shadow-md">
                    <Text className="text-base text-white leading-5">
                        {item.text}
                    </Text>
                </View>
            ) : (
                <View className="bg-white rounded-2xl px-5 py-3 max-w-[75%] shadow-md">
                    <Text className="text-base text-gray-800 leading-5">
                        {item.text}
                    </Text>
                </View>
            )}
        </View>
    );
  };

  return (
    <KeyboardAvoidingView className='flex-1'>
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e60000" />

     
      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }} 
        >
          {/* Greeting Card */}
          <View className="px-5 pt-6 pb-4">
            <View className="bg-white rounded-3xl p-6 shadow-lg">
              <Text className="text-gray-600 text-sm mb-1">Hello, Mary!</Text>
              <Text className="text-gray-900 text-2xl font-bold">
                How can I help you today?
              </Text>
            </View>
          </View>

          {/* 💡 AI AVATAR: Added back the image structure */}
          {/* <View className="items-center py-8">
            <View className="relative">
              <View className="w-36 h-36 bg-[#ff6b6b] rounded-3xl items-center justify-center shadow-xl overflow-hidden">
                <Image
                    source={{ uri: AI_AVATAR_URL }}
                    style={{ width: '100%', height: '100%', borderRadius: 24 }}
                    resizeMode="cover"
                />
              </View>
            </View>
          </View> */}

          {/* Question Chips - Top scrollable list */}
          <View className="px-5 mb-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20, flexDirection: 'row', alignItems: 'center' }} 
            >
              {INPUT_STATIC_QUESTIONS.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleChipPress(question)}
                  className="bg-white rounded-full px-4 py-3 mr-3 shadow-md border border-red-100"
                >
                  <Text className="text-red-600 font-semibold text-sm">
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Area */}
          <View className="px-5 pb-4" style={{ minHeight: 150 }}>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View className="items-center pt-12">
                    <View className="bg-white rounded-3xl p-8 items-center shadow-lg w-48">
                        <Ionicons name="chatbubbles-outline" size={48} color="#e60000" />
                        <Text className="text-gray-700 text-center mt-3 text-base font-medium">
                            Ask me anything
                        </Text>
                    </View>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </View>
      
      {/* Input Container: Dynamically moved by the keyboard via Animated.View */}
      <Animated.View
        style={[styles.animatedInputWrapper, { transform: [{ translateY: Animated.multiply(inputBottomPadding, -1) }] }]}
      >
       

        {/* Input Field Container */}
        <View className="bg-white border-t border-gray-200 px-5 py-4 shadow-2xl">
          <View className="bg-gray-100 rounded-full pr-2 flex-row items-center">
            <Ionicons name="search" size={20} color="#9ca3af" style={{ marginLeft: 16 }} />

            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything"
              placeholderTextColor="#9ca3af"
              className="flex-1 text-base py-3 px-3 text-gray-900"
              multiline={false}
              maxLength={500}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />

            {inputText.trim() !== '' ? (
              <TouchableOpacity onPress={handleSend} className="p-3" disabled={isLoading}>
                <Ionicons name="send" size={20} color={isLoading ? "#9ca3af" : "#e60000"} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleVoiceInput} className="p-3" disabled={isLoading}>
                <Ionicons name="mic" size={20} color="#e60000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
      
      <View style={styles.bottomNav}>
        <View className="flex-row justify-between items-center w-full">
          <TouchableOpacity className="items-center py-2">
            <Ionicons name="home-outline" size={24} color="#9ca3af" />
            <Text className="text-gray-500 text-xs mt-1">Home</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center py-2">
            <Ionicons name="sparkles-outline" size={24} color="#e60000" />
            <Text className="text-red-600 text-xs mt-1 font-semibold">AI</Text>
          </TouchableOpacity>

          <View style={{ width: 64 }} /> 

          <TouchableOpacity className="items-center py-2">
            <Ionicons name="time-outline" size={24} color="#9ca3af" />
            <Text className="text-gray-500 text-xs mt-1">History</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center py-2">
            <Ionicons name="bar-chart-outline" size={24} color="#9ca3af" />
            <Text className="text-gray-500 text-xs mt-1">Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Input Modal */}
      <Modal visible={isListening} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="bg-white rounded-3xl p-10 items-center w-4/5 shadow-2xl">
            <Text className="text-2xl font-bold text-gray-800 mb-8">
              Listening...
            </Text>

            {/* Pulsing Microphone Animation */}
            <View className="relative mb-8">
              <Animated.View
                style={{ transform: [{ scale: pulseAnim }] }}
                className="bg-red-500 w-28 h-28 rounded-full items-center justify-center shadow-2xl"
              >
                <Ionicons name="mic-outline" size={50} color="white" />
              </Animated.View>

              {/* Glow rings */}
              <Animated.View
                style={{
                  opacity: glowAnim,
                  transform: [{ scale: pulseAnim }],
                }}
                className="absolute -inset-4 bg-red-300/40 rounded-full"
              />
              <Animated.View
                style={{
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0],
                  }),
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.15],
                        outputRange: [1.2, 1.5],
                      }),
                    },
                  ],
                }}
                className="absolute -inset-8 bg-red-200/30 rounded-full"
              />
            </View>

            <Text className="text-gray-500 text-center mb-8 text-base">
              Speak your question clearly
            </Text>

            {/* Stop Button */}
            <TouchableOpacity
              onPress={handleStopListening}
              className="bg-red-600 px-10 py-4 rounded-full shadow-lg"
            >
              <Text className="text-white font-bold text-lg">Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffe5e5', 
    },
    contentContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    bottomNav: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb', 
        paddingHorizontal: 24, 
        paddingVertical: 12, 
        height: 75, 
        zIndex: 20, 
    },
    animatedInputWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 75, 
        zIndex: 30, 
    },
});