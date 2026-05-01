import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Modal, 
  Linking,
  Platform,
  Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ArrowLeft, MapPin, Package, User, Phone, MessageSquare,
  Clock, Navigation, CheckCircle2, AlertCircle, Map, RefreshCw, ExternalLink, X,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useJobs, Job } from "../context/JobsContext";

// Mock Assets
const logoImg = require("../../../../assets/icon.png"); 
const mascotBoxImg = "https://i.imgur.com/7ywKdmd.png";

/** * ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
 */

function CallModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const handleCall = () => {
    if (job.customerPhone) {
      Linking.openURL(`tel:${job.customerPhone}`);
    }
  };

  return (
    <Modal transparent animationType="slide" visible={!!job}>
      <View className="flex-1 bg-black/60 justify-end sm:justify-center p-4">
        <View className="bg-white w-full max-w-sm self-center rounded-[40px] p-8 shadow-2xl">
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-[#39B5A8] items-center justify-center mb-3 shadow-lg">
              <Text className="text-white font-black text-3xl">
                {job.customerName.charAt(0)}
              </Text>
            </View>
            <Text className="text-xl font-black text-[#041614]">{job.customerName}</Text>
            <Text className="text-[#39B5A8] font-bold text-sm mt-1">{job.customerPhone}</Text>
            <View className="mt-2 bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleCall}
            className="w-full bg-[#39B5A8] py-4 rounded-2xl flex-row items-center justify-center gap-3 shadow-lg mb-3"
          >
            <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
              <Phone size={16} className="text-white" />
            </View>
            <Text className="text-white font-black text-base">Call Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} className="w-full py-3 items-center">
            <Text className="text-gray-400 font-bold text-sm">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ProgressTracker({ currentStep }: { currentStep: number }) {
  const steps = ["Pickup", "In Transit", "Delivery"];
  return (
    <View className="flex-row items-center justify-between w-full px-2">
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <View key={label} className="flex-1 items-center relative">
            {i < steps.length - 1 && (
              <View className="absolute top-5 left-1/2 w-full h-1">
                <View className={`h-full ${done ? "bg-[#39B5A8]" : "bg-gray-200"}`} />
              </View>
            )}
            <View className={`w-10 h-10 rounded-full items-center justify-center z-10 border-2 ${
              done ? "bg-[#39B5A8] border-[#39B5A8]"
              : active ? "bg-[#041614] border-[#041614] shadow-lg"
              : "bg-white border-gray-200"
            }`}>
              {done ? (
                <CheckCircle2 size={20} className="text-white" />
              ) : (
                <Text className={`font-black text-sm ${active ? "text-white" : "text-gray-400"}`}>{i + 1}</Text>
              )}
            </View>
            <Text className={`text-[11px] font-black mt-1.5 uppercase tracking-wider ${
              active ? "text-[#041614]" : done ? "text-[#39B5A8]" : "text-gray-400"
            }`}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function MapPlaceholder({ destination }: { destination: string }) {
  return (
    <View className="relative w-full h-52 rounded-2xl overflow-hidden bg-[#c8ede9]">
      {/* Background patterns simplified for native */}
      <View className="absolute inset-0 opacity-10 border border-[#1A5D56] rotate-45 scale-150" />
      
      <View className="absolute top-3 left-3 bg-white/90 rounded-xl px-3 py-2 flex-row items-center gap-2 shadow-sm">
        <Navigation size={16} className="text-[#39B5A8]" />
        <View>
          <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ETA to Pickup</Text>
          <Text className="text-sm font-black text-[#041614]">~8 mins</Text>
        </View>
      </View>
      
      <View className="absolute bottom-10 right-16 items-center">
        <View className="bg-[#041614] px-2 py-1 rounded-lg mb-1 shadow-lg">
          <Text className="text-white text-[10px] font-black" numberOfLines={1}>{destination}</Text>
        </View>
        <MapPin size={24} className="text-red-500" />
      </View>
      
      <View className="absolute top-16 left-24">
        <View className="w-4 h-4 bg-[#39B5A8] rounded-full border-2 border-white shadow-md" />
      </View>
      
      <View className="absolute bottom-2 right-2 bg-white/80 px-2 py-0.5 rounded-full">
        <Text className="text-[9px] text-gray-500 font-bold">Map preview</Text>
      </View>
    </View>
  );
}

export default function JobDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};
  const { jobs, updateJobStatus } = useJobs();
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const job = jobs.find(j => j.id === id) ?? null;

  useEffect(() => {
    if (!job) {
      Alert.alert("Error", "Job not found");
      navigation.goBack();
    }
  }, [job]);

  if (!job) return null;

  const currentStep = job.status === "available" ? 0 : job.status === "in-progress" ? 1 : 2;

  const handleAcceptJob = () => {
    updateJobStatus(job.id, "in-progress");
    setShowAcceptModal(false);
    navigation.navigate("DriverHome");
  };

  const handleOpenMaps = () => {
    const dest = job.status === 'available' ? job.pickup : job.dropoff;
    const url = Platform.select({
      ios: `maps:0,0?q=${dest}`,
      android: `geo:0,0?q=${dest}`
    });
    if (url) Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F0F9F8]">
      {showCallModal && <CallModal job={job} onClose={() => setShowCallModal(false)} />}

      {/* Header */}
      <View className="h-16 bg-white border-b border-[#39B5A8]/10 flex-row items-center px-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ArrowLeft size={20} className="text-[#39B5A8]" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-black text-[#041614] text-base mr-10">Job Details</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-5 space-y-4">
        {/* Progress Card */}
        <View className="bg-white border border-[#39B5A8]/10 rounded-[24px] p-5 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="bg-[#F0F9F8] px-2.5 py-1 rounded-lg border border-[#39B5A8]/10">
                <Text className="text-xs font-black text-[#39B5A8]">{job.jobNumber}</Text>
              </View>
              <View className={`px-2.5 py-1 rounded-full ${job.status === 'available' ? 'bg-green-100' : 'bg-blue-100'}`}>
                <Text className={`text-[10px] font-bold uppercase ${job.status === 'available' ? 'text-green-700' : 'text-blue-700'}`}>
                  {job.status === 'in-progress' ? 'In Progress' : job.status}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-black text-[#39B5A8] leading-none">{job.earnings}</Text>
              <Text className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Earnings</Text>
            </View>
          </View>
          
          <ProgressTracker currentStep={currentStep} />
          
          {job.timeLimit && (
            <View className="mt-6 flex-row items-center gap-2 bg-[#F0F9F8] border border-[#39B5A8]/20 rounded-xl px-3 py-2">
              <Clock size={16} className="text-[#39B5A8]" />
              <Text className="text-xs font-bold text-[#041614]">Est. completion: <Text className="text-[#39B5A8]">{job.timeLimit}</Text></Text>
            </View>
          )}
        </View>

        {/* Map Card */}
        <View className="bg-white border border-[#39B5A8]/10 rounded-[24px] p-4 shadow-sm mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Map size={16} className="text-[#39B5A8]" />
            <Text className="text-sm font-black text-[#041614]">Live Map</Text>
          </View>
          <MapPlaceholder destination={job.status === 'available' ? job.pickup : job.dropoff} />
          <TouchableOpacity 
            onPress={handleOpenMaps}
            className="mt-3 w-full bg-[#39B5A8] py-4 rounded-xl flex-row items-center justify-center gap-2 shadow-md"
          >
            <ExternalLink size={16} className="text-white" />
            <Text className="text-white font-black text-sm">Open Navigation</Text>
          </TouchableOpacity>
        </View>

        {/* Route Card */}
        <View className="bg-white border border-[#39B5A8]/10 rounded-[24px] p-5 shadow-sm mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Navigation size={16} className="text-[#39B5A8]" />
            <Text className="text-sm font-black text-[#041614]">Route</Text>
          </View>
          
          <View className="flex-row items-start gap-3">
            <View className="w-8 h-8 rounded-full bg-[#39B5A8] items-center justify-center">
              <MapPin size={16} className="text-white" />
            </View>
            <View className="flex-1">
              <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Pickup</Text>
              <Text className="text-[#041614] font-bold text-sm" numberOfLines={2}>{job.pickup}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center gap-3 pl-4 my-1">
            <View className="w-0.5 h-8 bg-gray-200 ml-0.5" />
            <Text className="text-xs text-gray-400 font-bold">{job.distance}</Text>
          </View>
          
          <View className="flex-row items-start gap-3">
            <View className="w-8 h-8 rounded-full bg-red-400 items-center justify-center">
              <MapPin size={16} className="text-white" />
            </View>
            <View className="flex-1">
              <Text className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Drop-off</Text>
              <Text className="text-[#041614] font-bold text-sm" numberOfLines={2}>{job.dropoff}</Text>
            </View>
          </View>
        </View>

        {/* Customer Card */}
        <View className="bg-white border border-[#39B5A8]/10 rounded-[24px] p-5 shadow-sm mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <User size={16} className="text-[#39B5A8]" />
            <Text className="text-sm font-black text-[#041614]">Customer</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-[#39B5A8] items-center justify-center">
                <Text className="text-white font-black text-base">{job.customerName.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[#041614] font-black text-sm" numberOfLines={1}>{job.customerName}</Text>
                <Text className="text-xs text-gray-400 font-bold">{job.customerPhone}</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => setShowCallModal(true)} className="p-3 bg-[#39B5A8] rounded-xl">
                <Phone size={18} className="text-white" />
              </TouchableOpacity>
              <TouchableOpacity className="p-3 bg-gray-100 rounded-xl">
                <MessageSquare size={18} className="text-gray-600" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-3 py-6">
          {job.status === 'available' ? (
            <>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                className="flex-1 py-4 bg-gray-100 rounded-2xl items-center"
              >
                <Text className="text-gray-600 font-black uppercase text-xs">Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowAcceptModal(true)}
                className="flex-[2] py-4 bg-[#39B5A8] rounded-2xl flex-row items-center justify-center gap-2 shadow-lg"
              >
                <CheckCircle2 size={18} className="text-white" />
                <Text className="text-white font-black uppercase text-xs">Accept Job</Text>
              </TouchableOpacity>
            </>
          ) : job.status === 'in-progress' ? (
            <>
              <TouchableOpacity 
                onPress={() => setShowCallModal(true)}
                className="flex-1 py-4 bg-white border-2 border-[#39B5A8] rounded-2xl flex-row items-center justify-center gap-2"
              >
                <Phone size={18} className="text-[#39B5A8]" />
                <Text className="text-[#39B5A8] font-black uppercase text-xs">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-[1.5] py-4 bg-[#041614] rounded-2xl flex-row items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCw size={18} className="text-white" />
                <Text className="text-white font-black uppercase text-xs">Update Status</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              onPress={() => navigation.navigate("DriverHome")}
              className="w-full py-4 bg-[#39B5A8] rounded-2xl items-center shadow-lg"
            >
              <Text className="text-white font-black uppercase text-xs">Back to Dashboard</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="h-10" />
      </ScrollView>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <Modal transparent animationType="fade" visible={showAcceptModal}>
          <View className="flex-1 bg-black/60 items-center justify-center p-6">
            <View className="bg-white p-8 rounded-[40px] w-full max-w-sm">
              <View className="items-center mb-6">
                 <View className="w-24 h-24 bg-[#F0F9F8] rounded-full items-center justify-center mb-3">
                   <Package size={48} className="text-[#39B5A8]" />
                 </View>
                 <Text className="text-2xl font-black text-[#041614] mb-2 text-center">Accept this job?</Text>
                 <Text className="text-gray-400 text-xs text-center leading-relaxed">
                   You're about to accept job <Text className="font-bold text-[#39B5A8]">{job.jobNumber}</Text>.
                 </Text>
              </View>
              <View className="bg-[#F0F9F8] rounded-3xl p-5 mb-8 flex-row justify-around">
                <View className="items-center">
                  <Text className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Earnings</Text>
                  <Text className="text-xl font-black text-[#39B5A8]">{job.earnings}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Distance</Text>
                  <Text className="text-xl font-black text-[#041614]">{job.distance}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={() => setShowAcceptModal(false)}>
                  <Text className="text-gray-400 font-bold py-2 px-4">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleAcceptJob}
                  className="bg-[#39B5A8] px-6 py-3 rounded-2xl shadow-lg"
                >
                  <Text className="text-white font-black text-sm uppercase">Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
