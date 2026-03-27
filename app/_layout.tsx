import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { initDatabase } from '../db/database';
import { useAuthStore } from '../store/useAuthStore';
import { View, Text } from 'react-native';

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        await checkAuth();
        setDbInitialized(true);
      } catch (e) {
        console.error("Failed to initialize system", e);
      }
    };
    setup();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading App...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
