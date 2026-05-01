import { useState, useRef, useEffect, cloneElement } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Modal, 
  TextInput, 
  Pressable,
  Linking,
  Platform,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Package, MapPin, Navigation, Clock, Bell, User, X,
  CheckCircle2, TrendingUp, Truck, Star, Phone, Map, HelpCircle,
  ArrowRight, ArrowLeft, LogOut, Camera, Info, RefreshCw, AlertTriangle,
  LayoutDashboard, Check, Layers, Zap, QrCode, Scan
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthSession } from "../../auth/context/AuthSessionContext";

// Mock Assets
const logoImg = require("../../../../assets/icon.png"); // Fallback to icon
const sadMascotImg = "https://i.imgur.com/6bx4yV2.png";
const mascotWavingImg = "https://i.imgur.com/G4RbCRo.png";
const mascotPhoneImg = "https://i.imgur.com/HHNarFY.png";
const mascotMoneyImg = "https://i.imgur.com/F4duNR4.png";
const mascotBoxImg = "https://i.imgur.com/a6gHhtu.png";
const mascotChecklistImg = "https://i.imgur.com/4Xgmx8D.png";

import { useJobs, Job } from "../context/JobsContext";
// Note: imageCompression might need a native alternative or we keep the stub if it was web-only
const safeLocalStorageSet = (key: string, val: string) => {}; 
const compressImage = async (uri: string) => uri;

/** * ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
 */

function CallModal({ job, onClose }: { job: Job | null; onClose: () => void }) {
  if (!job) {
    return null;
  }

  const handleCall = () => {
    if (job.customerPhone) {
      Linking.openURL(`tel:${job.customerPhone}`);
    }
  };

  return (
    <Modal transparent animationType="slide" visible={!!job}>
      <View className="flex-1 bg-black/60 justify-end sm:justify-center p-4">
        <View className="bg-white w-full max-w-sm self-center rounded-[40px] p-6 shadow-2xl">
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-[#39B5A8] items-center justify-center mb-3 shadow-lg">
              <Text className="text-white font-black text-3xl">
                {job.customerName.charAt(0)}
              </Text>
            </View>
            <Text className="text-xl font-black text-[#041614]">{job.customerName}</Text>
            <Text className="text-[#39B5A8] font-bold text-sm mt-1">{job.customerPhone}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleCall}
            className="w-full bg-[#39B5A8] py-4 rounded-2xl flex-row items-center justify-center gap-3 shadow-lg mb-2"
          >
            <Phone className="text-white" size={20} />
            <Text className="text-white font-black">Call Customer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} className="w-full py-3 items-center">
            <Text className="text-gray-400 font-bold text-sm">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function QRScannerModal({ job, onClose, onScanSuccess }: { job: Job | null; onClose: () => void; onScanSuccess: (data: string) => void }) {
  const [error, setError] = useState<string>("");
  const [manualCode, setManualCode] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!job) {
    return null;
  }

  const simulateScan = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onScanSuccess(job.qrCode || "");
      onClose();
    }, 1000);
  };

  const handleManualSubmit = () => {
    if (manualCode === job.qrCode) {
      onScanSuccess(manualCode);
      onClose();
    } else {
      setError("Invalid code. Please check and try again.");
    }
  };

  return (
    <Modal transparent animationType="fade" visible={!!job}>
      <View className="flex-1 bg-black/80 items-center justify-center p-4">
        <View className="bg-white w-full max-w-md rounded-[40px] p-6 shadow-2xl">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-black text-[#041614]">Scan Customer QR</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X className="text-gray-400" size={20} />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <View className="aspect-square bg-gray-100 rounded-2xl items-center justify-center mb-4 border-4 border-[#39B5A8]/20 overflow-hidden">
              {isProcessing ? (
                <View className="absolute inset-0 bg-[#39B5A8] items-center justify-center">
                  <RefreshCw className="text-white animate-spin" size={48} />
                  <Text className="text-white font-black text-lg mt-3">Verifying...</Text>
                </View>
              ) : (
                <>
                  <Scan className="text-[#39B5A8]" size={96} />
                  <Text className="text-sm font-bold text-gray-600 text-center px-4 mt-4">
                    Point camera at customer's QR code
                  </Text>
                </>
              )}
            </View>

            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex-row items-start gap-2">
                <AlertTriangle className="text-red-500 mt-0.5" size={20} />
                <Text className="text-sm font-bold text-red-600 flex-1">{error}</Text>
              </View>
            ) : null}

            <View className="bg-[#F0F9F8] border border-[#39B5A8]/20 rounded-xl p-4 mb-4">
              <Text className="text-[10px] font-bold text-gray-500 uppercase mb-2">Job Details</Text>
              <Text className="text-sm font-black text-[#041614]">{job.jobNumber}</Text>
              <Text className="text-xs font-medium text-gray-600">Customer: {job.customerName}</Text>
              <Text className="text-xs font-medium text-gray-600">Drop-off: {job.dropOffPoint}</Text>
            </View>

            <TouchableOpacity
              onPress={simulateScan}
              disabled={isProcessing}
              className="w-full bg-[#39B5A8] py-4 rounded-xl shadow-lg mb-3 flex-row items-center justify-center gap-2"
            >
              <QrCode className="text-white" size={20} />
              <Text className="text-white font-black">Simulate QR Scan (Demo)</Text>
            </TouchableOpacity>

            <View className="border-t border-gray-200 pt-4">
              <Text className="text-[10px] font-bold text-gray-500 uppercase mb-2">Or Enter Code Manually</Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={manualCode}
                  onChangeText={(val) => setManualCode(val.toUpperCase())}
                  placeholder="Enter QR code"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-[#041614]"
                />
                <TouchableOpacity
                  onPress={handleManualSubmit}
                  className="px-4 py-3 bg-[#041614] rounded-xl items-center justify-center"
                >
                  <Check className="text-white" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} className="w-full py-3 items-center">
            <Text className="text-gray-400 font-bold text-sm">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function NotificationPopup({ isOpen, onClose, jobs }: { isOpen: boolean; onClose: () => void; jobs: Job[] }) {
  if (!isOpen) return null;

  const availableCount = jobs.filter(j => j.status === "available").length;
  
  const notifications = [
    {
      id: 1,
      title: availableCount > 0 ? "Jobs Available!" : "Looking for work?",
      desc: availableCount > 0 ? `${availableCount} requests near you.` : "Stay online to get requests.",
      time: "Just now",
      icon: <Package className="text-teal-500" size={12} />,
      bg: "bg-teal-50"
    },
    {
      id: 2,
      title: "System Update",
      desc: "Profile picture update now active.",
      time: "2h ago",
      icon: <RefreshCw className="text-blue-500" size={12} />,
      bg: "bg-blue-50"
    }
  ];

  return (
    <Modal transparent visible={isOpen} animationType="fade">
      <Pressable className="flex-1" onPress={onClose}>
        <View className="absolute top-16 right-4 w-[260px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-50">
            <Text className="font-black text-[#041614] text-[10px] uppercase tracking-wider">Notifications</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={14} className="text-gray-300" />
            </TouchableOpacity>
          </View>
          <View className="p-1">
            {notifications.map((n) => (
              <TouchableOpacity key={n.id} className="p-3 flex-row gap-3 items-start hover:bg-gray-50 rounded-2xl">
                <View className={`w-8 h-8 rounded-full items-center justify-center ${n.bg}`}>
                  {n.icon}
                </View>
                <View className="flex-1">
                  <Text className="font-black text-[12px] text-[#041614] leading-tight">{n.title}</Text>
                  <Text className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5" numberOfLines={2}>{n.desc}</Text>
                  <Text className="text-[8px] text-gray-300 font-bold mt-1 uppercase">{n.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

/** * ─── MAIN PAGE COMPONENT ─────────────────────────────────────────────────────
 */

export default function DriverHomeScreen() {
  const navigation = useNavigation<any>();
  const { currentUser, clearCurrentUser } = useAuthSession();
  const { jobs, addJob } = useJobs();
  const [isOnline, setIsOnline] = useState(true);
  const [mobileTab, setMobileTab] = useState<"home" | "jobs">("home");
  const [activeTab, setActiveTab] = useState<"available" | "in-progress" | "completed">("available");
  const [deliveryMode, setDeliveryMode] = useState<"direct" | "relay">("direct");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [callJob, setCallJob] = useState<Job | null>(null);
  const [qrScanJob, setQrScanJob] = useState<Job | null>(null);
  const userName = currentUser?.fullName?.trim() || "Driver";
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showNewJobAlert, setShowNewJobAlert] = useState(false);

  const activeJob = jobs.find(j => j.status === "in-progress");
  const completedJobs = jobs.filter(j => j.status === "completed");
  const completedTodayCount = completedJobs.length;
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (parseInt(job.earnings.replace(/[₱,]/g, "")) || 0), 0);

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = job.status === activeTab;
    const isRelay = job.deliveryType === "relay";
    const matchesMode = deliveryMode === "relay" ? isRelay : !isRelay;
    return matchesStatus && matchesMode;
  });

  const handleLogout = () => {
    setIsOnline(false);
    clearCurrentUser();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F0F9F8]">
      <CallModal job={callJob} onClose={() => setCallJob(null)} />
      <QRScannerModal job={qrScanJob} onClose={() => setQrScanJob(null)} onScanSuccess={() => {}} />
      <NotificationPopup isOpen={showNotifications} onClose={() => setShowNotifications(false)} jobs={jobs} />

      {/* Header */}
      <View className="h-16 flex-row items-center justify-between px-4 bg-white shadow-sm z-50">
        <Image source={logoImg} className="h-8 w-32" resizeMode="contain" />
        <View className="flex-row items-center gap-2">
          <TouchableOpacity 
            onPress={() => setShowNotifications(true)}
            className="p-2 border border-[#39B5A8]/20 rounded-xl"
          >
            <Bell size={20} className="text-[#39B5A8]" />
            {hasNotifications && <View className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate("DriverProfile")}
            className="w-9 h-9 rounded-full border-2 border-[#39B5A8]/20 overflow-hidden"
          >
             <View className="flex-1 bg-[#E6F4F2] items-center justify-center">
               <User size={18} className="text-[#39B5A8]" />
             </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowLogoutModal(true)} className="p-2">
            <LogOut size={20} className="text-red-500" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* User Status Card */}
        <View className="bg-white p-5 rounded-[32px] border border-[#39B5A8]/10 shadow-sm flex-row items-center gap-4 mb-5">
          <View className="w-16 h-16 rounded-full border-2 border-[#39B5A8]/20 bg-[#F0F9F8] items-center justify-center">
            <User size={32} className="text-[#39B5A8]" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-xl font-black text-[#041614]">{userName}</Text>
              <TouchableOpacity 
                onPress={() => setIsOnline(!isOnline)}
                className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full border ${isOnline ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <View className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
                <Text className="text-[10px] font-black uppercase text-[#041614]">{isOnline ? "Online" : "Offline"}</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-[#39B5A8] font-bold">PakiShip Partner Driver • 4.8 Rating</Text>
          </View>
        </View>

        {mobileTab === "home" ? (
          <View className="space-y-4">
            {/* Active Delivery Card */}
            {activeJob ? (
              <View className="bg-white border border-[#39B5A8]/20 rounded-[32px] p-5 shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-2">
                    <View className="p-2 bg-[#F0F9F8] rounded-xl"><Truck size={16} className="text-[#39B5A8]" /></View>
                    <Text className="font-black text-[10px] uppercase tracking-widest text-[#1A5D56]">Active Delivery</Text>
                  </View>
                  <View className="px-2.5 py-1 bg-orange-50 rounded-full"><Text className="text-orange-500 text-[9px] font-black uppercase">In Progress</Text></View>
                </View>
                <View className="mb-5">
                   <Text className="text-gray-400 text-[10px] font-bold mb-1 uppercase">Drop-off Point</Text>
                   <View className="flex-row items-start gap-2">
                     <MapPin size={16} className="text-red-400 mt-1" />
                     <Text className="text-base font-black text-[#041614] flex-1">{activeJob.dropoff}</Text>
                   </View>
                </View>
                <TouchableOpacity className="w-full py-4 bg-[#39B5A8] rounded-2xl flex-row items-center justify-center gap-2 shadow-lg">
                  <Navigation size={16} className="text-white" />
                  <Text className="text-white font-black uppercase text-xs">Open Navigation</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="bg-white border border-gray-100 rounded-[32px] p-8 items-center justify-center">
                <Package size={32} className="text-gray-200 mb-2" />
                <Text className="text-gray-400 font-bold text-xs">No active delivery.</Text>
                <TouchableOpacity onPress={() => setMobileTab("jobs")} className="mt-4 px-6 py-2 bg-[#F0F9F8] rounded-xl">
                  <Text className="text-[#39B5A8] font-black text-[10px] uppercase">Find a Job →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Stats Grid */}
            <View className="flex-row flex-wrap gap-3">
              <View className="flex-1 min-w-[45%] bg-[#39B5A8] p-4 rounded-[32px] shadow-lg">
                 <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-3">
                   <Text className="text-white font-black text-lg">₱</Text>
                 </View>
                 <Text className="text-2xl font-black text-white leading-none mb-1">₱{totalEarnings}</Text>
                 <Text className="text-[9px] font-black text-white/80 uppercase">Today's Earnings</Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-white p-4 rounded-[32px] border border-[#39B5A8]/10">
                 <View className="w-10 h-10 bg-[#F0F9F8] rounded-xl items-center justify-center mb-3">
                   <Package size={18} className="text-[#39B5A8]" />
                 </View>
                 <Text className="text-2xl font-black text-[#041614] leading-none mb-1">{completedTodayCount}</Text>
                 <Text className="text-[9px] font-black text-gray-400 uppercase">Deliveries Today</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="space-y-4">
            {/* Delivery Mode Toggle */}
             <View className="bg-white p-1 rounded-2xl border border-[#39B5A8]/10 flex-row">
              <TouchableOpacity 
                onPress={() => setDeliveryMode("direct")}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${deliveryMode === 'direct' ? 'bg-[#39B5A8] shadow-lg' : ''}`}
              >
                <Zap size={16} className={deliveryMode === 'direct' ? 'text-white' : 'text-gray-400'} />
                <Text className={`text-[10px] font-black uppercase ${deliveryMode === 'direct' ? 'text-white' : 'text-gray-400'}`}>Direct</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setDeliveryMode("relay")}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${deliveryMode === 'relay' ? 'bg-[#39B5A8] shadow-lg' : ''}`}
              >
                <Layers size={16} className={deliveryMode === 'relay' ? 'text-white' : 'text-gray-400'} />
                <Text className={`text-[10px] font-black uppercase ${deliveryMode === 'relay' ? 'text-white' : 'text-gray-400'}`}>Relay</Text>
              </TouchableOpacity>
            </View>

            {/* Status Tabs */}
            <View className="flex-row bg-white p-1 rounded-xl border border-[#39B5A8]/10">
              {(["available", "in-progress", "completed"] as const).map(tab => (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === tab ? "bg-[#39B5A8]" : ""}`}>
                  <Text className={`text-[10px] font-black ${activeTab === tab ? "text-white" : "text-gray-400"}`}>{tab.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Job Cards */}
            {filteredJobs.length === 0 ? (
               <View className="py-20 items-center opacity-40">
                 <Package size={40} className="text-[#041614] mb-2" />
                 <Text className="text-xs font-bold text-[#041614]">No {activeTab} jobs found</Text>
               </View>
            ) : (
              filteredJobs.map(job => (
                <View key={job.id} className="bg-white border border-[#39B5A8]/10 rounded-3xl p-5 mb-4 shadow-sm">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="px-3 py-1 bg-[#F0F9F8] rounded-xl border border-[#39B5A8]/10">
                      <Text className="text-xs font-black text-[#39B5A8]">{job.jobNumber}</Text>
                    </View>
                    <Text className="text-lg font-black text-[#041614]">{job.earnings}</Text>
                  </View>
                  
                  <View className="space-y-4 mb-5">
                    <View className="flex-row items-start gap-3">
                      <View className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-gray-400 uppercase">Pickup</Text>
                        <Text className="text-sm font-black text-[#041614]">{job.pickup}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-start gap-3">
                      <View className="w-2 h-2 rounded-full bg-red-400 mt-1.5" />
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-gray-400 uppercase">Drop-off</Text>
                        <Text className="text-sm font-black text-[#041614]">{job.dropoff}</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => navigation.navigate("JobDetails", { id: job.id })}
                    className="w-full py-4 bg-background border border-primary/20 rounded-2xl items-center"
                  >
                    <Text className="text-[#39B5A8] font-black uppercase text-xs">View Details</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View className="h-20 bg-white border-t border-gray-100 flex-row items-center justify-around px-8 pb-4 shadow-2xl">
        <TouchableOpacity onPress={() => setMobileTab("home")} className="items-center gap-1 flex-1">
          <View className={`p-2 rounded-xl ${mobileTab === 'home' ? 'bg-[#F0F9F8]' : ''}`}>
            <LayoutDashboard size={24} className={mobileTab === 'home' ? 'text-[#39B5A8]' : 'text-gray-300'} />
          </View>
          <Text className={`text-[10px] font-black uppercase ${mobileTab === 'home' ? 'text-[#39B5A8]' : 'text-gray-300'}`}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setMobileTab("jobs")} className="items-center gap-1 flex-1">
          <View className={`p-2 rounded-xl ${mobileTab === 'jobs' ? 'bg-[#F0F9F8]' : ''}`}>
            <Package size={24} className={mobileTab === 'jobs' ? 'text-[#39B5A8]' : 'text-gray-300'} />
          </View>
          <Text className={`text-[10px] font-black uppercase ${mobileTab === 'jobs' ? 'text-[#39B5A8]' : 'text-gray-300'}`}>Jobs</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Modal */}
      {showLogoutModal && (
        <Modal transparent animationType="fade" visible={showLogoutModal}>
          <View className="flex-1 bg-black/80 items-center justify-center p-6">
            <View className="bg-white rounded-[40px] w-full max-w-sm p-8 pt-16 items-center">
              <View className="w-32 h-32 bg-gray-100 rounded-full items-center justify-center mb-6 absolute -top-16">
                 <LogOut size={48} className="text-red-500" />
              </View>
              <Text className="text-2xl font-black text-[#041614] mb-2">Logout?</Text>
              <Text className="text-gray-400 text-xs mb-8 text-center px-4 font-medium">Are you sure you want to go offline and stop earning?</Text>
              <View className="w-full gap-3">
                <TouchableOpacity onPress={handleLogout} className="w-full py-4 bg-red-500 rounded-2xl items-center shadow-lg shadow-red-200">
                  <Text className="text-white font-black text-sm uppercase">Yes, Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowLogoutModal(false)} className="w-full py-4 items-center">
                  <Text className="text-[#39B5A8] font-black text-sm uppercase">Stay Online</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
