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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    gender : string ;
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
  likeToDonate: (
    | "whole Blood"
    | "Plasma"
    | "Platelets"
    | "RBC"
    | "WBC"
  )[];
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

// Function to send mail
 const sendMailToDonor = async (donorMail: string) => {
  try {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    // Make the POST request to send mail
    const response = await axios.post(
      `${API_URL}/api/mail/send`, // replace with your actual route
      { donorMail },
      {
        headers: {
          Authorization: `Bearer ${token}`, // send token for verification
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


  useEffect(() => {
    getDonors();
  }, []);

  // Filters
  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      const bloodMatch = searchBloodGroup
        ? d.bloodgroup.toLowerCase() === searchBloodGroup.toLowerCase()
        : true;
      const districtMatch =
        selectedDistrict === 'All Districts' ? true : d.district === selectedDistrict;
      return bloodMatch && districtMatch;
    });
  }, [donors, searchBloodGroup, selectedDistrict]);

  const filteredBanks = useMemo(() => {
    return bloodBanks.filter(b =>
      selectedDistrict === 'All Districts' ? true : b.district === selectedDistrict
    );
  }, [bloodBanks, selectedDistrict]);

  // Inventory Modal
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
        <Text className="text-3xl font-extrabold text-red-700 text-center">
          Accept Blood
        </Text>
        <Text className="text-center text-red-800 mb-4">
          Search donors & blood banks
        </Text>

        {/* Tabs */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full mr-2 border ${activeTab === 'donors' ? 'bg-red-700 border-red-700' : 'bg-white border-red-300'
              }`}
            onPress={() => setActiveTab('donors')}
          >
            <Text
              className={`font-semibold ${activeTab === 'donors' ? 'text-white' : 'text-red-800'
                }`}
            >
              Donors
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${activeTab === 'banks' ? 'bg-red-700 border-red-700' : 'bg-white border-red-300'
              }`}
            onPress={() => setActiveTab('banks')}
          >
            <Text
              className={`font-semibold ${activeTab === 'banks' ? 'text-white' : 'text-red-800'
                }`}
            >
              Blood Banks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View className="mb-4">
          <Text className="font-semibold text-red-900 mb-2">Search by Blood Group</Text>
          <TouchableOpacity
            className="border border-red-300 rounded-lg p-3 bg-white"
            onPress={() => setShowBloodGroupDropdown(true)}
          >
            <Text>{searchBloodGroup || 'Select Blood Group'}</Text>
          </TouchableOpacity>

          {showBloodGroupDropdown && (
            <Modal transparent animationType="fade">
              <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
                <View className="bg-white rounded-xl w-full max-h-80 p-4 border border-red-300">
                  <ScrollView>
                    <TouchableOpacity
                      className="p-3 border-b border-red-100"
                      onPress={() => {
                        setSearchBloodGroup('');
                        setShowBloodGroupDropdown(false);
                      }}
                    >
                      <Text>All Blood Groups</Text>
                    </TouchableOpacity>
                    {ALL_BLOOD_GROUPS.map(group => (
                      <TouchableOpacity
                        key={group}
                        className="p-3 border-b border-red-100"
                        onPress={() => {
                          setSearchBloodGroup(group);
                          setShowBloodGroupDropdown(false);
                        }}
                      >
                        <Text>{group}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    className="bg-red-700 rounded-lg p-3 mt-2 items-center"
                    onPress={() => setShowBloodGroupDropdown(false)}
                  >
                    <Text className="text-white font-bold">Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          <Text className="font-semibold text-red-900 mb-2 mt-3">Select District</Text>
          <TouchableOpacity
            className="border border-red-300 rounded-lg p-3 bg-white"
            onPress={() => setShowDistrictDropdown(true)}
          >
            <Text>{selectedDistrict}</Text>
          </TouchableOpacity>

          {showDistrictDropdown && (
            <Modal transparent animationType="fade">
              <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
                <View className="bg-white rounded-xl w-full max-h-80 p-4 border border-red-300">
                  <ScrollView>
                    {ALL_DISTRICTS.map(dist => (
                      <TouchableOpacity
                        key={dist}
                        className="p-3 border-b border-red-100"
                        onPress={() => {
                          setSelectedDistrict(dist);
                          setShowDistrictDropdown(false);
                        }}
                      >
                        <Text>{dist}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    className="bg-red-700 rounded-lg p-3 mt-2 items-center"
                    onPress={() => setShowDistrictDropdown(false)}
                  >
                    <Text className="text-white font-bold">Close</Text>
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
                        <Ionicons
                          name="location-sharp"
                          size={18}
                          color="#3b82f6"
                        />
                        <Text className="ml-2 text-base text-red-600">
                          {donor.location || 'Not provided'}
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
                <View key={bank.id} className="bg-white p-4 rounded-2xl shadow-md border border-red-200 mb-4">
                  <View className="flex-row items-center">
                    <Image source={{ uri: bank.image }} className="w-16 h-16 rounded-lg bg-red-100" />
                    <View className="ml-3 flex-1">
                      <Text className="text-lg font-bold text-red-900">{bank.name}</Text>
                      <Text className="text-red-700">{bank.location}</Text>
                    </View>
                  </View>

                  <View className="mt-3">
                    <Text className="font-semibold text-red-800 mb-1">Inventory:</Text>
                    <View className="flex-row flex-wrap">
                      {Object.entries(bank.inventory).map(([grp, qty]) => (
                        <View
                          key={grp}
                          className={`px-3 py-1 rounded-md mr-2 mb-2 ${qty > 5 ? 'bg-green-100' : 'bg-red-100'
                            }`}
                        >
                          <Text className="text-red-800 text-sm">{grp}: {qty}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    className="border border-red-700 mt-3 py-2 rounded-xl items-center"
                    onPress={() => openInventoryModal(bank)}
                  >
                    <Text className="text-red-700 font-bold">Update Inventory</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Inventory Modal */}
      <Modal visible={inventoryModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black bg-opacity-50 justify-center p-5">
          <View className="bg-white rounded-2xl p-5 max-h-4/5">
            <ScrollView>
              <Text className="text-center text-2xl font-bold text-red-700 mb-4">
                {selectedBankForInventory?.name}
              </Text>
              {selectedBankForInventory?.available_groups.map(grp => (
                <View key={grp} className="mb-3">
                  <Text className="font-semibold text-red-900 mb-1">{grp}</Text>
                  <TextInput
                    className="border border-red-300 rounded-lg p-2 bg-white"
                    keyboardType="numeric"
                    value={String(tempInventory[grp] ?? 0)}
                    onChangeText={txt =>
                      setTempInventory(prev => ({
                        ...prev,
                        [grp]: Number.isNaN(parseInt(txt, 10)) ? 0 : parseInt(txt, 10),
                      }))
                    }
                  />
                </View>
              ))}

              <View className="flex-row mt-4 space-x-3">
                <TouchableOpacity
                  className="bg-red-700 flex-1 py-3 rounded-lg items-center"
                  onPress={saveInventory}
                >
                  <Text className="text-white font-bold">Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="border border-red-700 flex-1 py-3 rounded-lg items-center"
                  onPress={closeInventoryModal}
                >
                  <Text className="text-red-700 font-bold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Accept;

