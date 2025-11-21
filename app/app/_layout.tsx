import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { createClient } from '@supabase/supabase-js';
import { usePrivacyShield } from '../hooks/usePrivacyShield';
import { GatekeeperModal } from '../components/GatekeeperModal';
import '../global.css';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function compareVersions(current: string, required: string): boolean {
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
    const curr = currentParts[i] || 0;
    const req = requiredParts[i] || 0;
    
    if (curr < req) return true;
    if (curr > req) return false;
  }
  
  return false;
}

export default function RootLayout() {
  usePrivacyShield();

  const [gatekeeperState, setGatekeeperState] = useState<{
    type: 'update' | 'maintenance' | null;
    message?: string;
  }>({ type: null });

  useEffect(() => {
    checkAppConfig();
  }, []);

  const checkAppConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .eq('id', 1)
        .single();

      if (error || !data) {
        console.error('[Gatekeeper] Failed to fetch app config:', error);
        return;
      }

      if (data.maintenance_mode) {
        setGatekeeperState({
          type: 'maintenance',
          message: data.maintenance_message || undefined,
        });
        return;
      }

      const currentVersion = Application.nativeApplicationVersion || '1.0.0';
      const minVersion = Platform.OS === 'ios'
        ? data.min_supported_version_ios
        : data.min_supported_version_android;

      const needsUpdate = compareVersions(currentVersion, minVersion);

      if (needsUpdate) {
        setGatekeeperState({ type: 'update' });
      }
    } catch (error) {
      console.error('[Gatekeeper] Error:', error);
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <GatekeeperModal
        visible={gatekeeperState.type !== null}
        type={gatekeeperState.type || 'update'}
        message={gatekeeperState.message}
      />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0A0A0A',
          },
          headerTintColor: '#D4AF37',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#0A0A0A',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'BillionaireBay',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="auction/[id]"
          options={{
            title: 'Live Auction',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
    </>
  );
}
