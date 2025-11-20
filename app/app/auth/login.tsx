import { View, Text, Pressable, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'bbay_session';

export default function LoginScreen() {
  const [hasSession, setHasSession] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBiometricSupport();
    checkExistingSession();
  }, []);

  async function checkBiometricSupport() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricSupported(compatible && enrolled);
  }

  async function checkExistingSession() {
    try {
      const session = await SecureStore.getItemAsync(SESSION_KEY);
      setHasSession(!!session);
    } catch (error) {
      console.error('Failed to check session:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBiometricAuth() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock BillionaireBay',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const session = await SecureStore.getItemAsync(SESSION_KEY);
        if (session) {
          router.replace('/');
        }
      } else {
        Alert.alert('Authentication Failed', 'Please try again');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('Error', 'Authentication failed');
    }
  }

  async function handleCreateAccount() {
    try {
      const sessionId = `session_${Date.now()}`;
      await SecureStore.setItemAsync(SESSION_KEY, sessionId);
      
      Alert.alert(
        'Account Created',
        'Your secure wallet has been created. You can now access BillionaireBay.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to create account:', error);
      Alert.alert('Error', 'Failed to create account');
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-6 justify-center">
      <View className="mb-12">
        <Text className="text-white text-5xl font-bold mb-2">BillionaireBay</Text>
        <Text className="text-gray-400 text-lg">Phygital Sovereignty Marketplace</Text>
      </View>

      {hasSession ? (
        <View className="space-y-4">
          <Text className="text-white text-xl mb-6">Welcome back</Text>
          
          {isBiometricSupported ? (
            <Pressable
              onPress={handleBiometricAuth}
              className="bg-white py-4 px-6 rounded-lg active:opacity-80"
            >
              <Text className="text-black text-center font-semibold text-lg">
                Unlock with Face ID
              </Text>
            </Pressable>
          ) : (
            <Text className="text-gray-400 text-center">
              Biometric authentication not available
            </Text>
          )}
        </View>
      ) : (
        <View className="space-y-4">
          <Text className="text-white text-xl mb-6">Get Started</Text>
          
          <Pressable
            onPress={handleCreateAccount}
            className="bg-white py-4 px-6 rounded-lg active:opacity-80"
          >
            <Text className="text-black text-center font-semibold text-lg">
              Create Account
            </Text>
          </Pressable>

          <Pressable
            onPress={() => Alert.alert('Wallet Link', 'Wallet connection coming soon')}
            className="border border-white py-4 px-6 rounded-lg active:opacity-80"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Link Existing Wallet
            </Text>
          </Pressable>
        </View>
      )}

      <View className="mt-12">
        <Text className="text-gray-500 text-sm text-center">
          Powered by LUMINESCENCE V3
        </Text>
        <Text className="text-gray-600 text-xs text-center mt-2">
          Local-First • Edge-Orchestrated • FxChain Native
        </Text>
      </View>
    </View>
  );
}
