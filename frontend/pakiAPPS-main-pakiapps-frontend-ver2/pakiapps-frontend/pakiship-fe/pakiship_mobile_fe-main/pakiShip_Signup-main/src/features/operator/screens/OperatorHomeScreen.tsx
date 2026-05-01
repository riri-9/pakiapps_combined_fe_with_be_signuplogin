import { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Modal,
  Alert 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Package, Users, ArrowUpRight, ArrowDownLeft, Bell, User, LogOut, 
  HelpCircle, AlertTriangle, LayoutDashboard, MapPin, Calendar, Star, BarChart3,
  TrendingUp, Search, QrCode
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthSession } from "../../auth/context/AuthSessionContext";

// Mock Assets
const logoImg = require("../../../../assets/icon.png"); 

type TabType = "home" | "parcels" | "analytics";

export default function OperatorHomeScreen() {
  const navigation = useNavigation<any>();
  const { currentUser, clearCurrentUser } = useAuthSession();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userName = currentUser?.fullName?.trim() || "Operator";
  const hubName = "BGC Central Hub";

  const handleLogout = () => {
    clearCurrentUser();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F9F8]">
      {/* Header */}
      <View className="h-16 bg-white border-b border-[#39B5A8]/10 flex-row items-center justify-between px-4">
        <Image source={logoImg} className="h-8 w-32" resizeMode="contain" />
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="p-2 bg-[#F0F9F8] rounded-xl">
             <Bell size={20} className="text-[#39B5A8]" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate("OperatorProfile")}
            className="w-10 h-10 rounded-full bg-gray-100 border-2 border-[#39B5A8]/20 overflow-hidden"
          >
             <User size={24} className="text-[#39B5A8] m-auto" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowLogoutModal(true)}
            className="p-2 bg-red-50 rounded-xl"
          >
            <LogOut size={20} className="text-red-500" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        {activeTab === "home" && <HomeView userName={userName} hubName={hubName} navigation={navigation} />}
        {activeTab === "parcels" && <ParcelsView />}
        {activeTab === "analytics" && <AnalyticsView />}
      </View>

      {/* Bottom Navigation */}
      <View className="h-20 bg-white border-t border-[#39B5A8]/10 flex-row items-center justify-around pb-4">
        <NavButton active={activeTab === "home"} icon={<LayoutDashboard size={20} />} label="Home" onPress={() => setActiveTab("home")} />
        <NavButton active={activeTab === "parcels"} icon={<Package size={20} />} label="Parcels" onPress={() => setActiveTab("parcels")} />
        <NavButton active={activeTab === "analytics"} icon={<BarChart3 size={20} />} label="Stats" onPress={() => setActiveTab("analytics")} />
      </View>

      {showLogoutModal && (
        <Modal transparent animationType="fade" visible={showLogoutModal}>
          <View className="flex-1 bg-black/80 items-center justify-center p-6">
            <View className="bg-white rounded-[40px] w-full max-w-sm p-8 pt-16 items-center">
              <View className="w-32 h-32 bg-gray-100 rounded-full items-center justify-center mb-6 absolute -top-16">
                <LogOut size={48} className="text-red-500" />
              </View>
              <Text className="text-2xl font-black text-[#041614] mb-2">Logout?</Text>
              <Text className="text-gray-400 text-xs mb-8 text-center px-4 font-medium">
                Are you sure you want to sign out and return to the login page?
              </Text>
              <View className="w-full gap-3">
                <TouchableOpacity onPress={handleLogout} className="w-full py-4 bg-red-500 rounded-2xl items-center shadow-lg shadow-red-200">
                  <Text className="text-white font-black text-sm uppercase">Yes, Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowLogoutModal(false)} className="w-full py-4 items-center">
                  <Text className="text-[#39B5A8] font-black text-sm uppercase">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function HomeView({ userName, hubName, navigation }: any) {
  return (
    <ScrollView className="flex-1 p-5">
      <View className="bg-[#F0F9F8] rounded-[32px] p-6 border border-[#39B5A8]/20 mb-6">
        <Text className="text-3xl font-black text-[#041614]">Kumusta, {'\n'}<Text className="text-[#39B5A8]">{userName}!</Text></Text>
        <View className="flex-row items-center gap-3 mt-6 bg-white/50 p-4 rounded-2xl border border-dashed border-[#39B5A8]/20">
          <View className="w-10 h-10 bg-white rounded-xl items-center justify-center">
            <MapPin size={20} className="text-[#39B5A8]" />
          </View>
          <View>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Hub</Text>
            <Text className="text-lg font-black text-[#041614]">{hubName}</Text>
          </View>
        </View>
      </View>

      <Text className="text-xs font-black text-[#39B5A8] uppercase tracking-widest mb-4 ml-1">Quick Actions</Text>
      <View className="flex-row gap-4 mb-8">
        <TouchableOpacity 
          onPress={() => navigation.navigate("ReceiveParcel")}
          className="flex-1 bg-white p-5 rounded-[28px] border border-[#39B5A8]/10 shadow-sm items-center"
        >
          <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mb-3">
            <QrCode size={24} className="text-emerald-500" />
          </View>
          <Text className="font-black text-[#041614] text-xs">Receive</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-1 bg-white p-5 rounded-[28px] border border-[#39B5A8]/10 shadow-sm items-center">
          <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-3">
            <Users size={24} className="text-blue-500" />
          </View>
          <Text className="font-black text-[#041614] text-xs">Pickup</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white rounded-[32px] p-6 border border-[#39B5A8]/10 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
           <Text className="font-black text-[#041614]">Hub Capacity</Text>
           <Text className="text-xs font-bold text-[#39B5A8]">72% Full</Text>
        </View>
        <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <View className="h-full bg-[#39B5A8] w-[72%]" />
        </View>
        <Text className="text-[10px] text-gray-400 mt-3 font-medium text-center">Section B is nearing full capacity. Consider organizing.</Text>
      </View>
    </ScrollView>
  );
}

function ParcelsView() {
  return (
    <View className="flex-1 p-5 items-center justify-center">
      <Package size={48} className="text-gray-200 mb-4" />
      <Text className="text-xl font-black text-[#041614]">Inventory List</Text>
      <Text className="text-gray-400 text-sm text-center font-medium mt-1">Manage all parcels stored in your{'\n'}local hub facility.</Text>
    </View>
  );
}

function AnalyticsView() {
  return (
    <ScrollView className="flex-1 p-5">
      <Text className="text-2xl font-black text-[#041614] mb-6">Earnings & Stats</Text>
      <View className="bg-[#041614] rounded-[32px] p-6 mb-6">
         <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">Total Earnings</Text>
         <Text className="text-white text-4xl font-black mt-1">₱3,240.00</Text>
         <View className="flex-row items-center gap-2 mt-4 bg-white/10 p-2 rounded-xl self-start">
            <TrendingUp size={14} className="text-emerald-400" />
            <Text className="text-emerald-400 font-bold text-[10px]">+12.5% vs last week</Text>
         </View>
      </View>

      <View className="flex-row gap-4">
        <StatItem label="Incoming" value="24" icon={<ArrowDownLeft size={16} />} color="text-blue-500" bg="bg-blue-50" />
        <StatItem label="Picked Up" value="31" icon={<ArrowUpRight size={16} />} color="text-emerald-500" bg="bg-emerald-50" />
      </View>
    </ScrollView>
  );
}

function StatItem({ label, value, icon, color, bg }: any) {
  return (
    <View className={`flex-1 ${bg} p-5 rounded-[28px] border border-white/20`}>
       <View className="flex-row items-center gap-2 mb-2">
         {icon && <View className={color}>{icon}</View>}
         <Text className={`text-[9px] font-black uppercase tracking-wider ${color}`}>{label}</Text>
       </View>
       <Text className="text-2xl font-black text-[#041614]">{value}</Text>
    </View>
  );
}

function NavButton({ active, icon, label, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} className="items-center justify-center p-2">
      <View className={`size-12 rounded-2xl items-center justify-center mb-1 ${active ? 'bg-[#39B5A8] shadow-lg shadow-[#39B5A8]/40' : 'bg-transparent'}`}>
         {active ? (
           <View className="text-white">{icon}</View>
         ) : (
           <View className="text-gray-300">{icon}</View>
         )}
      </View>
      <Text className={`text-[10px] font-bold ${active ? 'text-[#39B5A8]' : 'text-gray-300'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
