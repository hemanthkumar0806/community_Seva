import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import React, { useState } from 'react';

const PRIMARY_RED = '#dc2626';
const LIGHT_RED = '#fee2e2';

interface Hospital {
  id: string;
  name: string;
  location: string;
  district: string;
  image: string;
  phone: string;
  email: string;
  fullAddress: string;
  availableOrgans: string[];
}

const AcceptScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [editingOrgans, setEditingOrgans] = useState(false);
  const [tempAvailableOrgans, setTempAvailableOrgans] = useState<string[]>([]);

  // Sample hospital data
  const [hospitals, setHospitals] = useState<Hospital[]>([
    {
      id: '1',
      name: 'Apollo Hospital',
      location: 'Vijayawada',
      district: 'Krishna',
      image: 'https://via.placeholder.com/150',
      phone: '+91 866 2429999',
      email: 'apollo.vijayawada@hospitals.com',
      fullAddress: 'NH-5, Benz Circle, Vijayawada, Krishna District, Andhra Pradesh - 520008',
      availableOrgans: ['Heart', 'Kidney', 'Liver', 'Lungs'],
    },
    {
      id: '2',
      name: 'Manipal Hospital',
      location: 'Vijayawada',
      district: 'Krishna',
      image: 'https://via.placeholder.com/150',
      phone: '+91 866 6712345',
      email: 'manipal.vjw@hospitals.com',
      fullAddress: 'Near KCR Towers, Governorpet, Vijayawada, Krishna District - 520002',
      availableOrgans: ['Kidney', 'Liver', 'Cornea'],
    },
    {
      id: '3',
      name: 'KIMS Hospital',
      location: 'Guntur',
      district: 'Guntur',
      image: 'https://via.placeholder.com/150',
      phone: '+91 863 2234567',
      email: 'kims.guntur@hospitals.com',
      fullAddress: 'Arundelpet, Guntur, Andhra Pradesh - 522002',
      availableOrgans: ['Heart', 'Liver', 'Pancreas'],
    },
    {
      id: '4',
      name: 'Sri Ramachandra Hospital',
      location: 'Visakhapatnam',
      district: 'Visakhapatnam',
      image: 'https://via.placeholder.com/150',
      phone: '+91 891 2567890',
      email: 'sriramachandra.vizag@hospitals.com',
      fullAddress: 'Beach Road, Visakhapatnam, Andhra Pradesh - 530002',
      availableOrgans: ['Kidney', 'Cornea', 'Skin'],
    },
  ]);

  // MASTER organs list used only for editing UI (you can extend or fetch it)
  const organsList = ['Heart', 'Kidney', 'Liver', 'Lungs', 'Pancreas', 'Cornea', 'Skin'];

  // Single search bar filter: searches name, location, district, fullAddress, and organs
  const q = searchQuery.trim().toLowerCase();
  const filteredHospitals = hospitals.filter((hospital) => {
    if (!q) return true;
    const inName = hospital.name.toLowerCase().includes(q);
    const inLocation = hospital.location.toLowerCase().includes(q);
    const inDistrict = hospital.district.toLowerCase().includes(q);
    const inFullAddress = hospital.fullAddress.toLowerCase().includes(q);
    const inOrgans = hospital.availableOrgans.some((o) => o.toLowerCase().includes(q));
    return inName || inLocation || inDistrict || inFullAddress || inOrgans;
  });

  const handleHospitalPress = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setTempAvailableOrgans([...hospital.availableOrgans]);
    setEditingOrgans(false);
  };

  const handleOrganToggle = (organ: string) => {
    if (tempAvailableOrgans.includes(organ)) {
      setTempAvailableOrgans((prev) => prev.filter((o) => o !== organ));
    } else {
      setTempAvailableOrgans((prev) => [...prev, organ]);
    }
  };

  const handleSaveOrgans = () => {
    if (!selectedHospital) return;
    const updatedHospitals = hospitals.map((h) =>
      h.id === selectedHospital.id ? { ...h, availableOrgans: tempAvailableOrgans } : h
    );
    setHospitals(updatedHospitals);
    setSelectedHospital({ ...selectedHospital, availableOrgans: tempAvailableOrgans });
    setEditingOrgans(false);
  };

  const renderHospitalCard = ({ item }: { item: Hospital }) => (
    <TouchableOpacity
      style={styles.hospitalCard}
      onPress={() => handleHospitalPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.hospitalImage} />
      <View style={styles.hospitalInfo}>
        <Text style={styles.hospitalName}>{item.name}</Text>
        <Text style={styles.hospitalLocation}>📍 {item.location}</Text>
        <Text style={styles.hospitalDistrict}>{item.district} District</Text>
      </View>
      <Text style={styles.viewDetailsText}>View →</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollContent}>
        <Text style={styles.title}>🏥 Hospitals</Text>
        <Text style={styles.subtitle}>Find hospitals accepting organ donations</Text>

        {/* Search Section (single search bar for everything) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Search Hospitals</Text>

          <Text style={styles.label}>Search (name / location / district / organ)</Text>
          <TextInput
            style={styles.input}
            placeholder="Search by name, location, district or organ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={[styles.secondaryButton, { marginTop: 12 }]}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.secondaryButtonText}>Clear Search</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Results Count */}
        <Text style={styles.resultsText}>
          {filteredHospitals.length} {filteredHospitals.length === 1 ? 'hospital' : 'hospitals'} found
        </Text>

        {/* Hospital List */}
        <FlatList
          data={filteredHospitals}
          renderItem={renderHospitalCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hospitals found matching your criteria</Text>
            </View>
          }
        />
      </ScrollView>

      {/* Hospital Details Modal */}
      <Modal
        visible={selectedHospital !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedHospital(null)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            {selectedHospital && (
              <>
                <Image source={{ uri: selectedHospital.image }} style={styles.modalHospitalImage} />
                <Text style={styles.modalTitle}>{selectedHospital.name}</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📍 Location:</Text>
                  <Text style={styles.detailValue}>{selectedHospital.fullAddress}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📞 Phone:</Text>
                  <Text style={styles.detailValue}>{selectedHospital.phone}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>✉️ Email:</Text>
                  <Text style={styles.detailValue}>{selectedHospital.email}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>🏛️ District:</Text>
                  <Text style={styles.detailValue}>{selectedHospital.district}</Text>
                </View>

                <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                  <View style={styles.organHeader}>
                    <Text style={styles.detailLabel}>🫀 Available Organs:</Text>
                    {!editingOrgans && (
                      <TouchableOpacity style={styles.editButton} onPress={() => setEditingOrgans(true)}>
                        <Text style={styles.editButtonText}>✏️ Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {editingOrgans ? (
                    <>
                      <View style={styles.organEditContainer}>
                        {organsList.map((organ) => (
                          <TouchableOpacity
                            key={organ}
                            style={[styles.chip, tempAvailableOrgans.includes(organ) && styles.chipSelected]}
                            onPress={() => handleOrganToggle(organ)}
                          >
                            <Text style={[styles.chipText, tempAvailableOrgans.includes(organ) && styles.chipTextSelected]}>
                              {organ}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={styles.editActionsRow}>
                        <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginRight: 8 }]} onPress={handleSaveOrgans}>
                          <Text style={styles.primaryButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.secondaryButton, { flex: 1 }]}
                          onPress={() => {
                            setTempAvailableOrgans([...selectedHospital.availableOrgans]);
                            setEditingOrgans(false);
                          }}
                        >
                          <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <View style={styles.organBadgeContainer}>
                      {selectedHospital.availableOrgans.map((organ, index) => (
                        <View key={index} style={styles.invBadge}>
                          <Text style={styles.invText}>{organ}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <TouchableOpacity style={[styles.primaryButton, { marginTop: 20 }]} onPress={() => setSelectedHospital(null)}>
                  <Text style={styles.primaryButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AcceptScreen;

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
    marginBottom: 16,
  },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#7f1d1d', marginBottom: 8 },

  label: { marginTop: 12, fontWeight: '600', color: '#450a0a' },

  input: {
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#450a0a',
  },

  resultsText: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 12,
    fontWeight: '600',
  },

  hospitalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  hospitalImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    marginRight: 12,
  },

  hospitalInfo: {
    flex: 1,
  },

  hospitalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#450a0a',
    marginBottom: 4,
  },

  hospitalLocation: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 2,
  },

  hospitalDistrict: {
    fontSize: 12,
    color: '#991b1b',
  },

  viewDetailsText: {
    fontSize: 14,
    color: PRIMARY_RED,
    fontWeight: '700',
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#7f1d1d',
    textAlign: 'center',
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: PRIMARY_RED, borderColor: PRIMARY_RED },
  chipText: { color: '#450a0a' },
  chipTextSelected: { color: '#fff' },

  primaryButton: {
    backgroundColor: PRIMARY_RED,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  secondaryButton: {
    borderWidth: 1,
    borderColor: PRIMARY_RED,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: { color: PRIMARY_RED, fontWeight: '700', fontSize: 16 },

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
    maxHeight: '90%',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    color: PRIMARY_RED,
  },

  modalHospitalImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    marginBottom: 16,
  },

  detailRow: {
    marginBottom: 16,
    flexDirection: 'row',
  },

  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7f1d1d',
    marginRight: 8,
    minWidth: 100,
  },

  detailValue: {
    fontSize: 14,
    color: '#450a0a',
    flex: 1,
  },

  organHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },

  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: LIGHT_RED,
  },

  editButtonText: {
    color: PRIMARY_RED,
    fontWeight: '700',
    fontSize: 14,
  },

  organBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },

  invBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: LIGHT_RED,
  },

  invText: {
    fontSize: 12,
    color: '#450a0a',
    fontWeight: '600',
  },

  organEditContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  editActionsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  dropdownBox: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#fce7e7',
  },

  dropdownItemText: {
    fontSize: 16,
    color: '#450a0a',
  },

  dropdownItemTextSelected: {
    color: PRIMARY_RED,
    fontWeight: 'bold',
  },

  closeDropdownBtn: {
    backgroundColor: PRIMARY_RED,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  closeDropdownText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
