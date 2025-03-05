import { StyleSheet, Button, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

import { signOut } from 'aws-amplify/auth';

Amplify.configure(amplifyconfig);

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
  const [username, setUsername] = useState(''); // Placeholder for logged-in user

  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username } = await getCurrentUser();
      setUsername(username); // Set the username
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
    // Return null or a loading spinner while checking authentication
    return null; // or return <LoadingSpinner /> if you prefer
  }

  const navigateToChangePassword = () => {
    router.push('/PasswordChange');
  };

  const navigateToSyncAccounts = () => {
    router.push('/Sincronization');
  };

  const navigateToTrainingCycle = () => {
    router.push('/TrainingCicle');
  };

  return (
    <View style={styles.container}>
      {/* Container for the username */}
      <View style={styles.usernameContainer}>
        {/* <Text style={styles.username}>{username || 'Loading user info...'}</Text>*/}
        <Text style={styles.username}>Username</Text>
      </View>

      <View style={styles.separator} />

      {/* Container for the buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={navigateToChangePassword}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={navigateToSyncAccounts}>
          <Text style={styles.buttonText}>Sync Accounts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={navigateToTrainingCycle}>
          <Text style={styles.buttonText}>Training Cycle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa', // Light background color for the screen
  },
  usernameContainer: {
    width: '100%',
    backgroundColor: '#D3D3D3', // Grey background for username container
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: '#ddd',
  },
  buttonsContainer: {
    width: '100%',
    backgroundColor: '#D3D3D3', // Grey background for the buttons container
    paddingVertical: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    backgroundColor: '#007BFF', // Primary button color
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
