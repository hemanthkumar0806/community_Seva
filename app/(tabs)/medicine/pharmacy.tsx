import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';

interface Pharmacy {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  isOpen: boolean;
  phone: string;
  address: string;
}

interface AIResponse {
  description: string;
  availability: string;
  safetyTips: string[];
  commonlyAvailable: boolean;
  bestPharmacy?: string;
  websiteAnalysis?: string;
}


export default function MedicalFinderScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (location) {
      loadNearbyPharmacies();
    }
  }, [location]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
      setLoading(false);
    } catch (err) {
      setError('Failed to get location');
      setLoading(false);
    }
  };

  const loadNearbyPharmacies = () => {
    if (!location) return;

    const dummyPharmacies: Pharmacy[] = [
      {
        id: '1',
        name: 'MedPlus Pharmacy',
        latitude: location.coords.latitude + 0.005,
        longitude: location.coords.longitude + 0.005,
        distance: 0.8,
        isOpen: true,
        phone: '+919876543210',
        address: '123 Main Street',
      },
      {
        id: '2',
        name: 'Apollo Pharmacy',
        latitude: location.coords.latitude - 0.008,
        longitude: location.coords.longitude + 0.003,
        distance: 1.2,
        isOpen: true,
        phone: '+919876543211',
        address: '456 Park Avenue',
      },
      {
        id: '3',
        name: '24/7 Medical Store',
        latitude: location.coords.latitude + 0.003,
        longitude: location.coords.longitude - 0.006,
        distance: 0.6,
        isOpen: true,
        phone: '+919876543212',
        address: '789 Healthcare Road',
      },
      {
        id: '4',
        name: 'Care Pharmacy',
        latitude: location.coords.latitude - 0.004,
        longitude: location.coords.longitude - 0.004,
        distance: 1.5,
        isOpen: false,
        phone: '+919876543213',
        address: '321 Wellness Lane',
      },
      {
        id: '5',
        name: 'LifeCare Medical',
        latitude: location.coords.latitude + 0.007,
        longitude: location.coords.longitude - 0.002,
        distance: 0.9,
        isOpen: true,
        phone: '+919876543214',
        address: '654 Health Plaza',
      },
    ];

    setPharmacies(dummyPharmacies);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigate = (latitude: number, longitude: number) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
    });
    Linking.openURL(url!);
  };

  const handleEmergencyCall = (number: string, name: string) => {
    Alert.alert(
      `Call ${name}`,
      `Do you want to call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${number}`) },
      ]
    );
  };

  const GEMINI_API_KEY = "AIzaSyA7K9K80NtRyqB6yaZp6_Z7pfVjIwRZO1I"; // 🔐 NEVER commit real key to GitHub

  const GEMINI_MODEL = "gemini-1.5-flash-latest";


  const askAI = async (query: string) => {
    if (!query.trim()) return;

    setAiLoading(true);
    
    setTimeout(() => {
      const mockResponse: AIResponse = {
        description: `${query} is a commonly prescribed medication used for treating various conditions. It belongs to a specific class of drugs and works by targeting specific receptors or pathways in the body.`,
        availability: `${query} is generally available in most pharmacies. Based on your location, 4 out of 5 nearby stores likely stock this medication.`,
        safetyTips: [
          'Take as prescribed by your doctor',
          'Avoid alcohol consumption while taking this medicine',
          'Do not take on an empty stomach unless specified',
          'Store in a cool, dry place away from sunlight',
          'Consult your doctor if you experience any side effects',
        ],
        commonlyAvailable: true,
      };

      setAiResponse(mockResponse);
      setAiLoading(false);
    }, 1500);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={{ marginTop: 16, color: '#4B5563', fontSize: 18 }}>Getting your location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={{ marginTop: 16, color: '#1F2937', fontSize: 20, fontWeight: 'bold' }}>Location Error</Text>
        <Text style={{ marginTop: 8, color: '#6B7280', textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity
          onPress={requestLocationPermission}
          style={{ marginTop: 24, backgroundColor: '#EF4444', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 16 }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 18 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ backgroundColor: '#EF4444', paddingTop: 48, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>Medical Finder</Text>
              <Text style={{ color: '#FEE2E2', fontSize: 14, marginTop: 4 }}>Find pharmacies near you</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 999 }}>
              <Ionicons name="medical" size={28} color="white" />
            </View>
          </View>
        </View>

        {/* Map Section */}
        {location && (
          <View style={{ marginHorizontal: 16, marginTop: 24, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 12, height: 300 }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Your Location"
              >
                <View style={{ backgroundColor: '#3B82F6', padding: 8, borderRadius: 999 }}>
                  <Ionicons name="person" size={20} color="white" />
                </View>
              </Marker>

              {pharmacies.map((pharmacy) => (
                <Marker
                  key={pharmacy.id}
                  coordinate={{
                    latitude: pharmacy.latitude,
                    longitude: pharmacy.longitude,
                  }}
                  title={pharmacy.name}
                  onPress={() => setSelectedPharmacy(pharmacy)}
                >
                  <View style={{ backgroundColor: '#EF4444', padding: 8, borderRadius: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 }}>
                    <Ionicons name="medical" size={24} color="white" />
                  </View>
                </Marker>
              ))}
            </MapView>
          </View>
        )}

        {/* Emergency Help Section */}
        {/* <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <LinearGradient
            colors={['#DC2626', '#EF4444', '#F87171']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="warning" size={28} color="white" />
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginLeft: 12 }}>Emergency Help</Text>
            </View>

            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => handleEmergencyCall('108', 'Ambulance')}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ backgroundColor: 'white', padding: 12, borderRadius: 999 }}>
                  <Ionicons name="call" size={24} color="#DC2626" />
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Call Ambulance</Text>
                  <Text style={{ color: '#FEE2E2', fontSize: 14 }}>Emergency: 108</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleEmergencyCall('1066', 'Hospital')}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ backgroundColor: 'white', padding: 12, borderRadius: 999 }}>
                  <Ionicons name="business" size={24} color="#DC2626" />
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Nearby Hospital</Text>
                  <Text style={{ color: '#FEE2E2', fontSize: 14 }}>24/7 Emergency</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleEmergencyCall('', 'Family Member')}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{ backgroundColor: 'white', padding: 12, borderRadius: 999 }}>
                  <Ionicons name="people" size={24} color="#DC2626" />
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Call Family</Text>
                  <Text style={{ color: '#FEE2E2', fontSize: 14 }}>Emergency Contact</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View> */}

        {/* Nearby Pharmacies List */}
        <View style={{ marginHorizontal: 16, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: '#1F2937', fontSize: 24, fontWeight: 'bold' }}>Nearby Pharmacies</Text>
            <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
              <Text style={{ color: 'white', fontWeight: '600' }}>{pharmacies.length}</Text>
            </View>
          </View>

          {pharmacies.map((pharmacy) => (
            <View
              key={pharmacy.id}
              style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 2, borderColor: '#FEE2E2' }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1F2937', fontSize: 18, fontWeight: 'bold' }}>{pharmacy.name}</Text>
                  <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>{pharmacy.address}</Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: pharmacy.isOpen ? '#D1FAE5' : '#F3F4F6'
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: pharmacy.isOpen ? '#059669' : '#6B7280'
                    }}
                  >
                    {pharmacy.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="location" size={16} color="#EF4444" />
                <Text style={{ color: '#6B7280', fontSize: 14, marginLeft: 4 }}>
                  {pharmacy.distance.toFixed(1)} km away
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => handleCall(pharmacy.phone)}
                  style={{ flex: 1, backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                >
                  <Ionicons name="call" size={18} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleNavigate(pharmacy.latitude, pharmacy.longitude)}
                  style={{ flex: 1, backgroundColor: '#FEE2E2', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                >
                  <Ionicons name="navigate" size={18} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontWeight: '600', marginLeft: 8 }}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* AI Medicine Helper Section */}
        {/* <View style={{ marginHorizontal: 16, marginTop: 24, marginBottom: 50 }}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 999 }}>
                <Ionicons name="sparkles" size={24} color="white" />
              </View>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginLeft: 12 }}>AI Medicine Helper</Text>
            </View>

            <View style={{ backgroundColor: 'white', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search medicine info or shop availability..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ flex: 1, marginLeft: 12, color: '#1F2937', fontSize: 16, paddingVertical: 8 }}
                onSubmitEditing={() => askAI(searchQuery)}
              />
              <TouchableOpacity style={{ marginLeft: 8 }}>
                <Ionicons name="mic" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => askAI(searchQuery)}
              style={{ backgroundColor: 'white', marginTop: 12, paddingVertical: 12, borderRadius: 12 }}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <ActivityIndicator color="#EF4444" />
              ) : (
                <Text style={{ color: '#EF4444', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>
                  Get AI Insights
                </Text>
              )}
            </TouchableOpacity>

            {aiResponse && (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 20, marginTop: 16 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#1F2937', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Description</Text>
                  <Text style={{ color: '#6B7280', fontSize: 14, lineHeight: 20 }}>
                    {aiResponse.description}
                  </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#1F2937', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Availability</Text>
                  <View
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: aiResponse.commonlyAvailable ? '#D1FAE5' : '#FEF3C7'
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons
                        name={aiResponse.commonlyAvailable ? 'checkmark-circle' : 'alert-circle'}
                        size={20}
                        color={aiResponse.commonlyAvailable ? '#10B981' : '#F59E0B'}
                      />
                      <Text style={{ color: '#374151', fontSize: 14, marginLeft: 8, flex: 1 }}>
                        {aiResponse.availability}
                      </Text>
                    </View>
                  </View>
                </View>

                <View>
                  <Text style={{ color: '#1F2937', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Safety Tips</Text>
                  {aiResponse.safetyTips.map((tip, index) => (
                    <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                      <View style={{ backgroundColor: '#EF4444', width: 6, height: 6, borderRadius: 999, marginTop: 8, marginRight: 8 }} />
                      <Text style={{ color: '#6B7280', fontSize: 14, flex: 1 }}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </LinearGradient>
        </View> */}
      </ScrollView>

      {/* Selected Pharmacy Modal */}
      <Modal
        visible={selectedPharmacy !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPharmacy(null)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            {selectedPharmacy && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#1F2937', fontSize: 24, fontWeight: 'bold' }}>
                      {selectedPharmacy.name}
                    </Text>
                    <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>
                      {selectedPharmacy.address}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedPharmacy(null)}>
                    <Ionicons name="close-circle" size={32} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 999,
                      marginRight: 12,
                      backgroundColor: selectedPharmacy.isOpen ? '#D1FAE5' : '#F3F4F6'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: selectedPharmacy.isOpen ? '#059669' : '#6B7280'
                      }}
                    >
                      {selectedPharmacy.isOpen ? 'Open Now' : 'Closed'}
                    </Text>
                  </View>
                  <Ionicons name="location" size={16} color="#EF4444" />
                  <Text style={{ color: '#6B7280', fontSize: 14, marginLeft: 4 }}>
                    {selectedPharmacy.distance.toFixed(1)} km away
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => {
                      handleCall(selectedPharmacy.phone);
                      setSelectedPharmacy(null);
                    }}
                    style={{ flex: 1, backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Ionicons name="call" size={20} color="white" />
                    <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>Call Now</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      handleNavigate(selectedPharmacy.latitude, selectedPharmacy.longitude);
                      setSelectedPharmacy(null);
                    }}
                    style={{ flex: 1, backgroundColor: '#FEE2E2', paddingVertical: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Ionicons name="navigate" size={20} color="#EF4444" />
                    <Text style={{ color: '#EF4444', fontWeight: 'bold', marginLeft: 8 }}>Navigate</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
         
      </Modal>
      <View className='h-28'></View>
    </View>
    
  );
}