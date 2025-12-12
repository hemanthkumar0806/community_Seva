// import React from 'react';
// import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
// import { Ionicons, MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';

// export default function App() {
//   return (
//     <SafeAreaView className="flex-1 bg-[#05120F]">
//       <ScrollView contentContainerStyle={{ padding: 20 }}>
//         <Header />
//         <UrgentCard />
//         <QuickActions />
//         <StockStatus />
//         <Camps />
//         <RecentActivity />
//       </ScrollView>
//       <BottomNav />
//     </SafeAreaView>
//   );
// }

// /* Header */
// const Header = () => (
//   <View className="flex-row items-center justify-between mb-4">
//     <View className="flex-row items-center">

//       {/* ✅ Default Avatar */}
//       <Image
//         source={{ uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
//         className="w-12 h-12 rounded-full border border-[#144A3A]"
//       />

//       <View className="ml-3">
//         <Text className="text-white text-lg font-semibold">Blood Bank Dashboard</Text>
//         <Text className="text-[#9BD7B4] text-sm">Real-time Overview</Text>
//       </View>
//     </View>

//     <TouchableOpacity className="p-2 rounded-full bg-[#0f1a17]">
//       <Feather name="bell" size={20} color="#9BD7B4" />
//     </TouchableOpacity>
//   </View>
// );

// /* Urgent Request Card */
// const UrgentCard = () => (
//   <View className="mb-5 rounded-xl bg-[#0f1a17] p-4 border-l-4 border-red-600 shadow-lg">
//     <View className="flex-row justify-between items-start">
//       <View style={{ flex: 1 }}>
//         <View className="flex-row items-center mb-2">
//           <View className="bg-red-700 px-2 py-1 rounded mr-2">
//             <Text className="text-white text-xs font-bold">URGENT REQUEST</Text>
//           </View>
//           <Text className="text-gray-400 text-xs">2m ago</Text>
//         </View>
//         <Text className="text-white text-2xl font-bold mb-1">O- Negative Needed</Text>
//         <View className="flex-row items-center">
//           <MaterialIcons name="location-on" size={14} color="#9BD7B4" />
//           <Text className="text-[#9BD7B4] text-sm ml-1">City Hospital (2.5km)</Text>
//         </View>
//       </View>

//       <View className="items-end ml-4">
//         <View className="w-14 h-14 rounded-full bg-[#122e24] items-center justify-center mb-3">
//           <Text className="text-red-400 font-bold">O-</Text>
//         </View>
//         <View className="flex-row">
//           <TouchableOpacity className="bg-[#15221d] px-4 py-2 rounded-lg mr-2 items-center justify-center">
//             <Text className="text-white">✕ Reject</Text>
//           </TouchableOpacity>
//           <TouchableOpacity className="bg-[#00e07f] px-4 py-2 rounded-lg items-center justify-center">
//             <Text className="text-black font-bold">✓ Accept</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   </View>
// );

// /* Quick Actions */
// const QuickActions = () => {
//   const actions = [
//     { key: 'update', title: 'Update Units', icon: <Ionicons name="water" size={20} color="#9BD7B4" /> },
//     { key: 'camp', title: 'Create Camp', icon: <FontAwesome5 name="campground" size={20} color="#FFD36E" /> },
//     { key: 'alert', title: 'Send Alert', icon: <Ionicons name="alert-circle" size={20} color="#FF6B6B" /> },
//     { key: 'req', title: 'Requests', icon: <MaterialIcons name="request-page" size={20} color="#9BD7B4" /> },
//   ];

//   return (
//     <View className="mb-5">
//       <Text className="text-white text-lg font-semibold mb-3">Quick Actions</Text>
//       <View className="flex-row justify-between">
//         {actions.map(a => (
//           <TouchableOpacity key={a.key} className="items-center">
//             <View className="w-16 h-16 rounded-full bg-[#0c241e] items-center justify-center mb-2">
//               {a.icon}
//             </View>
//             <Text className="text-[#9BD7B4] text-center text-sm">{a.title}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// };

// /* Stock Status */
// const StockStatus = () => {
//   const stocks = [
//     { group: 'A+', units: 12, status: 'Low', note: '-5% this week' },
//     { group: 'B+', units: 45, status: 'Normal', note: 'Stable' },
//     { group: 'O-', units: 8, status: 'Critical', note: 'Urgent Restock' },
//     { group: 'AB+', units: 22, status: 'Normal', note: '+12% this week' },
//   ];

//   return (
//     <View className="mb-5">
//       <View className="flex-row justify-between items-center mb-3">
//         <Text className="text-white text-lg font-semibold">Blood Stock Status</Text>
//         <Text className="text-[#00e07f]">View All</Text>
//       </View>

//       <View className="flex-row flex-wrap justify-between">
//         {stocks.map((s, i) => (
//           <View key={i} className="w-[48%] mb-3 rounded-xl bg-[#0f1a17] p-4">
//             <View className="flex-row justify-between items-center">
//               <Text className="text-white text-xl font-bold">{s.group}</Text>
//               <View className={`px-2 py-1 rounded-full ${
//                 s.status === 'Critical' ? 'bg-red-700' :
//                 s.status === 'Low' ? 'bg-yellow-700' :
//                 'bg-green-700'
//               }`}>
//                 <Text className="text-white text-xs">{s.status}</Text>
//               </View>
//             </View>

//             <Text className="text-white text-3xl font-extrabold my-4">
//               {String(s.units).padStart(2, '0')} <Text className="text-sm font-medium">Units</Text>
//             </Text>

//             <Text className="text-gray-400">{s.note}</Text>
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// };

// /* Upcoming Camps */
// const Camps = () => {
//   const camps = [
//     { date: 'OCT\n12', title: 'City Plaza Donation Drive', time: '09:00 AM - 04:00 PM', place: 'Central Square, Downtown' },
//     { date: 'OCT\n15', title: 'University Tech Campus', time: '10:00 AM - 03:00 PM', place: 'Auditorium Hall B' },
//   ];

//   return (
//     <View className="mb-5">
//       <Text className="text-white text-lg font-semibold mb-3">Upcoming Blood Camps</Text>
//       {camps.map((c, i) => (
//         <View key={i} className="flex-row items-center bg-[#0f1a17] p-3 rounded-xl mb-3">
//           <View className="w-16 h-16 rounded-lg items-center justify-center bg-[#092218] mr-3">
//             <Text className="text-[#9BD7B4] text-sm font-bold text-center">{c.date}</Text>
//           </View>

//           <View style={{ flex: 1 }}>
//             <Text className="text-white font-bold">{c.title}</Text>
//             <Text className="text-gray-400 text-sm">{c.time}</Text>
//             <Text className="text-gray-400 text-sm">{c.place}</Text>
//           </View>

//           <TouchableOpacity className="p-2">
//             <Ionicons name="chevron-forward-circle" size={22} color="#9BD7B4" />
//           </TouchableOpacity>
//         </View>
//       ))}
//     </View>
//   );
// };

// /* Recent Activity */
// const RecentActivity = () => {
//   const recent = [
//     { type: 'update', title: 'Inventory Updated', desc: 'Added 15 units of A+ blood from drive #442.', time: '10 mins ago', color: '#2ecc71' },
//     { type: 'alert', title: 'Urgent Alert Sent', desc: 'Broadcasted requirement for O- type to 50 donors.', time: '1 hour ago', color: '#ff5c5c' },
//     { type: 'camp', title: 'New Camp Created', desc: 'Scheduled "Community Health Center" for Nov 01.', time: '3 hours ago', color: '#8fb3a1' },
//   ];

//   return (
//     <View className="mb-24">
//       <Text className="text-white text-lg font-semibold mb-3">Recent Activity</Text>
//       <View className="bg-[#0f1a17] p-3 rounded-xl">
//         {recent.map((r, i) => (
//           <View key={i} className="flex-row items-start mb-4">
//             <View className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: r.color }} />
//             <View className="ml-3 flex-1">
//               <Text className="text-white font-semibold">{r.title}</Text>
//               <Text className="text-gray-400">{r.desc}</Text>
//             </View>
//             <Text className="text-gray-500 text-sm">{r.time}</Text>
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// };

// /* Bottom Navigation */
// const BottomNav = () => (
//   <View className="absolute bottom-4 left-0 right-0 px-6">
//     <View className="bg-[#07120F] rounded-full p-3 flex-row justify-between items-center shadow-lg">
//       <TouchableOpacity className="items-center">
//         <Ionicons name="home" size={26} color="#00e07f" />
//         <Text className="text-xs text-[#00e07f]">Home</Text>
//       </TouchableOpacity>

//       <TouchableOpacity className="items-center">
//         <Ionicons name="layers" size={26} color="#9BD7B4" />
//         <Text className="text-xs text-[#9BD7B4]">Stock</Text>
//       </TouchableOpacity>

//       <TouchableOpacity className="items-center">
//         <Ionicons name="person" size={26} color="#9BD7B4" />
//         <Text className="text-xs text-[#9BD7B4]">Profile</Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// );
