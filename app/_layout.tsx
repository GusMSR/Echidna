import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  //return <RootLayoutNav />;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="SignUp" options={{ headerShown: false }} />
        <Stack.Screen name="ConfirmSignUp" options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" options={{ headerShown: false }} />
        <Stack.Screen name="PasswordRecovery" options={{ headerShown: false }} />
        <Stack.Screen name="ConfirmPasswordRecovery" options={{ headerShown: false }} />
        <Stack.Screen name="Analysis" options={{ headerShown: true }} />
        <Stack.Screen name="Achivements" options={{ headerShown: true }} />
        <Stack.Screen name="AddGameByHand" options={{ headerShown: true }} />
        <Stack.Screen name="Calendar" options={{ headerShown: true }} />
        <Stack.Screen name="Challenges" options={{ headerShown: true }} />
        <Stack.Screen name="GameHistory" options={{ headerShown: true }} />
        <Stack.Screen name="PasswordChange" options={{ headerShown: true }} />
        <Stack.Screen name="Quiz" options={{ headerShown: true }} />
        <Stack.Screen name="Sincronization" options={{ headerShown: true }} />
        <Stack.Screen name="Stats" options={{ headerShown: true }} />
        <Stack.Screen name="TrainingCicle" options={{ headerShown: true }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
