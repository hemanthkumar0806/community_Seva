// app/donate.tsx (or donate.js)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
const PRIMARY_RED = '#dc2626';
const LIGHT_RED = '#fee2e2';
const Donate = () => {
  const [handleyes,setHandleYes] = useState(true)
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [hb, setHb] = useState('');
  const [bp, setBp] = useState('');
  const [liveAccess,setLiveAccess] = useState(false);
  const [hasDonatedPreviously, setHasDonatedPreviously] = useState<
    'yes' | 'no' | null
  >(null);
  const [lastDonationDate, setLastDonationDate] = useState('');

  const [recentProcedures, setRecentProcedures] = useState<string[]>([]);
  const [diseases, setDiseases] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [surgeries, setSurgeries] = useState<string[]>([]);

  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [bloodComponents, setBloodComponents] = useState<string[]>([]);

  const [submitted, setSubmitted] = useState(false);
  const [postAnswer, setPostAnswer] = useState<'yes' | 'no' | null>(null);

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [eligibilityResult, setEligibilityResult] = useState<{eligible: boolean, reasons: string[]}|null>(null);
  const toggleFromArray = (
    item: string,
    array: string[],
    setter: (v: string[]) => void
  ) => {
    if (array.includes(item)) {
      setter(array.filter((v) => v !== item));
    } else {
      setter([...array, item]);
    }
  };

  const validateForm = () => {
    const newErrors: { [k: string]: string } = {};

    if (!age.trim()) newErrors.age = 'Age is required';
    if (!weight.trim()) newErrors.weight = 'Weight is required';
    if (!hb.trim()) newErrors.hb = 'Hb is required';
    if (!bp.trim()) newErrors.bp = 'BP is required';
    if (!bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!hasDonatedPreviously)
      newErrors.donatedPreviously = 'Please select an option';
    if (hasDonatedPreviously === 'yes' && !lastDonationDate.trim()) {
      newErrors.lastDonationDate = 'Last donation date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      age,
      weight,
      hb,
      bp,
      bloodGroup,
      bloodComponents,
      hasDonatedPreviously,
      lastDonationDate:
        hasDonatedPreviously === 'yes' ? lastDonationDate : '',
      recentProcedures,
      diseases,
      medications,
      surgeries,
      liveAccess
    };
    const { eligible, reasons } = checkEligibility(payload);
    setEligibilityResult({ eligible, reasons });
    setSubmitted(true);

    console.log('Blood Donation Form data:', payload);
    setPostAnswer(null);
  };

  function checkEligibility(pdata:any) { 
  const reasons: string[] = [];

  // ------------ BASIC PARSING ------------
  const age = parseInt(pdata.age); 
  const weight = parseFloat(pdata.weight); 

  // Hb might be "12.5" or "23/9" → take first number
  const hbMatch = String(pdata.hb || '').match(/[0-9.]+/); 
  const hb = hbMatch ? parseFloat(hbMatch[0]) : NaN;

  // BP: "120/80"
  let systolic: number | null = null;
  let diastolic: number | null = null;
  if (typeof pdata.bp === 'string' && pdata.bp.includes('/')) { 
    const [sys, dia] = pdata.bp.split('/'); 
    systolic = parseInt(sys);
    diastolic = parseInt(dia);
  }

  // ------------ 1. AGE (18–65) ------------
  if (isNaN(age) || age < 18 || age > 65) {
    reasons.push('Age must be between 18 and 65 years.');
  }

  // ------------ 2. WEIGHT (≥ 50 kg) ------------
  if (isNaN(weight) || weight < 50) {
    reasons.push('Weight must be at least 50 kg.');
  }

  // ------------ 3. HAEMOGLOBIN (Hb ≥ 12.5 g/dL) ------------
  if (isNaN(hb) || hb < 12.5) {
    reasons.push('Haemoglobin (Hb) level must be at least 12.5 g/dL.');
  }

  // ------------ 4. BLOOD PRESSURE ------------
  // Systolic: 90–180, Diastolic: 50–100
  if (!systolic || !diastolic) {
    reasons.push('Blood pressure (BP) must be in the format 120/80.');
  } else {
    if (systolic < 90 || systolic > 180) {
      reasons.push('Systolic BP must be between 90 and 180 mmHg.');
    }
    if (diastolic < 50 || diastolic > 100) {
      reasons.push('Diastolic BP must be between 50 and 100 mmHg.');
    }
  }

  // ------------ 5. PREVIOUS DONATION (≥ 3 months gap) ------------
  if (pdata.hasDonatedPreviously === 'yes') {
    if (!pdata.lastDonationDate) {
      reasons.push('Last donation date is required if you have donated previously.');
    } else {
      const last = new Date(pdata.lastDonationDate);
      const today = new Date();

      if (!isNaN(last.getTime())) {
        const diffDays = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays < 90) {
          reasons.push('You must wait at least 3 months (90 days) between donations.');
        }
      } else {
        reasons.push('Last donation date format is invalid.');
      }
    }
  }

  // ------------ 6. DISEASES LOGIC ------------
  const diseases: string[] = pdata.diseases || [];

  const permanentDiseases = [
    'Heart Disease',
    'Cancer / Malignant Disease',
    'Hepatitis B/C',
    'Sexually Transmitted Diseases',
    'Kidney Disease',
    'Epilepsy',
    'Abnormal bleeding tendency',
  ];

  const temporaryDiseases = [
    'Diabetes',
    'Typhoid (last one year)',
    'Lung Disease',
    'Tuberculosis',
    'Allergic Disease',
    'Jaundice (last one year)',
    'Malaria (last six months)',
    'Fainting spells',
  ];

  const hasPermanentDisease = diseases.some((d) =>
    permanentDiseases.includes(d)
  );
  const tempDiseaseList = diseases.filter((d) =>
    temporaryDiseases.includes(d)
  );

  if (hasPermanentDisease) {
    reasons.push(
      'You have a medical condition (e.g. heart disease, cancer, hepatitis, kidney disease, epilepsy, or abnormal bleeding) that makes you ineligible to donate blood.'
    );
  }

  if (tempDiseaseList.length > 0) {
    reasons.push(
      `Recent or ongoing illnesses detected: ${tempDiseaseList.join(
        ', '
      )}. You should wait until fully recovered and the required waiting period is over before donating.`
    );
  }

  // ------------ 7. MEDICATIONS (past 72 hours) ------------
  const medications: string[] = pdata.medications || [];
  if (medications.length > 0) {
    reasons.push(
      `You have taken the following in the past 72 hours: ${medications.join(
        ', '
      )}. This may temporarily defer you from donating blood.`
    );
  }

  // ------------ 8. RECENT PROCEDURES (last 6 months) ------------
  const recentProcedures: string[] = pdata.recentProcedures || [];
  if (recentProcedures.length > 0) {
    reasons.push(
      `Recent procedures detected: ${recentProcedures.join(
        ', '
      )}. After tattooing, ear piercing or dental extraction, you usually need to wait up to 6 months before donating.`
    );
  }

  // ------------ 9. SURGERIES / TRANSFUSIONS (last 6 months) ------------
  const surgeries: string[] = pdata.surgeries || []; 
  if (surgeries.length > 0) {
    reasons.push(
      `Recent surgery or blood transfusion detected: ${surgeries.join(
        ', '
      )}. This usually causes temporary deferral from blood donation.`
    );
  }

  // ------------ FINAL RESULT ------------
  return {
    eligible: reasons.length === 0,
    reasons,
  };
}


  if (submitted) {
  const isEligible = eligibilityResult?.eligible;
  const reasons = eligibilityResult?.reasons || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.postContainer}>
        
        {/* If NOT eligible → show reasons */}
        {/* ❌ NOT ELIGIBLE SECTION */}
{!isEligible && (
  <ScrollView 
    contentContainerStyle={{ padding: 20 }}
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.notEligibleCard}>
      <Text style={styles.notEligibleTitle}>
        You are not eligible to donate the blood because:
      </Text>

      {/* Show all reasons */}
      {reasons.map((reason, index) => (
        <View key={index} style={styles.reasonItem}>
          <Text style={styles.reasonBullet}>•</Text>
          <Text style={styles.reasonText}>{reason}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => setSubmitted(false)}
      >
        <Text style={styles.goBackButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
)}

        {/* If eligible → show thank you screen */}
        {isEligible && (
          <>
            <Text style={styles.postTitle}>Thank you for donating blood! ❤️</Text>

            {handleyes && (
              <>
                <Text style={styles.postQuestion}>Have you donated blood?</Text>

                <View style={styles.postButtonsRow}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      setPostAnswer('yes');
                      setHandleYes(false);
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Yes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setPostAnswer('no')}
                  >
                    <Text style={styles.secondaryButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {postAnswer === 'yes' && (
              <Text style={styles.infoText}>
                You have just donated blood. You must wait at least{' '}
                <Text style={styles.bold}>3 months</Text> before donating again.
              </Text>
            )}

            {postAnswer === 'no' && (
              <Text style={styles.infoText}>
                You can donate whenever you are ready. Thank you for supporting blood donation awareness!
              </Text>
            )}
          </>
        )}

      </View>
    </SafeAreaView>
  );
}


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Blood Donation Form</Text>
          {/* <Text style={styles.subtitle}>
            Please fill the details below to check your eligibility to donate
            blood.
          </Text> */}

          <View style={styles.card}>
            {/* Basic details */}
            <Text style={styles.sectionTitle}>Basic Details</Text>

            <Text style={styles.label}>
              Age <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.age && styles.inputError,
              ]}
              value={age}
              onChangeText={(t) => {
                setAge(t);
                if (errors.age) setErrors((e) => ({ ...e, age: '' }));
              }}
              keyboardType="numeric"
              placeholder="Enter your age"
            />
            {errors.age ? (
              <Text style={styles.errorText}>{errors.age}</Text>
            ) : null}

            <Text style={styles.label}>
              Weight (kg) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.weight && styles.inputError]}
              value={weight}
              onChangeText={(t) => {
                setWeight(t);
                if (errors.weight) setErrors((e) => ({ ...e, weight: '' }));
              }}
              keyboardType="numeric"
              placeholder="Enter your weight"
            />
            {errors.weight ? (
              <Text style={styles.errorText}>{errors.weight}</Text>
            ) : null}

            <Text style={styles.label}>
              Hb (g/dL) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
  style={[styles.input, errors.hb && styles.inputError]}
  value={hb}
  onChangeText={(t) => {
    // 1️⃣ Allow only digits and dot
    let cleaned = t.replace(/[^0-9./]/g, '');

    // 2️⃣ Allow only ONE dot in the value
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    setHb(cleaned);

    if (errors.hb) {
      setErrors((e) => ({ ...e, hb: '' }));
    }
  }}
  keyboardType="default"
  placeholder="Enter your Haemoglobin"
/>

            {errors.hb ? (
              <Text style={styles.errorText}>{errors.hb}</Text>
            ) : null}

            <Text style={styles.label}>
              BP (mmHg) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
  style={[styles.input, errors.bp && styles.inputError]}
  value={bp}
  onChangeText={(t) => {
    // Allow only digits and slash
    let cleaned = t.replace(/[^0-9/]/g, '');

    // Allow only ONE slash
    const slashParts = cleaned.split('/');
    if (slashParts.length > 2) {
      cleaned = slashParts[0] + '/' + slashParts.slice(1).join('');
    }

    setBp(cleaned);

    if (errors.bp) {
      setErrors((e) => ({ ...e, bp: '' }));
    }
  }}
  keyboardType="default" // shows slash on Android & iOS
  placeholder="e.g. 120/80"
/>

            {errors.bp ? (
              <Text style={styles.errorText}>{errors.bp}</Text>
            ) : null}

            {/* Blood group */}
            <Text style={styles.sectionTitle}>
              Blood Group <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipRowWrap}>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.chip,
                    bloodGroup === bg && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setBloodGroup(bg);
                    if (errors.bloodGroup)
                      setErrors((e) => ({ ...e, bloodGroup: '' }));
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      bloodGroup === bg && styles.chipTextSelected,
                    ]}
                  >
                    {bg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.bloodGroup ? (
              <Text style={styles.errorText}>{errors.bloodGroup}</Text>
            ) : null}

            {/* Components */}
            <Text style={styles.sectionTitle}>
              What would you like to donate?
            </Text>
            <View style={styles.chipRowWrap}>
              {['Whole Blood', 'Platelets', 'RBC', 'Plasma', 'WBC'].map(
                (comp) => (
                  <TouchableOpacity
                    key={comp}
                    style={[
                      styles.chip,
                      bloodComponents.includes(comp) && styles.chipSelected,
                    ]}
                    onPress={() =>
                      toggleFromArray(comp, bloodComponents, setBloodComponents)
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        bloodComponents.includes(comp) &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {comp}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Donation history */}
            <Text style={styles.sectionTitle}>Donation History</Text>

            <Text style={styles.label}>
              Have you donated previously? <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => {
                  setHasDonatedPreviously('yes');
                  if (errors.donatedPreviously)
                    setErrors((e) => ({ ...e, donatedPreviously: '' }));
                }}
              >
                <View
                  style={[
                    styles.radioOuter,
                    hasDonatedPreviously === 'yes' && styles.radioOuterSelected,
                  ]}
                >
                  {hasDonatedPreviously === 'yes' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => {
                  setHasDonatedPreviously('no');
                  setLastDonationDate('');
                  if (errors.donatedPreviously)
                    setErrors((e) => ({ ...e, donatedPreviously: '' }));
                  if (errors.lastDonationDate)
                    setErrors((e) => ({ ...e, lastDonationDate: '' }));
                }}
              >
                <View
                  style={[
                    styles.radioOuter,
                    hasDonatedPreviously === 'no' && styles.radioOuterSelected,
                  ]}
                >
                  {hasDonatedPreviously === 'no' && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
            {errors.donatedPreviously ? (
              <Text style={styles.errorText}>{errors.donatedPreviously}</Text>
            ) : null}

            <Text style={styles.label}>
              Last time you donated blood
              {hasDonatedPreviously === 'yes' && (
                <Text style={styles.required}> *</Text>
              )}
            </Text>
            <TextInput
              style={[
                styles.input,
                hasDonatedPreviously !== 'yes' && styles.disabledInput,
                errors.lastDonationDate && styles.inputError,
              ]}
              value={lastDonationDate}
              onChangeText={(t) => {
                setLastDonationDate(t);
                if (errors.lastDonationDate)
                  setErrors((e) => ({ ...e, lastDonationDate: '' }));
              }}
              placeholder="YYYY-MM-DD"
              editable={hasDonatedPreviously === 'yes'}
            />
            {errors.lastDonationDate ? (
              <Text style={styles.errorText}>{errors.lastDonationDate}</Text>
            ) : null}

            {/* Last 6 months procedures */}
            <Text style={styles.sectionTitle}>
              In the last six months, have you had any of the following?
            </Text>
            {['Tattooing', 'Ear piercing', 'Dental extraction'].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.checkboxRow}
                onPress={() =>
                  toggleFromArray(item, recentProcedures, setRecentProcedures)
                }
              >
                <View style={styles.checkboxBox}>
                  {recentProcedures.includes(item) && (
                    <Text style={styles.checkboxTick}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{item}</Text>
              </TouchableOpacity>
            ))}

            {/* Diseases */}
            <Text style={styles.sectionTitle}>
              Do you suffer from or have suffered from any of these diseases?
            </Text>
            {[
              'Heart Disease',
              'Cancer / Malignant Disease',
              'Diabetes',
              'Hepatitis B/C',
              'Sexually Transmitted Diseases',
              'Typhoid (last one year)',
              'Lung Disease',
              'Tuberculosis',
              'Allergic Disease',
              'Kidney Disease',
              'Epilepsy',
              'Abnormal bleeding tendency',
              'Jaundice (last one year)',
              'Malaria (last six months)',
              'Fainting spells',
            ].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.checkboxRow}
                onPress={() => toggleFromArray(item, diseases, setDiseases)}
              >
                <View style={styles.checkboxBox}>
                  {diseases.includes(item) && (
                    <Text style={styles.checkboxTick}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{item}</Text>
              </TouchableOpacity>
            ))}

            {/* Medications */}
            <Text style={styles.sectionTitle}>
              Are you taking or have you taken any of these in the past 72 hours?
            </Text>
            {[
              'Antibiotics',
              'Steroids',
              'Aspirin',
              'Vaccinations',
              'Alcohol',
              'Dog bite Rabies vaccine (1 year)',
            ].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.checkboxRow}
                onPress={() =>
                  toggleFromArray(item, medications, setMedications)
                }
              >
                <View style={styles.checkboxBox}>
                  {medications.includes(item) && (
                    <Text style={styles.checkboxTick}>✓</Text>
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{item}</Text>
              </TouchableOpacity>
            ))}

            {/* Surgeries */}
            <Text style={styles.sectionTitle}>
              Any history of surgery or blood transfusion in the past six months?
            </Text>
            {['Major surgery', 'Minor surgery', 'Blood transfusion'].map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.checkboxRow}
                  onPress={() => toggleFromArray(item, surgeries, setSurgeries)}
                >
                  <View style={styles.checkboxBox}>
                    {surgeries.includes(item) && (
                      <Text style={styles.checkboxTick}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{item}</Text>
                </TouchableOpacity>
              )
            )}
            <Text style={styles.sectionTitle}>
              Are you sure to share your live location?
            </Text>
            <View style={styles.liveAccessContainer}>

  {/* YES Option */}
  <TouchableOpacity
    style={styles.liveAccessOption}
    onPress={() => setLiveAccess(true)}
  >
    <View
      style={[
        styles.liveAccessCheckbox,
        liveAccess === true && styles.liveAccessCheckboxSelected,
      ]}
    >
      {liveAccess === true && <Text style={styles.liveAccessTick}>✓</Text>}
    </View>
    <Text style={styles.liveAccessLabel}>YES</Text>
  </TouchableOpacity>

  {/* NO Option */}
  <TouchableOpacity
    style={styles.liveAccessOption}
    onPress={() => setLiveAccess(false)}
  >
    <View
      style={[
        styles.liveAccessCheckbox,
        liveAccess === false && styles.liveAccessCheckboxSelected,
      ]}
    >
      {liveAccess === false && <Text style={styles.liveAccessTick}>✓</Text>}
    </View>
    <Text style={styles.liveAccessLabel}>NO</Text>
  </TouchableOpacity>

</View>




            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Donate;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_RED,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    color: PRIMARY_RED,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#7f1d1d',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
    color: '#7f1d1d',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
    color: '#450a0a',
  },
  required: {
    color: PRIMARY_RED,
  },
  input: {
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#fee2e2',
  },
  inputError: {
    borderColor: PRIMARY_RED,
  },
  errorText: {
    color: PRIMARY_RED,
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioOuterSelected: {
    borderColor: PRIMARY_RED,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY_RED,
  },
  radioLabel: {
    fontSize: 14,
    color: '#450a0a',
  },
  chipRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginRight: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: PRIMARY_RED,
    borderColor: PRIMARY_RED,
  },
  chipText: {
    fontSize: 13,
    color: '#450a0a',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  checkboxTick: {
    fontSize: 14,
    color: PRIMARY_RED,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#450a0a',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: PRIMARY_RED,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  postContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  postTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    color: PRIMARY_RED,
  },
  postQuestion: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#450a0a',
  },
  postButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: PRIMARY_RED,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: PRIMARY_RED,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginHorizontal: 8,
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: PRIMARY_RED,
    fontSize: 15,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
    color: '#450a0a',
  },
  bold: {
    fontWeight: '700',
  },
  notEligibleCard: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 16,
  borderLeftWidth: 6,
  borderLeftColor: PRIMARY_RED,
  elevation: 4,
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
},

notEligibleTitle: {
  fontSize: 18,
  fontWeight: '800',
  color: PRIMARY_RED,
  marginBottom: 14,
  textAlign: 'left',
},

reasonItem: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: 10,
},

reasonBullet: {
  fontSize: 16,
  color: PRIMARY_RED,
  marginRight: 6,
  marginTop: 2,
  fontWeight: 'bold',
},

reasonText: {
  flex: 1,
  fontSize: 15,
  color: '#450a0a',
  lineHeight: 20,
},

goBackButton: {
  marginTop: 5,
  backgroundColor: PRIMARY_RED,
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
},

goBackButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},
checkboxContainer: {
  marginTop: 15,
  flexDirection: "row",
  justifyContent: "center",
  gap: 30,
},

checkboxRowLiveAccess: {
  flexDirection: "row",
  alignItems: "center",
},

// Removed duplicate checkboxBox style definition

checkboxSelected: {
  backgroundColor: "#dc2626",
  borderColor: "#dc2626",
},

liveAccessContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 16,
  gap: 40,
},

liveAccessOption: {
  flexDirection: "row",
  alignItems: "center",
},

liveAccessCheckbox: {
  width: 26,
  height: 26,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: "#dc2626",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#fff",
  marginRight: 10,
},

liveAccessCheckboxSelected: {
  backgroundColor: "#dc2626",
  borderColor: "#dc2626",
},

liveAccessTick: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "800",
},

liveAccessLabel: {
  fontSize: 16,
  fontWeight: "700",
  color: "#450a0a",
},


});

