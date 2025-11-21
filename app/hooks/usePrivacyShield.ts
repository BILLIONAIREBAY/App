import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usePreventScreenCapture } from 'expo-screen-capture';

export function usePrivacyShield() {
  usePreventScreenCapture();
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      setShowBlur(true);
      console.log('[PrivacyShield] App backgrounded - blur overlay active');
    } else if (nextAppState === 'active') {
      setShowBlur(false);
    }
  };

  return showBlur;
}
