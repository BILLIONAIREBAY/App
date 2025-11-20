import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
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
      </Stack>
    </>
  );
}
