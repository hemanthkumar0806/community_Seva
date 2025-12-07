import React from 'react';
import { Drawer } from 'expo-router/drawer';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons

// Custom Drawer Component
const CustomDrawerContent = (props: any) => {
  // User data - replace with your actual user data
  const userName = "John Doe";
  const userLocation = "New York, USA";
  const userAvatar = "https://randomuser.me/api/portraits/men/32.jpg";

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logout pressed');
    // Example: props.navigation.navigate('Login');
  };

  const handleProfilePress = () => {
    // Navigate to profile screen
    props.navigation.navigate('profile');
    // Optional: Close drawer after navigation
    // props.navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      <DrawerContentScrollView 
        {...props}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Profile Section - Clickable */}
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: userAvatar }}
              style={styles.profileImage}
            />
            {/* Edit icon overlay */}
            <View style={styles.editIconOverlay}>
              <Ionicons name="camera-outline" size={20} color="#fff" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{userName}</Text>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </View>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.userLocation}>{userLocation}</Text>
            </View>
            <Text style={styles.viewProfileText}>View Profile</Text>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Default Drawer Items */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout Button at Bottom */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Main Component
export default function RootLayout() {
  return (
    <Drawer 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ 
        headerTitle: "Community Seva",
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: '#e74c3c',
        },
        drawerActiveTintColor: '#e74c3c',
        drawerActiveBackgroundColor: '#ffe6e6',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          marginLeft: -15,
          fontSize: 15,
        },
      }}
    >
      
      <Drawer.Screen 
        name="blood" 
        options={{ 
          drawerLabel: 'Blood Donation',
          title: 'Blood Donation',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="water-outline" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="organ" 
        options={{ 
          drawerLabel: 'Organ Donation',
          title: 'Organ Donation',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="medicine" 
        options={{ 
          drawerLabel: 'Medicine Help',
          title: 'Medicine Help',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="medical-outline" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="profile" 
        options={{ 
          drawerLabel: 'My Profile',
          title: 'My Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          drawerItemStyle: { display: 'none' }, // Hide from drawer menu
        }} 
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollViewContent: {
    paddingTop: 0,
  },

  profileSection: {
    padding: 20,
    backgroundColor: "#ffe6e6", // soft red tint
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f5c2c2",
  },

  profileImageContainer: {
    position: "relative",
    marginRight: 18,
  },

  profileImage: {
    width: 105,
    height: 105,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#e74c3c",
  },

  editIconOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#e74c3c",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#e74c3c",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  profileInfo: {
    flex: 1,
  },

  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#b7312a", // darker red themed text
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  userLocation: {
    fontSize: 14,
    color: "#7a7a7a",
    marginLeft: 5,
  },

  viewProfileText: {
    fontSize: 12,
    color: "#e74c3c",
    fontWeight: "600",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#f3b7b7",
    marginVertical: 12,
    marginHorizontal: 15,
  },

  logoutButton: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: "#f2b4b4",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    // subtle shadow
    shadowColor: "#e74c3c",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 5,
    elevation: 6,
  },

  logoutText: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
