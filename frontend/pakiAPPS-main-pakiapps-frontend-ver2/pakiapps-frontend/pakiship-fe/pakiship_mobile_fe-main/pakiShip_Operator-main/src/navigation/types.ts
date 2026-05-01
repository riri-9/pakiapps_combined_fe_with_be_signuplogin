// Route param types for expo-router screens
export type RootStackParamList = {
  "(tabs)": undefined;
  "profile": undefined;
  "receive-parcel": undefined;
  "manual-entry": undefined;
  "update-status": undefined;
};

export type TabParamList = {
  index: { tour?: string; resume?: string };
  inventory: { tour?: string };
  analytics: undefined;
};
