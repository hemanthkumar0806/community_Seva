import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';

// =========================
// TYPES
// =========================

type BloodInventory = Record<string, number>;

interface BloodBank {
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

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  location: string;
  district: string;
  image: string;
}

// =========================
// ALL DISTRICTS (AP + TG)
// =========================

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

// =========================
// DONORS DATA
// =========================

const DONORS: Donor[] = [
  {
    id: 'd1',
    name: 'Rohit Kumar',
    bloodGroup: 'A+',
    location: 'Vijayawada',
    district: 'Krishna',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D1',
  },
  {
    id: 'd2',
    name: 'Sravani',
    bloodGroup: 'B+',
    location: 'Eluru',
    district: 'West Godavari',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D2',
  },
  {
    id: 'd3',
    name: 'Mahesh',
    bloodGroup: 'O-',
    location: 'Bhimavaram',
    district: 'West Godavari',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D3',
  },
  {
    id: 'd4',
    name: 'Priya Reddy',
    bloodGroup: 'A+',
    location: 'Guntur',
    district: 'Guntur',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D4',
  },
  {
    id: 'd5',
    name: 'Ramesh',
    bloodGroup: 'AB+',
    location: 'Rajahmundry',
    district: 'East Godavari',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D5',
  },

  // Additional donors
  {
    id: 'd6',
    name: 'Lakshmi Narayana',
    bloodGroup: 'O+',
    location: 'Nuzvid',
    district: 'Krishna',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D6',
  },
  {
    id: 'd7',
    name: 'Sunitha',
    bloodGroup: 'B-',
    location: 'Tanuku',
    district: 'West Godavari',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D7',
  },
  {
    id: 'd8',
    name: 'Chaitanya',
    bloodGroup: 'A-',
    location: 'Tenali',
    district: 'Guntur',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D8',
  },
  {
    id: 'd9',
    name: 'Harika',
    bloodGroup: 'O+',
    location: 'Kakinada',
    district: 'East Godavari',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D9',
  },
  {
    id: 'd10',
    name: 'Sandeep',
    bloodGroup: 'B+',
    location: 'Visakhapatnam',
    district: 'Visakhapatnam',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D10',
  },
  {
    id: 'd11',
    name: 'Meghana',
    bloodGroup: 'AB-',
    location: 'Mangalagiri',
    district: 'Guntur',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D11',
  },
  {
    id: 'd12',
    name: 'Venkatesh',
    bloodGroup: 'O-',
    location: 'Ongole',
    district: 'Prakasam',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D12',
  },
  {
    id: 'd13',
    name: 'Alekhya',
    bloodGroup: 'A+',
    location: 'Machilipatnam',
    district: 'Krishna',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D13',
  },
  {
    id: 'd14',
    name: 'Rohini',
    bloodGroup: 'B+',
    location: 'Amalapuram',
    district: 'East Godavari',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D14',
  },
  {
    id: 'd15',
    name: 'Karthik',
    bloodGroup: 'O+',
    location: 'Vizianagaram',
    district: 'Vizianagaram',
    image: 'https://via.placeholder.com/80/fee2e2/dc2626?text=D15',
  },
];

// =========================
// BLOOD BANKS
// =========================

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

// =========================
// MAIN SCREEN
// =========================

const Accept: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donors' | 'banks'>('donors');
  const [searchBloodGroup, setSearchBloodGroup] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);

  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>(INITIAL_BLOOD_BANKS);

  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [selectedBankForInventory, setSelectedBankForInventory] = useState<BloodBank | null>(null);
  const [tempInventory, setTempInventory] = useState<BloodInventory>({});
const ALL_BLOOD_GROUPS: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // ---------------- FILTERS ----------------

  const filteredDonors = useMemo(() => {
    return DONORS.filter((d) => {
      const bloodMatch = searchBloodGroup
        ? d.bloodGroup.toLowerCase().includes(searchBloodGroup.toLowerCase())
        : true;

      const districtMatch =
        selectedDistrict === 'All Districts' ? true : d.district === selectedDistrict;

      return bloodMatch && districtMatch;
    });
  }, [searchBloodGroup, selectedDistrict]);

  const filteredBanks = useMemo(
    () =>
      bloodBanks.filter((b) =>
        selectedDistrict === 'All Districts' ? true : b.district === selectedDistrict
      ),
    [selectedDistrict, bloodBanks]
  );

  // ------------- INVENTORY MODAL -------------

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

    setBloodBanks((prev) =>
      prev.map((b) =>
        b.id === selectedBankForInventory.id ? { ...b, inventory: { ...tempInventory } } : b
      )
    );
    Alert.alert('Success', 'Blood inventory updated!');
    closeInventoryModal();
  };

  // ---------------- UI ----------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Accept Blood</Text>
        <Text style={styles.subtitle}>Search donors & blood banks</Text>

        {/* Main Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>View</Text>

          {/* Tabs */}
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TouchableOpacity
              style={[styles.chip, activeTab === 'donors' && styles.chipSelected]}
              onPress={() => setActiveTab('donors')}
            >
              <Text style={[styles.chipText, activeTab === 'donors' && styles.chipTextSelected]}>
                Donors
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, activeTab === 'banks' && styles.chipSelected]}
              onPress={() => setActiveTab('banks')}
            >
              <Text style={[styles.chipText, activeTab === 'banks' && styles.chipTextSelected]}>
                Blood Banks
              </Text>
            </TouchableOpacity>
          </View>

          {/* Blood Group Search */}
          <View>
  <Text style={styles.label}>Search by Blood Group</Text>
  
  <TouchableOpacity
    style={styles.dropdownButton}
    onPress={() => setShowBloodGroupDropdown(true)}
  >
    <Text style={styles.dropdownButtonText}>
      {searchBloodGroup || 'Select Blood Group'}
    </Text>
  </TouchableOpacity>

  {showBloodGroupDropdown && (
    <Modal transparent animationType="fade">
      <View style={styles.dropdownOverlay}>
        <View style={styles.dropdownBox}>
          <ScrollView>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setSearchBloodGroup('');
                setShowBloodGroupDropdown(false);
              }}
            
            >
              <Text style={styles.dropdownItemText}>All Blood Groups</Text>
            </TouchableOpacity>
            
            {ALL_BLOOD_GROUPS.map((group) => (
              <TouchableOpacity
                key={group}
                style={styles.dropdownItem}
                onPress={() => {
                  setSearchBloodGroup(group);
                  setShowBloodGroupDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{group}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeDropdownBtn}
            onPress={() => setShowBloodGroupDropdown(false)}
          >
            <Text style={styles.closeDropdownText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )}
</View>
          <Text style={styles.label}>Select District</Text>

<TouchableOpacity
  style={styles.dropdownButton}
  onPress={() => setShowDistrictDropdown(true)}
>
  <Text style={styles.dropdownButtonText}>
    {selectedDistrict}
  </Text>
</TouchableOpacity>

{showDistrictDropdown && (
  <Modal transparent animationType="fade">
    <View style={styles.dropdownOverlay}>
      <View style={styles.dropdownBox}>
        <ScrollView>
          {ALL_DISTRICTS.map((dist) => (
            <TouchableOpacity
              key={dist}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedDistrict(dist);
                setShowDistrictDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{dist}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.closeDropdownBtn}
          onPress={() => setShowDistrictDropdown(false)}
        >
          <Text style={styles.closeDropdownText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}

        </View>

        {/* DONORS TAB */}
        {activeTab === 'donors' && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Available Donors</Text>

            {filteredDonors.length === 0 ? (
              <Text style={styles.infoText}>No donors found</Text>
            ) : (
              filteredDonors.map((donor) => (
                <View key={donor.id} style={[styles.card, { marginTop: 12 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: donor.image }} style={styles.donorImage} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.donorName}>{donor.name}</Text>
                      <Text style={styles.donorText}>Blood: {donor.bloodGroup}</Text>
                      <Text style={styles.donorText}>Location: {donor.location}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, { marginTop: 12 }]}
                    onPress={() =>
                      Alert.alert('Request Sent', 'Details will be sent to your email.')
                    }
                  >
                    <Text style={styles.primaryButtonText}>Ask for Blood</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* BLOOD BANKS TAB */}
        {activeTab === 'banks' && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Blood Banks</Text>

            {filteredBanks.length === 0 ? (
              <Text style={styles.infoText}>No blood banks found</Text>
            ) : (
              filteredBanks.map((bank) => (
                <View key={bank.id} style={[styles.card, { marginTop: 12 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: bank.image }} style={styles.bankImage} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.bankName}>{bank.name}</Text>
                      <Text style={styles.bankText}>{bank.location}</Text>
                    </View>
                  </View>

                  {/* Inventory */}
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.sectionTitle}>Inventory:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {Object.entries(bank.inventory).map(([grp, qty]) => (
                        <View
                          key={grp}
                          style={[
                            styles.invBadge,
                            { backgroundColor: qty > 5 ? '#dcfce7' : '#fee2e2' },
                          ]}
                        >
                          <Text style={styles.invText}>
                            {grp}: {qty}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.secondaryButton, { marginTop: 12 }]}
                    onPress={() => openInventoryModal(bank)}
                  >
                    <Text style={styles.secondaryButtonText}>Update Inventory</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* INVENTORY MODAL */}
      <Modal visible={inventoryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedBankForInventory?.name}</Text>

              {selectedBankForInventory?.available_groups.map((grp) => (
                <View key={grp} style={{ marginBottom: 10 }}>
                  <Text style={styles.label}>{grp}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(tempInventory[grp] ?? 0)}
                    onChangeText={(txt) =>
                      setTempInventory((prev) => ({
                        ...prev,
                        [grp]: Number.isNaN(parseInt(txt, 10)) ? 0 : parseInt(txt, 10),
                      }))
                    }
                  />
                </View>
              ))}

              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginRight: 8 }]}
                  onPress={saveInventory}
                >
                  <Text style={styles.primaryButtonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, { flex: 1, marginLeft: 8 }]}
                  onPress={closeInventoryModal}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
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

// =========================
// STYLES
// =========================

const PRIMARY_RED = '#dc2626';
const LIGHT_RED = '#fee2e2';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: LIGHT_RED },
  scrollContent: { padding: 16 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: PRIMARY_RED,
    textAlign: 'center',
  },
  subtitle: { textAlign: 'center', color: '#7f1d1d', marginBottom: 14 },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    elevation: 3,
  },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#7f1d1d' },

  label: { marginTop: 12, fontWeight: '600', color: '#450a0a' },

  input: {
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 8,
    marginTop: 4,
    backgroundColor: '#fff',
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginRight: 8,
  },
  chipSelected: { backgroundColor: PRIMARY_RED, borderColor: PRIMARY_RED },
  chipText: { color: '#450a0a' },
  chipTextSelected: { color: '#fff' },

  dropdown: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    maxHeight: 300,
  },
  dropdownSelected: { backgroundColor: PRIMARY_RED },
  dropdownText: { color: '#450a0a' },
  dropdownTextSelected: { color: '#fff', fontWeight: '700' },

  donorImage: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fee2e2' },
  donorName: { fontSize: 16, fontWeight: '700', color: '#450a0a' },
  donorText: { color: '#7f1d1d' },

  bankImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#fee2e2' },
  bankName: { fontSize: 16, fontWeight: '700', color: '#450a0a' },
  bankText: { color: '#7f1d1d', marginTop: 4 },

  invBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  invText: { fontSize: 12, color: '#450a0a' },

  primaryButton: {
    backgroundColor: PRIMARY_RED,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },

  secondaryButton: {
    borderWidth: 1,
    borderColor: PRIMARY_RED,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: { color: PRIMARY_RED, fontWeight: '700' },

  infoText: { textAlign: 'center', marginTop: 10, color: '#450a0a' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    color: PRIMARY_RED,
  },
dropdownButton: {
  borderWidth: 1,
  borderColor: "#fecaca",
  borderRadius: 10,
  padding: 12,
  backgroundColor: "#fff",
},

dropdownContainer: {
  width: "90%",
  borderRadius: 10,
  backgroundColor: "#fff",
  borderColor: "#fecaca",
  borderWidth: 1,
},

dropdownTextBox: {
  fontSize: 16,
  color: "#450a0a",
},

dropdownItemTextSelected: {
  color: PRIMARY_RED,
  fontWeight: "bold",
},

dropdownButtonText: {
  fontSize: 16,
  color: "#450a0a",
},

dropdownOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
},

dropdownBox: {
  width: "100%",
  maxHeight: "70%",
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: "#fecaca",
},

dropdownItem: {
  padding: 14,
  borderBottomWidth: 1,
  borderBottomColor: "#fce7e7",
},

dropdownItemText: {
  fontSize: 16,
  color: "#450a0a",
},

closeDropdownBtn: {
  backgroundColor: PRIMARY_RED,
  padding: 12,
  borderRadius: 10,
  marginTop: 10,
  alignItems: "center",
},

closeDropdownText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "700",
},


});
