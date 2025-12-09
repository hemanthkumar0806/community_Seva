import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ---------- COLOR PALETTE (RED THEME) ----------
const PRIMARY_RED = '#dc2626';
const LIGHT_BG = '#fee2e2';
const CARD_BG = '#ffffff';
const BORDER = '#fecaca';
const TEXT_DARK = '#450a0a';

// ---------------- HOSPITAL / ORG DATA ----------------

const ORGANISATIONS = [
  {
    id: 'o1',
    name: 'City Life Organ Donation Center',
    location: 'Vijayawada',
    type: 'Government Approved Hospital',
    contact: '+91 98765 12345',
  },
  {
    id: 'o2',
    name: 'Hope Organ & Tissue Bank',
    location: 'Visakhapatnam',
    type: 'Charitable Trust',
    contact: '+91 91234 56780',
  },
  {
    id: 'o3',
    name: 'Dadhichi Body / Organ Donation Cell',
    location: 'Hyderabad',
    type: 'NGO – Body & Organ Donation',
    contact: '+91 99888 77665',
  },
];

// ---------------- MAIN COMPONENT ----------------

const donate = () => {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // --- Form fields (unchanged) ---
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  const [donationScope, setDonationScope] = useState<'all' | 'specific'>('all');

  const [organs, setOrgans] = useState({
    eyes: false,
    heart: false,
    lungs: false,
    kidneys: false,
    liver: false,
    skin: false,
    bone: false,
    pancreas: false,
    intestine: false,
  });

  const [purpose, setPurpose] = useState<'research' | 'transplant' | 'both'>(
    'both'
  );

  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState('');

  const selectedOrg = ORGANISATIONS.find((o) => o.id === selectedOrgId) || null;

  const toggleOrgan = (key: keyof typeof organs) => {
    setOrgans((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // When user taps an organisation: select it and open the modal
  const handleSelectOrg = (id: string) => {
    setSelectedOrgId(id);
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!selectedOrg) {
      Alert.alert('Select Organisation', 'Please choose a hospital/organisation first.');
      return;
    }

    const payload = {
      organisation: selectedOrg,
      personalDetails: {
        height,
        weight,
        bloodGroup,
      },
      donationDetails: {
        donationScope,
        organs,
        purpose,
      },
      notes,
      signature,
      submittedAt: new Date().toISOString(),
    };

    console.log('Organ Donation Form Submission:', payload);

    Alert.alert(
      'Thank you!',
      'Your organ donation pledge has been recorded successfully.'
    );

    // close modal after submit
    setModalVisible(false);
  };

  // ---------------- RENDER ----------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.headerBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="heart-outline" size={26} color={PRIMARY_RED} />
            </View>
            <Text style={styles.title}>Organ Donation</Text>
            <Text style={styles.subtitle}>
              Choose an organisation and pledge your organs to give someone a
              second chance at life.
            </Text>
          </View>

          {/* Organisations list */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Hospital / Organisation</Text>

            {ORGANISATIONS.map((org) => {
              const isActive = org.id === selectedOrgId;
              return (
                <TouchableOpacity
                  key={org.id}
                  style={[styles.orgCard, isActive && styles.orgCardActive]}
                  onPress={() => handleSelectOrg(org.id)}
                >
                  <View style={styles.orgIconBox}>
                    <Ionicons
                      name="business-outline"
                      size={20}
                      color={isActive ? '#fff' : PRIMARY_RED}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.orgName,
                        isActive && { color: '#fff' },
                      ]}
                    >
                      {org.name}
                    </Text>
                    <Text
                      style={[
                        styles.orgLine,
                        isActive && { color: '#fee2e2' },
                      ]}
                    >
                      {org.location} • {org.type}
                    </Text>
                    <Text
                      style={[
                        styles.orgLine,
                        isActive && { color: '#fecaca' },
                      ]}
                    >
                      Contact: {org.contact}
                    </Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={22} color="#fecaca" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Modal with the pledge form */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Pledge Form
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={22} color={TEXT_DARK} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  contentContainerStyle={{ paddingBottom: 30 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.sectionTitle}>
                    Donor Details – {selectedOrg?.name}
                  </Text>

                  {/* Health info */}
                  <Text style={styles.sectionHeader}>Health Information</Text>

                  <View style={styles.row}>
                    <View style={[styles.inputWrapper, { marginRight: 6 }]}>
                      <Text style={styles.label}>Height (cm)</Text>
                      <TextInput
                        style={styles.input}
                        value={height}
                        onChangeText={setHeight}
                        keyboardType="numeric"
                        placeholder="e.g. 170"
                      />
                    </View>
                    <View style={[styles.inputWrapper, { marginLeft: 6 }]}>
                      <Text style={styles.label}>Weight (kg)</Text>
                      <TextInput
                        style={styles.input}
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                        placeholder="e.g. 65"
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputWrapper, { marginRight: 6 }]}>
                      <Text style={styles.label}>Blood Group</Text>
                      <TextInput
                        style={styles.input}
                        value={bloodGroup}
                        onChangeText={setBloodGroup}
                        placeholder="e.g. B+"
                      />
                    </View>
                  </View>

                  {/* Donation preferences */}
                  <Text style={styles.sectionHeader}>Donation Preference</Text>

                  <Text style={styles.labelSmall}>
                    Once my death has been confirmed, I give permission to donate:
                  </Text>

                  <View style={styles.chipRow}>
                    {[
                      { key: 'all', label: 'All organs & tissues' },
                      { key: 'specific', label: 'Specific organs / tissues' },
                    ].map((opt) => {
                      const active = donationScope === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[
                            styles.chip,
                            active && styles.chipActive,
                          ]}
                          onPress={() =>
                            setDonationScope(opt.key as 'all' | 'specific')
                          }
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && styles.chipTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {donationScope === 'specific' && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={styles.labelSmall}>
                        Select organs / tissues you wish to donate:
                      </Text>
                      <View style={styles.organsGrid}>
                        {[
                          ['eyes', 'Eyes'],
                          ['heart', 'Heart'],
                          ['lungs', 'Lungs'],
                          ['kidneys', 'Kidneys'],
                          ['liver', 'Liver'],
                          ['skin', 'Skin'],
                          ['bone', 'Bones'],
                          ['pancreas', 'Pancreas'],
                          ['intestine', 'Intestine'],
                        ].map(([key, label]) => {
                          const k = key as keyof typeof organs;
                          const checked = organs[k];
                          return (
                            <TouchableOpacity
                              key={key}
                              style={[
                                styles.checkboxPill,
                                checked && styles.checkboxPillActive,
                              ]}
                              onPress={() => toggleOrgan(k)}
                            >
                              <Ionicons
                                name={
                                  checked ? 'checkbox-outline' : 'square-outline'
                                }
                                size={16}
                                color={checked ? '#fff' : PRIMARY_RED}
                              />
                              <Text
                                style={[
                                  styles.checkboxPillText,
                                  checked && { color: '#fff' },
                                ]}
                              >
                                {label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Purpose */}
                  <Text style={styles.sectionHeader}>Purpose of Donation</Text>
                  <Text style={styles.labelSmall}>
                    I authorize my organs / tissues to be used for:
                  </Text>

                  <View style={styles.chipRow}>
                    {[
                      { key: 'research', label: 'Research only' },
                      { key: 'transplant', label: 'Transplant only' },
                      { key: 'both', label: 'Research & Transplant' },
                    ].map((p) => {
                      const active = purpose === p.key;
                      return (
                        <TouchableOpacity
                          key={p.key}
                          style={[
                            styles.chip,
                            active && styles.chipActive,
                          ]}
                          onPress={() =>
                            setPurpose(
                              p.key as 'research' | 'transplant' | 'both'
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && styles.chipTextActive,
                            ]}
                          >
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Notes */}
                  <Text style={styles.sectionHeader}>Notes / Medical History</Text>
                  <Text style={styles.labelSmall}>
                    Add any important information (diseases, medicines, allergies, etc.).
                  </Text>
                  <TextInput
                    style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                    multiline
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="If there is nothing to add, you can write 'None'."
                  />
                  {/* Signature */}
                  <Text style={styles.sectionHeader}>Donor&apos;s Signature</Text>
                  <Text style={styles.labelSmall}>
                    Type your full name here as a digital signature.
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={signature}
                    onChangeText={setSignature}
                    placeholder="Sign here"
                  />

                  {/* Consent text */}
                  <Text style={styles.consentText}>
                    By submitting this form, I confirm that I wish to pledge my
                    organs/tissues after my death for the purposes selected above. I
                    understand this is a voluntary decision and my family will be
                    informed. I will also discuss this wish with my family members /
                    guardian.
                  </Text>

                  {/* Submit */}
                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Ionicons name="hand-left-outline" size={18} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Pledge</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default donate;

// ---------------- STYLES (red theme only) ----------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  headerBox: {
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffe4e6',
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  subtitle: {
    fontSize: 13,
    color: '#7f1d1d',
    textAlign: 'center',
    marginTop: 4,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: '#7f1d1d',
    marginBottom: 8,
  },
  sectionBadge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY_RED,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 6,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
    marginTop: 12,
    marginBottom: 6,
  },

  // Organisation cards
  orgCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 8,
    backgroundColor: '#fff7f7',
  },
  orgCardActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  orgIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  orgName: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  orgLine: {
    fontSize: 11,
    color: '#7f1d1d',
    marginTop: 2,
  },

  // Inputs
  row: {
    flexDirection: 'row',
    marginTop: 8,
  },
  inputWrapper: {
    flex: 1,
    marginTop: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 2,
  },
  labelSmall: {
    fontSize: 11,
    color: '#7f1d1d',
    marginBottom: 4,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#fff',
    color: TEXT_DARK,
  },

  // Chips / toggles
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff7f7',
    marginRight: 8,
    marginTop: 6,
  },
  chipActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  chipText: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Organs checkbox pills
  organsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  checkboxPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginTop: 6,
    backgroundColor: '#fff7f7',
  },
  checkboxPillActive: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  checkboxPillText: {
    fontSize: 12,
    color: '#7f1d1d',
    marginLeft: 4,
  },

  consentText: {
    fontSize: 11,
    color: '#7f1d1d',
    marginTop: 12,
    lineHeight: 16,
  },

  submitButton: {
    marginTop: 16,
    backgroundColor: PRIMARY_RED,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  closeButton: {
    padding: 6,
    borderRadius: 8,
  },
});
