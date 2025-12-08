import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
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

  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={{ padding: 16 }}>
      {/* -------- START / STOP BUTTON -------- */}
      <TouchableOpacity style={styles.toggleButton} onPress={handleToggleDonation}>
        <Ionicons
          name={accepting ? "stop-circle-outline" : "checkmark-circle-outline"}
          size={22}
          color="#fff"
        />
        <Text style={styles.toggleButtonText}>
          {accepting ? "Stop Taking Donations" : "Start Donation Intake"}
        </Text>
      </TouchableOpacity>

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
  toggleButton: {
    backgroundColor: PRIMARY_RED,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
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
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: PRIMARY_RED,
    marginBottom: 10,
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
});