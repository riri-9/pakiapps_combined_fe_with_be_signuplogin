import { useEffect, useState, useRef, cloneElement } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Modal, 
  TextInput, 
  Pressable,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft, ArrowRight, User, Mail, Phone, MapPin, Save,
  Camera, Lock, Eye, EyeOff, ShieldCheck,
  Bell, MessageSquare, Shield, AlertCircle, Bike, RefreshCw, CheckCircle2,
  Navigation, Upload, FileText, X, Pencil, Calendar,
  Building2, FileBadge, Map, AlertTriangle
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthSession } from '../../auth/context/AuthSessionContext';

type TabType = 'profile' | 'vehicle' | 'preferences';

type PreferenceState = {
  jobNotifications: boolean;
  smsAlerts: boolean;
  autoAcceptJobs: boolean;
  emailNotifications: boolean;
  twoFactor: boolean;
};

type ToggleItemProps = {
  label: string;
  desc: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

// Mock/Stub for image compression and storage
const compressImage = async (uri: string) => uri;

export default function DriverProfileScreen() {
  const navigation = useNavigation<any>();
  const { currentUser } = useAuthSession();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false });

  // State for Document Delete Confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    key: 'license' | 'permit' | 'selfie' | null;
    label: string;
  }>({
    show: false,
    key: null,
    label: ''
  });
  
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: 'Juan Dela Cruz',
    email: 'juandelacruz@pakiship.com',
    phone: '09124875532',
    address: 'Espana Blvd., Sampaloc Manila',
    birthdate: '2005-06-01',
  });

  useEffect(() => {
    setFormData((previous) => ({
      ...previous,
      name: currentUser?.fullName?.trim() || previous.name,
      email: currentUser?.email?.trim().toLowerCase() || previous.email,
    }));
  }, [currentUser]);

  const [businessDocs, setBusinessDocs] = useState({
    license: { url: 'verified', type: 'image/png' },
    permit: { url: 'verified', type: 'image/png' },
    selfie: { url: 'verified', type: 'image/png' }
  });

  const vehicleData = {
    vehicleType: 'Motorcycle',
    plateNumber: 'ABC-1234',
    licenseNumber: 'N03-12-345678',
    driverId: 'DRV-2026-0042',
  };

  const [preferences, setPreferences] = useState({
    jobNotifications: true,
    smsAlerts: true,
    autoAcceptJobs: false,
    emailNotifications: true,
    twoFactor: false,
  });

  const [passwordData, setPasswordData] = useState({ current: '', new: '' });

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
    navigation.goBack();
  };

  const pickImage = async (type: 'profile' | 'doc', docKey?: keyof typeof businessDocs) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (!asset) {
        return;
      }

      const uri = asset.uri;
      if (type === 'profile') {
        setProfilePicture(uri);
      } else if (docKey) {
        setBusinessDocs(prev => ({
          ...prev,
          [docKey]: { url: uri, type: 'image' }
        }));
      }
    }
  };

  const userInitials = formData.name 
    ? formData.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'US';

  return (
    <SafeAreaView className="flex-1 bg-[#F0F9F8]">
      {/* Header */}
      <View className="h-16 bg-white border-b border-[#39B5A8]/10 flex-row items-center px-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-2">
          <ArrowLeft size={20} className="text-[#39B5A8]" />
          <Text className="font-bold text-[#39B5A8]">Back</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center font-black text-[#041614] text-lg mr-10">Profile Settings</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4 pb-20">
        {/* Profile Card */}
        <View className="bg-white rounded-[32px] p-5 border border-[#39B5A8]/10 shadow-sm flex-row items-center gap-4 mb-6">
          <View className="relative">
            <View className="w-20 h-20 rounded-[24px] bg-[#1A5D56] items-center justify-center overflow-hidden border-2 border-[#F0F9F8]">
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} className="w-full h-full" />
              ) : (
                <Text className="text-3xl font-black text-white">{userInitials}</Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={() => pickImage('profile')}
              className="absolute -bottom-1 -right-1 bg-[#39B5A8] p-1.5 rounded-lg border-2 border-white shadow-lg"
            >
              <Camera size={14} className="text-white" />
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-black text-[#041614] leading-tight">{formData.name}</Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <Text className="text-[10px] font-black text-[#39B5A8] uppercase tracking-widest">Driver Account</Text>
              <CheckCircle2 size={12} className="text-green-500" />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="bg-white p-1 rounded-2xl border border-[#39B5A8]/10 shadow-sm flex-row mb-6">
          {(['profile', 'vehicle', 'preferences'] as TabType[]).map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === tab ? 'bg-[#F0F9F8]' : ''}`}
            >
              <Text className={`text-xs font-bold capitalize ${activeTab === tab ? 'text-[#39B5A8]' : 'text-gray-400'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'profile' && (
          <View className="bg-white rounded-[32px] p-6 border border-[#39B5A8]/10 shadow-sm space-y-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-2xl font-black text-[#041614]">Personal Details</Text>
              <TouchableOpacity 
                onPress={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-xl border ${isEditing ? 'bg-red-50 border-red-200' : 'bg-[#39B5A8] border-[#39B5A8]'}`}
              >
                <Pencil size={18} className={isEditing ? 'text-red-500' : 'text-white'} />
              </TouchableOpacity>
            </View>

            <FormInput label="Full Name" value={formData.name} icon={<User />} readOnly={!isEditing} />
            <FormInput label="Email Address" value={formData.email} icon={<Mail />} readOnly={!isEditing} />
            <FormInput label="Phone Number" value={formData.phone} icon={<Phone />} readOnly={!isEditing} />
            <FormInput label="Primary Address" value={formData.address} icon={<MapPin />} readOnly={!isEditing} />

            <View className="pt-4 mt-2 border-t border-gray-50">
               <TouchableOpacity 
                 onPress={() => setShowPasswordModal(true)}
                 className="flex-row items-center justify-between py-2"
               >
                 <View className="flex-row items-center gap-3">
                   <View className="p-2 bg-gray-50 rounded-lg"><Lock size={18} className="text-gray-400" /></View>
                   <Text className="font-bold text-[#041614]">Password & Security</Text>
                 </View>
                 <ArrowRight size={16} className="text-gray-300" />
               </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'vehicle' && (
          <View className="space-y-6">
            <View className="bg-white rounded-[32px] p-6 border border-[#39B5A8]/10 shadow-sm space-y-4">
              <Text className="text-xl font-black text-[#041614] mb-2">Verification Documents</Text>
              <DocItem label="Driver's License" status="Verified" icon={<Shield />} />
              <DocItem label="Vehicle OR/CR" status="Verified" icon={<FileText />} />
              <DocItem label="Selfie with ID" status="Verified" icon={<User />} />
            </View>

            <View className="bg-white rounded-[32px] p-6 border border-[#39B5A8]/10 shadow-sm space-y-4">
              <Text className="text-xl font-black text-[#041614] mb-2">Vehicle Info</Text>
              <View className="flex-row gap-4">
                <View className="flex-1"><Text className="text-[10px] font-black text-[#39B5A8] uppercase mb-1">Type</Text><Text className="font-bold text-[#041614]">{vehicleData.vehicleType}</Text></View>
                <View className="flex-1"><Text className="text-[10px] font-black text-[#39B5A8] uppercase mb-1">Plate No.</Text><Text className="font-bold text-[#041614]">{vehicleData.plateNumber}</Text></View>
              </View>
              <View><Text className="text-[10px] font-black text-[#39B5A8] uppercase mb-1">License No.</Text><Text className="font-bold text-[#041614]">{vehicleData.licenseNumber}</Text></View>
              <View className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mt-2">
                <Text className="text-[10px] text-amber-800 leading-tight">To update vehicle information, please contact support for re-verification.</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'preferences' && (
          <View className="bg-white rounded-[32px] p-6 border border-[#39B5A8]/10 shadow-sm space-y-4">
            <Text className="text-xl font-black text-[#041614] mb-4">App Preferences</Text>
            <ToggleItem 
              label="Job Notifications" 
              desc="Alerts for new requests" 
              value={preferences.jobNotifications} 
              onValueChange={(val) => setPreferences((p: PreferenceState) => ({...p, jobNotifications: val}))} 
            />
            <ToggleItem 
              label="Auto-accept" 
              desc="Instantly accept nearby jobs" 
              value={preferences.autoAcceptJobs} 
              onValueChange={(val) => setPreferences((p: PreferenceState) => ({...p, autoAcceptJobs: val}))} 
            />
            <ToggleItem 
              label="2FA Security" 
              desc="Dual-layer verification" 
              value={preferences.twoFactor} 
              onValueChange={(val) => setPreferences((p: PreferenceState) => ({...p, twoFactor: val}))} 
            />
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Save Button */}
      {isEditing && (
        <View className="absolute bottom-6 left-6 right-6">
          <TouchableOpacity 
            onPress={handleSave}
            className="bg-[#39B5A8] py-4 rounded-2xl items-center shadow-lg shadow-[#39B5A8]/30"
          >
            <Text className="text-white font-black uppercase tracking-widest text-sm">Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Security Modal */}
      <Modal transparent visible={showPasswordModal} animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[40px] p-8 pb-12">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-black text-[#041614]">Security Update</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}><X size={24} className="text-gray-300" /></TouchableOpacity>
            </View>
            <View className="space-y-4">
              <FormInput label="Current Password" value="..." readOnly secureTextEntry />
              <FormInput label="New Password" value="" placeholder="Enter new password" secureTextEntry />
            </View>
            <TouchableOpacity 
              className="bg-[#041614] py-4 rounded-2xl items-center mt-8"
              onPress={() => setShowPasswordModal(false)}
            >
              <Text className="text-white font-black uppercase tracking-widest text-sm">Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function FormInput({ label, icon, value, readOnly, placeholder, secureTextEntry }: any) {
  return (
    <View className="space-y-1">
      <Text className="text-[10px] font-black text-[#39B5A8] uppercase tracking-widest ml-1">{label}</Text>
      <View className={`flex-row items-center border rounded-2xl px-4 h-14 ${readOnly ? 'bg-gray-50 border-gray-100' : 'bg-[#F0F9F8] border-transparent'}`}>
        <View className="text-[#39B5A8]/60 mr-3">{cloneElement(icon, { size: 18 })}</View>
        <TextInput 
          className={`flex-1 font-bold text-[#041614] ${readOnly ? 'text-gray-400' : ''}`}
          value={value}
          editable={!readOnly}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
        />
      </View>
    </View>
  );
}

function DocItem({ label, status, icon }: any) {
  return (
    <View className="flex-row items-center justify-between p-4 bg-[#F0F9F8]/50 rounded-2xl border border-[#39B5A8]/05">
      <View className="flex-row items-center gap-3">
        <View className="p-2 bg-white rounded-xl shadow-sm text-[#39B5A8]">{cloneElement(icon, { size: 18 })}</View>
        <View>
          <Text className="font-bold text-[#041614] text-xs">{label}</Text>
          <Text className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{status}</Text>
        </View>
      </View>
      <CheckCircle2 size={16} className="text-green-500" />
    </View>
  );
}

function ToggleItem({ label, desc, value, onValueChange }: ToggleItemProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 mr-4">
        <Text className="font-bold text-[#1A5D56]">{label}</Text>
        <Text className="text-[10px] text-gray-400 font-medium">{desc}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: '#e4e4e7', true: '#39B5A8' }}
        thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
      />
    </View>
  );
}
