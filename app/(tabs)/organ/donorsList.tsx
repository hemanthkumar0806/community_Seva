import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY_RED = "#dc2626";
const LIGHT_RED = "#fee2e2";

/* ------------------- Donors Data ------------------- */
const DONORS = [
  {
    id: 1,
    name: "Bongu Ashok",
    phone: "9392954525",
    email: "bonguashok86@gmail.com",
    blood: "O+",
    organs: ["Kidneys", "Heart"],
    height: "172 cm",
    weight: "70 kg",
    history: "No major illness.",
  },
  {
    id: 2,
    name: "Ambati Satish",
    phone: "8106204119",
    email: "satish.ambati0804@gmail.com",
    blood: "A+",
    organs: ["Eyes"],
    height: "168 cm",
    weight: "62 kg",
    history: "Allergic to dust.",
  },
];

const DonorsList = () => {
  const [accepting, setAccepting] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);

  // NEW: organs modal state and input
  const [organsModalVisible, setOrgansModalVisible] = useState(false);
  const [organsInput, setOrgansInput] = useState("");

  /* ------------ START / STOP DONATIONS ------------- */
  const handleToggleDonation = () => {
    if (!accepting) {
      Alert.alert(
        "Start Accepting Donations?",
        "Do you want to enable donor registrations?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start",
            onPress: () => {
              setAccepting(true);
              Alert.alert("Success", "Donation intake started!");
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Stop Accepting Donations?",
        "Do you want to stop collecting new donor forms?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Stop",
            onPress: () => {
              setAccepting(false);
              Alert.alert("Stopped", "Donation intake stopped.");
            },
          },
        ]
      );
    }
  };

  /* ------------------- DOWNLOAD PDF ------------------- */
  const downloadPDF = async () => {
    const rowsHtml = DONORS.map(
      (d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${d.name}</td>
        <td>${d.phone}</td>
        <td>${d.email}</td>
        <td>${d.blood}</td>
        <td>${d.organs.join(", ")}</td>
        <td>${d.height}</td>
        <td>${d.weight}</td>
        <td>${d.history}</td>
      </tr>
    `
    ).join("");

    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { text-align: center; color: #dc2626; }
          table {
            width: 100%; border-collapse: collapse; margin-top: 20px;
          }
          th, td {
            border: 1px solid #fecaca; padding: 8px; font-size: 12px;
          }
          th { background: #fee2e2; color: #7f1d1d; }
        </style>
      </head>
      <body>
        <h1>Donors Full Report</h1>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Phone</th><th>Email</th>
              <th>Blood</th><th>Organs</th><th>Height</th><th>Weight</th><th>History</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
  };

  /* ------------------- ORGANS SUBMIT HANDLER ------------------- */
  const handleOrgansSubmit = () => {
    // convert comma-separated string to array, trim whitespace, remove empties
    const arr = organsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    console.log("Parsed organs array:", arr);
    Alert.alert("Parsed organs", JSON.stringify(arr));
    // optionally clear and close modal
    setOrgansInput("");
    setOrgansModalVisible(false);
  };

  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={{ padding: 16 }}>
      {/* -------- BUTTON ROW: START/STOP + AVAILABLE ORGANS -------- */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.toggleButton} onPress={handleToggleDonation}>
          <Ionicons
            name={accepting ? "stop-circle-outline" : "checkmark-circle-outline"}
            size={22}
            color="#fff"
          />
          <Text style={styles.toggleButtonText}>
            {accepting ? "Stop Taking" : "Start Intake"}
          </Text>
        </TouchableOpacity>

        {/* NEW: Available Organs button */}
        <TouchableOpacity
          style={styles.organsButton}
          onPress={() => setOrgansModalVisible(true)}
        >
          <Ionicons name="list-circle-outline" size={20} color={PRIMARY_RED} />
          <Text style={styles.organsButtonText}>Available Organs</Text>
        </TouchableOpacity>
      </View>

      {/* -------- DOWNLOAD PDF BUTTON -------- */}
      <TouchableOpacity style={styles.downloadBtn} onPress={downloadPDF}>
        <Ionicons name="download-outline" size={22} color={PRIMARY_RED} />
        <Text style={styles.downloadText}>Download Full Donor Report</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Registered Donors</Text>

      {/* -------- DONORS LIST (SHORT VIEW) -------- */}
      {DONORS.map((donor) => (
        <TouchableOpacity
          key={donor.id}
          style={styles.card}
          onPress={() => setSelectedDonor(donor)}
        >
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{donor.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Blood:</Text>
            <Text style={styles.value}>{donor.blood}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Organs:</Text>
            <Text style={styles.value}>{donor.organs.join(", ")}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* ------------------- POPUP MODAL ------------------- */}
      <Modal visible={!!selectedDonor} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Donor Details</Text>

            {selectedDonor && (
              <>
                <Text style={styles.modalRow}>Name: {selectedDonor.name}</Text>
                <Text style={styles.modalRow}>Phone: {selectedDonor.phone}</Text>
                <Text style={styles.modalRow}>Email: {selectedDonor.email}</Text>
                <Text style={styles.modalRow}>Blood Group: {selectedDonor.blood}</Text>
                <Text style={styles.modalRow}>
                  Organs: {selectedDonor.organs.join(", ")}
                </Text>
                <Text style={styles.modalRow}>Height: {selectedDonor.height}</Text>
                <Text style={styles.modalRow}>Weight: {selectedDonor.weight}</Text>
                <Text style={styles.modalRow}>Medical History: {selectedDonor.history}</Text>
              </>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedDonor(null)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ------------------- ORGANS INPUT MODAL (NEW) ------------------- */}
      <Modal visible={organsModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter Available Organs</Text>
            <Text style={{ color: "#450a0a", marginBottom: 8 }}>
              Enter organs separated by commas (e.g. Kidney, Liver, Heart)
            </Text>

            <TextInput
              style={styles.organsInput}
              placeholder="e.g. Kidney, Liver, Cornea"
              placeholderTextColor="#9ca3af"
              value={organsInput}
              onChangeText={setOrgansInput}
              multiline
            />

            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1, marginRight: 8 }]}
                onPress={handleOrgansSubmit}
              >
                <Text style={styles.primaryButtonText}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1 }]}
                onPress={() => {
                  setOrgansInput("");
                  setOrgansModalVisible(false);
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default DonorsList;

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: LIGHT_RED,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: PRIMARY_RED,
    textAlign: "center",
    marginVertical: 14,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  toggleButton: {
    backgroundColor: PRIMARY_RED,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
  },
  organsButton: {
    borderWidth: 1,
    borderColor: PRIMARY_RED,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  organsButtonText: {
    color: PRIMARY_RED,
    fontWeight: "700",
    marginLeft: 8,
  },
  downloadBtn: {
    borderWidth: 1,
    borderColor: PRIMARY_RED,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  downloadText: {
    color: PRIMARY_RED,
    fontWeight: "700",
    marginLeft: 6,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 14,
  },
  row: { flexDirection: "row", marginBottom: 6 },
  label: { width: 100, fontWeight: "700", color: "#7f1d1d" },
  value: { flex: 1, color: "#450a0a" },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    width: "100%",
    maxWidth: 700,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: PRIMARY_RED,
    marginBottom: 10,
    textAlign: "center",
  },
  modalRow: {
    fontSize: 14,
    marginVertical: 3,
    color: "#450a0a",
  },
  closeBtn: {
    marginTop: 14,
    backgroundColor: PRIMARY_RED,
    padding: 10,
    borderRadius: 10,
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },

  // organs input modal styles
  organsInput: {
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#450a0a",
    minHeight: 80,
    textAlignVertical: "top",
  },

  primaryButton: {
    backgroundColor: PRIMARY_RED,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  secondaryButton: {
    borderWidth: 1,
    borderColor: PRIMARY_RED,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryButtonText: { color: PRIMARY_RED, fontWeight: "700", fontSize: 16 },
});
