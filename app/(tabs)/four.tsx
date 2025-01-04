import { Button, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';

import { signOut } from 'aws-amplify/auth';

async function handleSignOut() {
    try {
      await signOut();
      router.replace('/SignIn'); // Redirect to sign-in page
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  }

export default function TabFourScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>IMPLEMENATR COSILLAS DEL PERFIL</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/two.tsx" />

      {/* Sign out button */}
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
