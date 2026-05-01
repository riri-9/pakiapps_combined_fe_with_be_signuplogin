import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  Clock3,
  LogOut,
  MapPin,
  Package2,
  Search,
  Star,
  User,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const logoImg = require('../../../../assets/logo.png');
const sendParcelMascot = require('../../../../assets/mascot-send-parcel.png');
const trackMascot = require('../../../../assets/mascot-track.png');
const historyMascot = require('../../../../assets/mascot-history.png');
const rateMascot = require('../../../../assets/mascot-rate.png');

const quickActions = [
  {
    title: 'Send Parcel',
    subtitle: 'BOOK A DELIVERY',
    accent: '#F4B860',
    image: sendParcelMascot,
    imageStyle: { width: 66, height: 92 },
  },
  {
    title: 'Track Package',
    subtitle: 'LIVE TRACKING',
    accent: '#87D2DA',
    image: trackMascot,
    imageStyle: { width: 84, height: 92 },
  },
  {
    title: 'History',
    subtitle: 'PAST DELIVERIES',
    accent: '#C9AFE7',
    image: historyMascot,
    imageStyle: { width: 66, height: 92 },
  },
  {
    title: 'Rate & Review',
    subtitle: 'GIVE FEEDBACK',
    accent: '#A7D8C8',
    image: rateMascot,
    imageStyle: { width: 66, height: 92 },
  },
];

const deliveries = [
  {
    id: 'PKS-2024-001',
    destination: 'Makati City',
    eta: '15 mins away',
    status: 'IN TRANSIT',
    tone: 'teal' as const,
  },
  {
    id: 'PKS-2024-002',
    destination: 'Quezon City',
    eta: '20 mins away',
    status: 'OUT FOR DELIVERY',
    tone: 'orange' as const,
  },
];

export default function CustomerHomeScreen() {
  const navigation = useNavigation<any>();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#F2F8F6]">
      <View className="flex-1">
        <Header onLogout={() => setShowLogoutModal(true)} />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 8, paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          <InfoBanner
            icon={<AlertTriangle color="#D28A17" size={14} strokeWidth={2.4} />}
            title="SCHEDULED MAINTENANCE"
            message="System will be offline on March 15, 2:00 AM - 4:00 AM PHT."
            backgroundClassName="bg-[#FBE8B9]"
            borderClassName="border-[#E9C872]"
            dismissible={false}
          />

          <InfoBanner
            icon={<Package2 color="#6BB9C4" size={14} strokeWidth={2.4} />}
            title="NEW PARTNER HUBS"
            message="Expanded locations in Legazpi City."
            backgroundClassName="bg-[#D6F0ED]"
            borderClassName="border-[#9FD2CD]"
            dismissible
          />

          <Text className="mt-4 mb-3 text-[13px] font-black tracking-[2px] uppercase text-[#4FA69E]">
            Navigation Menu
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((item) => (
              <QuickActionCard
                key={item.title}
                title={item.title}
                subtitle={item.subtitle}
                accent={item.accent}
                image={item.image}
                imageStyle={item.imageStyle}
              />
            ))}
          </View>

          <View className="mt-5 mb-2 flex-row items-center justify-between">
            <Text className="text-[24px] leading-[28px] font-black text-[#041614]">
              Active Deliveries
            </Text>
            <TouchableOpacity>
              <Text className="text-[11px] font-bold text-[#58B7AE]">View All</Text>
            </TouchableOpacity>
          </View>

          {deliveries.map((item) => (
            <DeliveryCard key={item.id} {...item} />
          ))}
        </ScrollView>
      </View>

      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/45 px-6">
          <View className="w-full max-w-sm rounded-[34px] bg-white px-6 pb-6 pt-7">
            <Text className="text-center text-[23px] font-black text-[#041614]">
              Sign out of PakiSHIP?
            </Text>
            <Text className="mt-2 text-center text-[13px] leading-[19px] text-[#7C9692]">
              You can still log back in anytime to keep tracking your parcels.
            </Text>

            <View className="mt-6 gap-3">
              <TouchableOpacity
                className="items-center rounded-[18px] bg-[#041614] py-4"
                onPress={() => {
                  setShowLogoutModal(false);
                  navigation.navigate('Login');
                }}
              >
                <Text className="text-[13px] font-black uppercase tracking-[2px] text-white">
                  Sign Out
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center rounded-[18px] bg-[#EFF7F5] py-4"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-[13px] font-black uppercase tracking-[2px] text-[#4FA69E]">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Header({ onLogout }: { onLogout: () => void }) {
  return (
    <View className="bg-white px-3 pb-3 pt-2">
      <View className="flex-row items-center justify-between">
        <Image source={logoImg} style={{ width: 88, height: 26 }} resizeMode="contain" />

        <View className="flex-row items-center">
          <HeaderIcon>
            <Bell color="#57B7AF" size={16} strokeWidth={2.4} />
            <View className="absolute -right-1 -top-1 h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 shadow-sm">
              <Text className="text-[9px] font-black text-[#F27E7B]">2</Text>
            </View>
          </HeaderIcon>

          <HeaderIcon>
            <Search color="#57B7AF" size={16} strokeWidth={2.4} />
          </HeaderIcon>

          <HeaderIcon>
            <User color="#9ACBC5" size={16} strokeWidth={2.4} />
          </HeaderIcon>

          <TouchableOpacity
            onPress={onLogout}
            className="ml-2 h-8 w-8 items-center justify-center rounded-full"
          >
            <LogOut color="#F28D8A" size={16} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function HeaderIcon({ children }: { children: React.ReactNode }) {
  return (
    <TouchableOpacity className="ml-2 h-8 w-8 items-center justify-center rounded-full border border-[#A9D7D2] bg-[#F7FCFB]">
      {children}
    </TouchableOpacity>
  );
}

function InfoBanner({
  icon,
  title,
  message,
  backgroundClassName,
  borderClassName,
  dismissible = false,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  backgroundClassName: string;
  borderClassName: string;
  dismissible?: boolean;
}) {
  return (
    <View
      className={`mb-3 flex-row items-start rounded-[18px] border px-3 py-3 ${backgroundClassName} ${borderClassName}`}
    >
      <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-white/70">
        {icon}
      </View>

      <View className="flex-1 pr-2">
        <Text className="text-[10px] font-black uppercase tracking-wide text-[#8B5B15]">
          {title}
        </Text>
        <Text className="mt-0.5 text-[10px] leading-[14px] text-[#56706B]">{message}</Text>
      </View>

      {dismissible ? (
        <TouchableOpacity className="ml-1 pt-0.5">
          <Text className="text-[14px] font-bold text-[#6A8E89]">×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function QuickActionCard({
  title,
  subtitle,
  accent,
  image,
  imageStyle,
}: {
  title: string;
  subtitle: string;
  accent: string;
  image: any;
  imageStyle: { width: number; height: number };
}) {
  return (
    <TouchableOpacity className="mb-3 w-[48.5%] rounded-[22px] border border-[#CBE6E1] bg-white px-3 pb-3 pt-4 shadow-sm">
      <View className="items-center">
        <View
          className="mb-2 h-[78px] w-full items-center justify-end"
          style={{ backgroundColor: `${accent}33` }}
        >
          <Image source={image} style={imageStyle} resizeMode="contain" />
        </View>

        <Text className="text-center text-[12px] font-black leading-[15px] text-[#041614]">
          {title}
        </Text>
        <Text className="mt-1 text-center text-[8px] font-black uppercase tracking-wide text-[#9DAEAC]">
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function DeliveryCard({
  id,
  destination,
  eta,
  status,
  tone,
}: {
  id: string;
  destination: string;
  eta: string;
  status: string;
  tone: 'teal' | 'orange';
}) {
  const statusClasses =
    tone === 'orange'
      ? {
          pill: 'bg-[#FFF1DD]',
          text: 'text-[#F3A234]',
          action: 'bg-[#45C0B1]',
        }
      : {
          pill: 'bg-[#E6F7F3]',
          text: 'text-[#4BAEA4]',
          action: 'bg-[#45C0B1]',
        };

  return (
    <View className="mb-3 rounded-[18px] border border-[#D4E9E4] bg-white px-3 py-3 shadow-sm">
      <View className="flex-row items-start">
        <View className="mr-3 mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-[#EDF8F5]">
          <Package2 color="#5CB8AF" size={16} strokeWidth={2.1} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-[13px] font-black text-[#115E5A]">{id}</Text>
            <Text className="ml-1 text-[12px] text-[#45C0B1]">•</Text>
          </View>

          <View className="mt-1 flex-row items-center">
            <MapPin color="#9AB0AB" size={10} strokeWidth={2.2} />
            <Text className="ml-1 text-[10px] text-[#788E89]">{destination}</Text>
          </View>

          <View className="mt-1 flex-row items-center">
            <Clock3 color="#A1B7B3" size={10} strokeWidth={2.2} />
            <Text className="ml-1 text-[10px] text-[#A1B7B3]">{eta}</Text>
          </View>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className={`rounded-full px-2.5 py-1 ${statusClasses.pill}`}>
          <Text className={`text-[8px] font-black uppercase tracking-wide ${statusClasses.text}`}>
            {status}
          </Text>
        </View>

        <TouchableOpacity className={`flex-row items-center rounded-full px-3 py-1.5 ${statusClasses.action}`}>
          <Text className="mr-1 text-[9px] font-black uppercase tracking-wide text-white">
            Track
          </Text>
          <ChevronRight color="white" size={12} strokeWidth={2.8} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
