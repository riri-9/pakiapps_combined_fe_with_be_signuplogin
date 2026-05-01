import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import LoginScreen from '../features/auth/screens/LoginScreen';
import RoleSelectionScreen from '../features/auth/screens/RoleSelectionScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';
import SignupStep2Screen from '../features/auth/screens/SignupStep2Screen';
import SignupStep3Screen from '../features/auth/screens/SignupStep3Screen';
import OperatorReminderScreen from '../features/auth/screens/OperatorReminderScreen';
import DriverReminderScreen from '../features/auth/screens/DriverReminderScreen';

// Feature Screens
import DriverHomeScreen from '../features/driver/screens/DriverHomeScreen';
import JobDetailsScreen from '../features/driver/screens/JobDetailsScreen';
import UpdateStatusScreen from '../features/driver/screens/UpdateStatusScreen';
import DriverProfileScreen from '../features/driver/screens/DriverProfileScreen';
import SenderHomeScreen from '../features/sender/screens/SenderHomeScreen';
import OperatorHomeScreen from '../features/operator/screens/OperatorHomeScreen';
import OperatorProfileScreen from '../features/operator/screens/OperatorProfileScreen';
import ReceiveParcelScreen from '../features/operator/screens/ReceiveParcelScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

type RootNavigatorProps = {
  onBackToLauncher?: () => void;
};

export default function RootNavigator({ onBackToLauncher }: RootNavigatorProps) {
  return (
    <Stack.Navigator id="RootStack" initialRouteName="Login" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onBackToLauncher={onBackToLauncher} />}
      </Stack.Screen>
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="SignupStep2" component={SignupStep2Screen} />
      <Stack.Screen name="SignupStep3" component={SignupStep3Screen} />
      <Stack.Screen name="OperatorReminder" component={OperatorReminderScreen} />
      <Stack.Screen name="DriverReminder" component={DriverReminderScreen} />
      
      {/* Driver Features */}
      <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="UpdateStatus" component={UpdateStatusScreen} />
      <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />

      {/* Sender Features */}
      <Stack.Screen name="CustomerHome" component={SenderHomeScreen} />

      {/* Operator Features */}
      <Stack.Screen name="OperatorHome" component={OperatorHomeScreen} />
      <Stack.Screen name="OperatorProfile" component={OperatorProfileScreen} />
      <Stack.Screen name="ReceiveParcel" component={ReceiveParcelScreen} />
    </Stack.Navigator>
  );
}
