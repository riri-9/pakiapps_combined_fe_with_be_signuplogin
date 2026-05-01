import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import LoginScreen from '../features/auth/screens/LoginScreen';
import RoleSelectionScreen from '../features/auth/screens/RoleSelectionScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';
import SignupStep2Screen from '../features/auth/screens/SignupStep2Screen';
import SignupStep3Screen from '../features/auth/screens/SignupStep3Screen';
import SenderHomeScreen from '../features/sender/screens/SenderHomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator id="RootStack" initialRouteName="Login" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="SignupStep2" component={SignupStep2Screen} />
      <Stack.Screen name="SignupStep3" component={SignupStep3Screen} />

      {/* Sender Features */}
      <Stack.Screen name="CustomerHome" component={SenderHomeScreen} />
    </Stack.Navigator>
  );
}
