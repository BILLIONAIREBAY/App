import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';

export function usePrivacyShield() {
  usePreventScreenCapture();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      console.log('[PrivacyShield] App backgrounded - screen capture protection active');
    }
  };
}
