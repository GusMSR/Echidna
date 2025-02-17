import { StyleSheet, Button } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../../src/amplifyconfiguration.json';
import { getCurrentUser} from 'aws-amplify/auth';

Amplify.configure(amplifyconfig);

import { signOut } from 'aws-amplify/auth';

async function handleSignOut() {
    try {
      await signOut();
      router.replace('/SignIn'); // Redirect to sign-in page
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  }

export default function TabOneScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username, userId, signInDetails } = await getCurrentUser();
      console.log(`The username: ${username}`);
      console.log(`The userId: ${userId}`);
      console.log(`The signInDetails: ${signInDetails}`);
    } catch (err) {
      console.log(err);
      router.replace('/SignIn');
    }
  }
  useEffect(() => {
    // Check authentication on component mount
    currentAuthenticatedUser();
  }, []);

  if (!isAuthenticated) {
    // return null or a loading spinner while checking authentication
    return null; // or return <LoadingSpinner /> if you prefer
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IMPLEMENTAR PERFIL</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/four.tsx" />

      
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
