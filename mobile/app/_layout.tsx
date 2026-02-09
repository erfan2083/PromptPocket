import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAuthStore } from '../src/stores/authStore';
import { usePromptStore } from '../src/stores/promptStore';
import { initializeFirebase, getCurrentUser, onPromptsChange } from '../src/services/firebase';
import { isFirebaseConfigured } from '../src/services/firebase-config';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    try {
      initializeFirebase();
      const user = getCurrentUser();
      if (user) {
        useAuthStore.setState({ isAuthenticated: true, email: user.email });
      }
    } catch (error) {
      console.error('Firebase init error:', error);
    }
  }, []);

  // Set up real-time listener when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsub = onPromptsChange((prompts) => {
      usePromptStore.getState().setPrompts(prompts);
    });

    return () => unsub();
  }, [isAuthenticated]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#e2e8f0',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          contentStyle: { backgroundColor: '#0f172a' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'PromptPocket' }}
        />
        <Stack.Screen
          name="login"
          options={{ title: 'Sign In', presentation: 'modal' }}
        />
        <Stack.Screen
          name="prompt/[id]"
          options={{ title: 'Prompt Details' }}
        />
        <Stack.Screen
          name="prompt/create"
          options={{ title: 'New Prompt', presentation: 'modal' }}
        />
        <Stack.Screen
          name="prompt/edit/[id]"
          options={{ title: 'Edit Prompt', presentation: 'modal' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Settings' }}
        />
      </Stack>
    </>
  );
}
