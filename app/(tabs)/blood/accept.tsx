import { API_URL } from '@/utils/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient';

// =========================
// TYPES
// =========================

export type BloodInventory = Record<string, number>;

export interface BloodBank {
  id: string;
  name: string;
  location: string;
  district: string;
  phone: string;
  email: string;
  image: string;
  available_groups: string[];
  inventory: BloodInventory;
}

export interface Donor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    gender: string;
    address?: {
      city?: string;
      district?: string;
      state?: string;
      pincode?: string;
    }[];
  };
  Age: string;
  Weight: string;
  Hb: string;
  Bp: string;
  bloodgroup:
    | "A+"
    | "A-"
    | "B+"
    | "B-"
    | "AB+"
    | "AB-"
    | "O+"
    | "O-";
  likeToDonate: ("whole Blood" | "Plasma" | "Platelets" | "RBC" | "WBC")[];
  DonationHistory: {
    donatePreviously: "yes" | "no";
    lastDonationDate?: string;
  }[];
  recentActivities: string[];
  diseases: string[];
  medications: string[];
  surgeriesHistory: string[];
  shareLocation: boolean;
  district?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ALL_DISTRICTS: string[] = [
  // --- ANDHRA PRADESH ---
  'Alluri Sitarama Raju',
  'Anakapalli',
  'Ananthapur',
  'Bapatla',
  'Chittoor',
  'East Godavari',
  'Eluru',
  'Guntur',
  'Kadapa',
  'Kakinada',
  'Konaseema',
  'Krishna',
  'Kurnool',
  'Nandyal',
  'Nellore',
  'NTR',
  'Palnadu',
  'Prakasam',
  'Srikakulam',
  'Tirupati',
  'Visakhapatnam',
  'Vizianagaram',
  'West Godavari',

  // --- TELANGANA ---
  'Adilabad',
  'Bhadradri Kothagudem',
  'Hanamkonda',
  'Hyderabad',
  'Jagtial',
  'Jangaon',
  'Jayashankar Bhupalpally',
  'Jogulamba Gadwal',
  'Kamareddy',
  'Karimnagar',
  'Khammam',
  'Kumuram Bheem Asifabad',
  'Mahabubabad',
  'Mahabubnagar',
  'Mancherial',
  'Medak',
  'Medchal Malkajgiri',
  'Mulugu',
  'Nagarkurnool',
  'Nalgonda',
  'Narayanpet',
  'Nirmal',
  'Nizamabad',
  'Peddapalli',
  'Rajanna Sircilla',
  'Rangareddy',
  'Sangareddy',
  'Siddipet',
  'Suryapet',
  'Vikarabad',
  'Wanaparthy',
  'Warangal',
  'Yadadri Bhuvanagiri',
].sort((a, b) => a.localeCompare(b));

const INITIAL_BLOOD_BANKS: BloodBank[] = [
  {
    id: 'b1',
    name: 'Krishna District Blood Bank',
    location: 'Vijayawada',
    district: 'Krishna',
    phone: '+91 9876543210',
    email: 'krishna.bloodbank@example.com',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=BB',
    available_groups: ['A+', 'AB+', 'AB-', 'O+', 'O-', 'A-', 'B+', 'B-'],
    inventory: {
      'A+': 15,
      'A-': 8,
      'B+': 12,
      'B-': 5,
      'AB+': 7,
      'AB-': 3,
      'O+': 20,
      'O-': 10,
    },
  },
  {
    id: 'b2',
    name: 'West Godavari Red Cross',
    location: 'Eluru',
    district: 'West Godavari',
    phone: '+91 9123456780',
    email: 'wg.redcross@example.com',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=BB',
    available_groups: ['A+', 'AB+', 'AB-', 'O+', 'O-', 'A-', 'B+', 'B-'],
    inventory: {
      'A+': 10,
      'A-': 4,
      'B+': 8,
      'B-': 3,
      'AB+': 5,
      'AB-': 2,
      'O+': 15,
      'O-': 6,
    },
  },
  {
    id: 'b3',
    name: 'Guntur Government Blood Bank',
    location: 'Guntur',
    district: 'Guntur',
    phone: '+91 9032441188',
    email: 'guntur.bb@example.com',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=BB',
    available_groups: ['A+', 'AB+', 'AB-', 'O+', 'O-', 'A-', 'B+', 'B-'],
    inventory: {
      'A+': 18,
      'A-': 6,
      'B+': 10,
      'B-': 4,
      'AB+': 8,
      'AB-': 2,
      'O+': 25,
      'O-': 12,
    },
  },
  {
    id: 'b4',
    name: 'Rajahmundry Red Cross',
    location: 'Rajahmundry',
    district: 'East Godavari',
    phone: '+91 8899776655',
    email: 'eg.redcross@example.com',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=BB',
    available_groups: ['A+', 'AB+', 'AB-', 'O+', 'O-', 'A-', 'B+', 'B-'],
    inventory: {
      'A+': 12,
      'A-': 5,
      'B+': 14,
      'B-': 6,
      'AB+': 4,
      'AB-': 1,
      'O+': 18,
      'O-': 7,
    },
  },
];

const Accept: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donors' | 'banks'>('donors');
  const [searchBloodGroup, setSearchBloodGroup] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);

  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>(INITIAL_BLOOD_BANKS);

  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [selectedBankForInventory, setSelectedBankForInventory] = useState<BloodBank | null>(null);
  const [tempInventory, setTempInventory] = useState<BloodInventory>({});

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);

  // NEW: State for request confirmation modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBankForRequest, setSelectedBankForRequest] = useState<BloodBank | null>(null);

  const getDonors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/blood/getdonations`);
      if (res.data.success) setDonors(res.data.donors);
      console.log(res.data.donors)
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const sendMailToDonor = async (donorMail: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/mail/send`, 
        { donorMail },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", response.data.message || "Mail sent successfully");
      } else {
        Alert.alert("Error", response.data.message || "Failed to send mail");
      }
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      Alert.alert("Error", "Something went wrong while sending mail");
    }
  };

  // NEW: Function to handle blood bank request
  const handleBloodBankRequest = async (bank: BloodBank) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      // Set selected bank and show modal
      setSelectedBankForRequest(bank);
      setShowRequestModal(true);

      // Optional: Send request to backend
      // const response = await axios.post(
      //   `${API_URL}/api/blood/request-from-bank`,
      //   { 
      //     bankId: bank.id,
      //     bankEmail: bank.email,
      //     bankName: bank.name
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

    } catch (error: any) {
      console.log(error.response?.data || error.message);
      Alert.alert("Error", "Something went wrong while sending request");
    }
  };

  useEffect(() => {
    getDonors();
  }, []);
  
  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      const bloodMatch = searchBloodGroup
        ? d.bloodgroup.toLowerCase() === searchBloodGroup.toLowerCase()
        : true;

      const donorDistrict =
        d.user?.address?.[0]?.district?.trim().toLowerCase() || "";

      const districtMatch =
        selectedDistrict === "All Districts"
          ? true
          : donorDistrict === selectedDistrict.toLowerCase();

      return bloodMatch && districtMatch;
    });
  }, [donors, searchBloodGroup, selectedDistrict]);

  const filteredBanks = useMemo(() => {
    return bloodBanks.filter(b =>
      selectedDistrict === 'All Districts' ? true : b.district === selectedDistrict
    );
  }, [bloodBanks, selectedDistrict]);

  const openInventoryModal = (bank: BloodBank) => {
    setSelectedBankForInventory(bank);
    setTempInventory(bank.inventory || {});
    setInventoryModalVisible(true);
  };

  const closeInventoryModal = () => {
    setInventoryModalVisible(false);
    setSelectedBankForInventory(null);
    setTempInventory({});
  };

  const saveInventory = () => {
    if (!selectedBankForInventory) return;
    setBloodBanks(prev =>
      prev.map(b =>
        b.id === selectedBankForInventory.id ? { ...b, inventory: { ...tempInventory } } : b
      )
    );
    Alert.alert('Success', 'Blood inventory updated!');
    closeInventoryModal();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mx-6 mb-6 w-full ml-0 mt-[-10]">
          <LinearGradient
            colors={["#ef4444", "#dc2626", "#b91c1c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl p-4 shadow-2xl relative overflow-hidden"
          >
            <View className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-white/10" />
            <View className="absolute -left-10 -bottom-10 w-24 h-24 rounded-full bg-white/10" />

            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-2xl bg-white/25 items-center justify-center mr-3">
                <Ionicons name="water" size={22} color="white" />
              </View>
            </View>

            <Text className="text-4xl font-extrabold text-white text-center mb-1">
              Accept Blood
            </Text>
            <Text className="text-center text-white/90 text-sm">
              Search donors & blood banks
            </Text>

            <View className="mt-3 flex-row justify-between items-center">
              <Text className="text-white/80 text-xs">Stay connected — request instantly</Text>
              <View className="bg-white/20 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">Quick Search</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Tabs */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full mr-2 border ${activeTab === 'donors' ? 'bg-red-700 border-red-700' : 'bg-white border-red-300'}`}
            onPress={() => setActiveTab('donors')}
          >
            <Text className={`font-semibold ${activeTab === 'donors' ? 'text-white' : 'text-red-800'}`}>
              Donors
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${activeTab === 'banks' ? 'bg-red-700 border-red-700' : 'bg-white border-red-300'}`}
            onPress={() => setActiveTab('banks')}
          >
            <Text className={`font-semibold ${activeTab === 'banks' ? 'text-white' : 'text-red-800'}`}>
              Blood Banks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View className="mb-4">
          <Text className="font-semibold text-red-900 mb-2">Search by Blood Group</Text>

          <TouchableOpacity
            className="rounded-lg p-3 bg-white border border-red-200"
            onPress={() => setShowBloodGroupDropdown(true)}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-red-800">{searchBloodGroup || 'Select Blood Group'}</Text>
              <Ionicons name="chevron-down" size={18} color="#DC2626" />
            </View>
          </TouchableOpacity>

          {showBloodGroupDropdown && (
            <Modal transparent animationType="fade">
              <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
                <View className="bg-white rounded-xl w-full max-h-80 p-4 border border-red-200">
                  <ScrollView>
                    <TouchableOpacity
                      className="p-3 border-b border-red-50"
                      onPress={() => {
                        setSearchBloodGroup('');
                        setShowBloodGroupDropdown(false);
                      }}
                    >
                      <Text className="text-base">All Blood Groups</Text>
                    </TouchableOpacity>

                    {ALL_BLOOD_GROUPS.map(group => (
                      <TouchableOpacity
                        key={group}
                        className="p-3 border-b border-red-50 flex-row items-center justify-between"
                        onPress={() => {
                          setSearchBloodGroup(group);
                          setShowBloodGroupDropdown(false);
                        }}
                      >
                        <Text className="text-base">{group}</Text>
                        {searchBloodGroup === group && (
                          <Ionicons name="checkmark" size={18} color="#EF4444" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    className="mt-3 rounded-lg p-3 items-center"
                    onPress={() => setShowBloodGroupDropdown(false)}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#FF6B6B', '#EF4444']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="w-full rounded-lg p-3 items-center"
                    >
                      <Text className="text-white font-bold">Close</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          <Text className="font-semibold text-red-900 mb-2 mt-3">Select District</Text>

          <TouchableOpacity
            className="rounded-lg p-3 bg-white border border-red-200"
            onPress={() => setShowDistrictDropdown(true)}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-red-800">{selectedDistrict || 'Select District'}</Text>
              <Ionicons name="chevron-down" size={18} color="#DC2626" />
            </View>
          </TouchableOpacity>

          {showDistrictDropdown && (
            <Modal transparent animationType="fade">
              <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
                <View className="bg-white rounded-xl w-full max-h-80 p-4 border border-red-200">
                  <ScrollView>
                    {ALL_DISTRICTS.map(dist => (
                      <TouchableOpacity
                        key={dist}
                        className="p-3 border-b border-red-50 flex-row items-center justify-between"
                        onPress={() => {
                          setSelectedDistrict(dist);
                          setShowDistrictDropdown(false);
                        }}
                      >
                        <Text className="text-base">{dist}</Text>
                        {selectedDistrict === dist && (
                          <Ionicons name="checkmark" size={18} color="#EF4444" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    className="mt-3 rounded-lg p-3 items-center"
                    onPress={() => setShowDistrictDropdown(false)}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#FF6B6B', '#EF4444']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="w-full rounded-lg p-3 items-center"
                    >
                      <Text className="text-white font-bold">Close</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </View>

        {/* Donors Tab */}
        {activeTab === 'donors' && (
          <View>
            <Text className="text-xl font-bold text-red-800 mb-2">Available Donors</Text>
            {filteredDonors.length === 0 ? (
              <Text className="text-center text-red-900 mt-2">No donors found</Text>
            ) : (
              filteredDonors.map(donor => (
                <View
                  key={donor._id}
                  className="bg-red-100 p-4 rounded-2xl shadow-md border-l-4 border-red-500 mb-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-red-900">
                        {donor.user.name}({donor.user.gender})
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <MaterialCommunityIcons
                          name="water"
                          size={18}
                          color="#dc2626"
                        />
                        <Text className="ml-2 text-base text-red-700">
                          {donor.Age} yrs, {donor.Weight} kg
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="location-sharp" size={18} color="#3b82f6" />
                        <Text className="ml-2 text-base text-red-600">
                          {donor.user?.address?.[0]
                            ? `${donor.user.address[0]?.city || ""}, ${donor.user.address[0]?.district || ""}`
                            : "Not provided"}
                        </Text>
                      </View>
                    </View>
                    <View className="bg-red-200 px-4 py-2 rounded-full">
                      <Text className="text-red-500 font-bold text-lg">
                        {donor.bloodgroup}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="bg-red-400 mt-4 py-3 rounded-xl"
                    onPress={() => sendMailToDonor(donor.user.email)}
                  >
                    <Text className="text-center text-white font-semibold text-base">
                      Ask for Blood
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Blood Banks Tab */}
        {activeTab === 'banks' && (
          <View>
            <Text className="text-xl font-bold text-red-800 mb-2">Blood Banks</Text>

            {filteredBanks.length === 0 ? (
              <Text className="text-center text-red-900 mt-2">No blood banks found</Text>
            ) : (
              filteredBanks.map(bank => (
                <View key={bank.id} className="mb-4">
                  <LinearGradient
                    colors={['#FFFFFF', '#FFF7F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-4 rounded-2xl shadow-md border border-red-100"
                  >
                    <View className="flex-row items-center">
                      <View className="w-16 h-16 rounded-xl bg-red-100 items-center justify-center">
                        <Ionicons name="medkit-outline" size={32} color="#dc2626" />
                      </View>

                      <View className="ml-3 flex-1">
                        <Text className="text-lg font-bold text-red-900">{bank.name}</Text>
                        <Text className="text-red-700">{bank.location}</Text>
                      </View>
                    </View>

                    <View className="mt-3">
                      <Text className="font-semibold text-red-800 mb-2">Inventory:</Text>

                      <View className="flex-row flex-wrap">
                        {Object.entries(bank.inventory).map(([grp, qty]) => (
                          <View
                            key={grp}
                            className={`px-3 py-1 rounded-md mr-2 mb-2 ${qty > 5 ? 'bg-green-100' : 'bg-red-100'}`}
                            style={{
                              borderWidth: 1,
                              borderColor: qty > 5 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.08)'
                            }}
                          >
                            <Text className="text-red-800 text-sm">{grp}: {qty}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* NEW: Request Button */}
                    <TouchableOpacity
                      className="mt-3 py-3 rounded-xl items-center"
                      onPress={() => handleBloodBankRequest(bank)}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#ef4444', '#dc2626']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="w-full rounded-xl py-3 items-center"
                      >
                        <Text className="text-white font-bold text-base">
                          Request Blood from Bank 
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* NEW: Request Confirmation Modal */}
      <Modal
        visible={showRequestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            {/* Success Icon */}
            <View className="items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center">
                <Ionicons name="checkmark-circle" size={60} color="#22c55e" />
              </View>
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold text-center text-gray-900 mb-2">
              Request Sent!
            </Text>

            {/* Message */}
            <Text className="text-center text-gray-600 mb-1">
              Your blood request has been sent to
            </Text>
            <Text className="text-center font-bold text-red-600 mb-4">
              {selectedBankForRequest?.name}
            </Text>
            <Text className="text-center text-gray-500 text-sm mb-6">
              They will contact you shortly at your registered contact details.
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              className="rounded-xl overflow-hidden"
              onPress={() => setShowRequestModal(false)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-3 items-center"
              >
                <Text className="text-white font-bold text-base">Got it!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Accept;