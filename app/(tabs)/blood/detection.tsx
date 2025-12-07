import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';

// ---------------- CONFIG ----------------

const GOOGLE_AI_API_KEY = 'AIzaSyDv-7D6s5XJSUaCukZtHi96EaSjGnSVJdM';
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent';

// ---------------- TYPES -----------------

interface SelectedFile {
  name: string;
  uri: string;
  mimeType: string;
}

interface BloodOverviewRow {
  parameter: string;
  value: string;
  normalRange: string;
  interpretation: string;
}

interface AnalysisResult {
  bloodOverview: BloodOverviewRow[];
  hasDiseaseRisk: boolean;
  diseaseInfo: string;      // used when hasDiseaseRisk = true
  improvementTips: string;  // used when hasDiseaseRisk = false
  futureRisks: string;      // possible future issues
  preventionTips: string;   // how to prevent / reduce risks
  foodLifestyle: string;    // food + lifestyle suggestions
  slogan: string;
}

// ---------------- PROMPT -----------------

const prompt = `
You are a medical information assistant. A user has uploaded a blood report (image or PDF).

1. Carefully read the report and extract basic blood details such as:
   - RBC
   - WBC
   - Hemoglobin
   - Platelets
   - Any other important parameters visible.

2. Create a clear table-style overview of these values.

3. Decide if there is any clear sign that the person might be at risk for a disease
   based on this report. You are NOT making a medical diagnosis, only describing
   possible concerns.

4. If there is some disease risk, explain it. If there is no clear disease risk,
   explain how to improve blood levels and maintain good health.

5. Explain possible FUTURE risks if current patterns stay abnormal, and how to
   prevent them.

6. Give detailed but simple food and lifestyle suggestions, especially using
   Indian-style foods, vegetables and fruits.

7. End with one short motivational slogan for the user about staying healthy.

// NEW INSTRUCTION:
- Keep all explanations SHORT and EASY TO UNDERSTAND. Use fewer words for all fields except **bloodOverview**, which should remain detailed.

Very important safety rules:
- You are NOT a doctor.
- Do NOT give any final medical diagnosis.
- Always recommend the user to consult a qualified doctor for confirmation.

Return the answer STRICTLY as JSON only, with this EXACT structure:

{
  "bloodOverview": [
    {
      "parameter": "Hemoglobin",
      "value": "14.5 g/dL",
      "normalRange": "13 - 17 g/dL (male)",
      "interpretation": "Normal (brief comment here)"
    }
  ],
  "hasDiseaseRisk": true,
  "diseaseInfo": "If hasDiseaseRisk is true, explain possible diseases or conditions suggested by these values in simple language.",
  "improvementTips": "If hasDiseaseRisk is false, explain how to improve blood levels and maintain good health using simple tips.",
  "futureRisks": "Possible future issues or diseases if these patterns stay abnormal.",
  "preventionTips": "How to prevent or reduce those risks in daily life.",
  "foodLifestyle": "Bullet-style or paragraph tips about diet (vegetables, fruits, Indian foods) and lifestyle (sleep, exercise, water).",
  "slogan": "One short health slogan."
}
`;


// ---------------- COMPONENT -------------


const Analyse: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---------- PICK FILE ----------

  const handlePickFile = async () => {
    try {
      setError(null);
      setAnalysis(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      const allowedExt = ['.jpg', '.jpeg', '.png', '.pdf'];
      const lowerName = asset.name?.toLowerCase() || '';
      const isAllowed = allowedExt.some((ext) => lowerName.endsWith(ext));

      if (!isAllowed) {
        Alert.alert(
          'Unsupported file',
          'Please upload only .jpg, .jpeg, .png or .pdf files.'
        );
        return;
      }

      const mimeType =
        asset.mimeType ||
        (lowerName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

      setSelectedFile({
        name: asset.name || 'report',
        uri: asset.uri,
        mimeType,
      });
    } catch (err: any) {
      console.log('Pick file error:', err?.message || err);
      setError('Failed to pick file. Please try again.');
    }
  };

  // Remove markdown asterisks from Gemini text (for food/lifestyle section)
const stripMarkdownAsterisks = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')        // remove **bold** markers
    .replace(/^\s*\*\s*/gm, '')  // remove leading "* " bullets on each line
    .trim();
};


  // ---------- ANALYSE WITH GEMINI ----------

  const handleAnalyse = async () => {
    try {
      if (!selectedFile) {
        Alert.alert('No report', 'Please upload a blood report first.');
        return;
      }

      setLoading(true);
      setError(null);
      setAnalysis(null);

      const base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: 'base64',
      });

      const body = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: selectedFile.mimeType,
                },
              },
            ],
          },
        ],
      };

      const res = await fetch(`${GEMINI_URL}?key=${GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const rawText = await res.text();
      console.log('Gemini status:', res.status);
      console.log('Gemini raw response:', rawText);

      if (!res.ok) {
        try {
          const errJson = JSON.parse(rawText);
          const msg = errJson?.error?.message || rawText;
          setError(`API Error (${res.status}): ${msg}`);
        } catch {
          setError(`API Error (${res.status}): ${rawText}`);
        }
        return;
      }

      const json = JSON.parse(rawText);
      const text =
        json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') ?? '';

      let parsed: AnalysisResult;

      try {
        // --- strip ```json fences if added ---
        let cleaned = text.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
        }
        if (cleaned.endsWith('```')) {
          cleaned = cleaned.replace(/```$/, '').trim();
        }

        // keep only JSON object between first { and last }
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          cleaned = cleaned.slice(start, end + 1);
        }

        parsed = JSON.parse(cleaned) as AnalysisResult;
      } catch (parseErr) {
        console.log('JSON parse error, raw text:', text);
        // Fallback: put everything into improvementTips
        parsed = {
          bloodOverview: [],
          hasDiseaseRisk: false,
          diseaseInfo: '',
          improvementTips:
            text ||
            'Unable to parse structured response. Read above text and consult a doctor for interpretation.',
          futureRisks:
            'Please consult a qualified doctor to understand any future risks based on your blood report.',
          preventionTips:
            'Maintain a balanced diet, regular exercise, enough sleep, and regular health checkups.',
          foodLifestyle:
            'Eat iron-rich foods, plenty of fruits and vegetables, drink enough water, sleep well, and exercise regularly.',
          slogan: 'Strong blood, strong life – take care of yourself today.',
        };
      }

      setAnalysis(parsed);
    } catch (err: any) {
      console.log('Analyse error (network or code):', err?.message || err);
      setError(
        'Unexpected error while analysing. Check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RENDER ----------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero header */}
        <View style={styles.headerBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="analytics-outline" size={26} color={PRIMARY_RED} />
          </View>
          <Text style={styles.title}>Blood Report Analyse</Text>
          <Text style={styles.subtitle}>
            Upload your blood test report and get an easy, AI-powered summary.
          </Text>
        </View>

        {/* Step 1: Upload */}
        <View style={styles.card}>
          <Text style={styles.stepTag}>STEP 1</Text>
          <Text style={styles.sectionTitle}>Upload Your Blood Report</Text>
          <Text style={styles.infoText}>
            Supported formats: <Text style={styles.bold}>.jpg, .jpeg, .png, .pdf</Text>
          </Text>

          <TouchableOpacity style={styles.uploadArea} onPress={handlePickFile}>
            <Ionicons name="cloud-upload-outline" size={28} color={PRIMARY_RED} />
            <Text style={styles.uploadText}>
              {selectedFile ? 'Tap to change report' : 'Tap to upload report'}
            </Text>
            <Text style={styles.uploadHint}>Max size depends on your device limits.</Text>
          </TouchableOpacity>

          {selectedFile && (
            <View style={styles.fileChip}>
              <Ionicons name="document-attach-outline" size={18} color={PRIMARY_RED} />
              <Text style={styles.fileChipText} numberOfLines={1}>
                {selectedFile.name}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!selectedFile || loading) && { opacity: 0.6 },
            ]}
            disabled={!selectedFile || loading}
            onPress={handleAnalyse}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Analyse with Google AI</Text>
            )}
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Step 2: Result */}
        {analysis && (
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.stepTag}>STEP 2</Text>
            <Text style={styles.sectionTitle}>AI Analysis Summary</Text>

            {/* 1️⃣ Blood Overview - table */}
            <Text style={styles.sectionLabel}>Blood Overview</Text>
            {analysis.bloodOverview && analysis.bloodOverview.length > 0 ? (
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 1.2 }]}>
                    Parameter
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>Value</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                    Normal
                  </Text>
                  <Text style={[styles.tableCell, styles.tableHeaderCell]}>
                    Status
                  </Text>
                </View>

                {analysis.bloodOverview.map((row, idx) => (
                  <View
                    key={`${row.parameter}-${idx}`}
                    style={[
                      styles.tableRow,
                      idx % 2 === 0 && styles.tableRowAlt,
                    ]}
                  >
                    <Text style={[styles.tableCell, { flex: 1.2 }]}>
                      {row.parameter}
                    </Text>
                    <Text style={styles.tableCell}>{row.value}</Text>
                    <Text style={styles.tableCell}>{row.normalRange}</Text>
                    <Text
                      style={[
                        styles.tableCell,
                        row.interpretation.toLowerCase().includes('high') ||
                        row.interpretation.toLowerCase().includes('low')
                          ? styles.tableCellWarn
                          : styles.tableCellOk,
                      ]}
                    >
                      {row.interpretation}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.normalText}>
                Blood values could not be structured into a table. Please read the detailed
                text and consult a doctor.
              </Text>
            )}

            <View style={styles.divider} />

            {/* 2️⃣ Current health: disease info OR improvement tips */}
            <Text style={styles.sectionLabel}>Current Health Insight</Text>

            {analysis.hasDiseaseRisk ? (
              <View style={styles.badgeContainer}>
                <View style={[styles.statusBadge, styles.statusBadgeDanger]}>
                  <Ionicons name="alert-circle-outline" size={16} color="#991b1b" />
                  <Text style={styles.statusBadgeTextDanger}>Possible condition</Text>
                </View>
                <Text style={styles.normalText}>{analysis.diseaseInfo}</Text>
                <Text style={styles.disclaimerText}>
                  ⚠ This is not a medical diagnosis. Please consult a qualified doctor.
                </Text>
              </View>
            ) : (
              <View style={styles.badgeContainer}>
                <View style={[styles.statusBadge, styles.statusBadgeSafe]}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#166534" />
                  <Text style={styles.statusBadgeTextSafe}>
                    No clear disease risk detected
                  </Text>
                </View>
                <Text style={styles.normalText}>{analysis.improvementTips}</Text>
              </View>
            )}

            <View style={styles.divider} />

            {/* 3️⃣ Future risks + prevention + food & lifestyle */}
            <Text style={styles.sectionLabel}>Future Risks & Prevention</Text>
            <Text style={styles.normalText}>{analysis.futureRisks}</Text>

            <Text style={styles.sectionSubLabel}>How to Protect Yourself</Text>
            <Text style={styles.normalText}>{analysis.preventionTips}</Text>

            <Text style={styles.sectionSubLabel}>Food & Lifestyle Suggestions</Text>
           <Text style={styles.normalText}>
  {stripMarkdownAsterisks(analysis.foodLifestyle)}
</Text>


            {/* Slogan */}
            <View style={styles.sloganBox}>
              <Ionicons name="heart-outline" size={20} color={PRIMARY_RED} />
              <Text style={styles.sloganText}>{analysis.slogan}</Text>
            </View>
          </View>
        )}

        {/* Default slogan if no result yet */}
        {!analysis && (
          <View style={styles.bottomSloganCard}>
            <Ionicons name="heart-circle-outline" size={22} color={PRIMARY_RED} />
            <Text style={styles.bottomSloganText}>
              “Healthy blood today, stronger life tomorrow – take care of yourself.”
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Analyse;

// ---------------- STYLES ----------------

const PRIMARY_RED = '#dc2626';
const LIGHT_RED = '#fee2e2';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_RED,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // Header
  headerBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: PRIMARY_RED,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#7f1d1d',
    marginTop: 4,
  },

  // Card
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
  stepTag: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7f1d1d',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#450a0a',
    marginTop: 10,
    marginBottom: 4,
  },
  sectionSubLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7f1d1d',
    marginTop: 10,
    marginBottom: 4,
  },

  infoText: {
    fontSize: 12,
    color: '#450a0a',
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
  },

  // Upload area
  uploadArea: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#fecaca',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7f7',
    marginTop: 4,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#450a0a',
    marginTop: 8,
  },
  uploadHint: {
    fontSize: 11,
    color: '#7f1d1d',
    marginTop: 2,
  },

  // File chip
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#fecaca',
    maxWidth: '100%',
  },
  fileChipText: {
    fontSize: 12,
    color: '#450a0a',
    marginLeft: 6,
    maxWidth: '90%',
  },

  // Buttons
  primaryButton: {
    marginTop: 14,
    backgroundColor: PRIMARY_RED,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  errorText: {
    color: PRIMARY_RED,
    fontSize: 12,
    marginTop: 8,
  },

  disclaimerText: {
    fontSize: 11,
    color: '#7f1d1d',
    marginTop: 6,
    lineHeight: 16,
  },

  normalText: {
    fontSize: 14,
    color: '#450a0a',
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#fee2e2',
    marginVertical: 12,
  },

  // Table styles
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableHeaderRow: {
    backgroundColor: '#fee2e2',
  },
  tableRowAlt: {
    backgroundColor: '#fff7f7',
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: '#450a0a',
  },
  tableHeaderCell: {
    fontWeight: '700',
  },
  tableCellWarn: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  tableCellOk: {
    color: '#15803d',
    fontWeight: '700',
  },

  // Status badges
  badgeContainer: {
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 6,
  },
  statusBadgeDanger: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  statusBadgeSafe: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statusBadgeTextDanger: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#991b1b',
  },
  statusBadgeTextSafe: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },

  sloganBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sloganText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7f1d1d',
    flex: 1,
  },

  bottomSloganCard: {
    marginTop: 24,
    marginHorizontal: 4,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomSloganText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7f1d1d',
    flex: 1,
    textAlign: 'left',
  },
});
