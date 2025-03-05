import { StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';
import { WrapText } from 'lucide-react-native';

Amplify.configure(amplifyconfig);

export default function SincronizationScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [lichessUsername, setLichessUsername] = useState('');
  const [chesscomUsername, setChesscomUsername] = useState('');

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
    currentAuthenticatedUser();
  }, []);

  if (!isAuthenticated) {
    return null; // Show loading screen or spinner while authentication is being checked
  }

  const handleSyncLichess = () => {
    console.log('Syncing with Lichess account...');
    // TODO: Implement the synchronization logic here
    setLichessUsername(username); // Placeholder for username
  };

  const handleSyncChesscom = () => {
    console.log('Syncing with Chess.com account...');
    // TODO: Implement the synchronization logic here
    setChesscomUsername(username); // Placeholder for username
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Synchronize Accounts</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Username"
        value={username}
        onChangeText={setUsername}
      />

      <View style={styles.buttonContainer}>
        {/* Lichess Synchronize Button */}
        <TouchableOpacity
          style={[styles.button, styles.lichessButton]}
          onPress={handleSyncLichess}
        >
          <Image
            source={require('../assets/images/lichess-logo.png')} // Add Lichess logo image to assets
            style={styles.buttonImage}
          />
          <Text style={styles.buttonText}>Synchronize with Lichess</Text>
        </TouchableOpacity>

        {/* Chess.com Synchronize Button */}
        <TouchableOpacity
          style={[styles.button, styles.chesscomButton]}
          onPress={handleSyncChesscom}
        >
          <Image
            source={require('../assets/images/chesscom-logo.png')} // Add Chess.com logo image to assets
            style={styles.buttonImage}
          />
          <Text style={styles.buttonText}>Synchronize with Chess.com</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Container for synchronized usernames */}
      <View style={styles.syncedContainer}>
        <Text style={styles.syncedText}>
          Synchronized: {"\n"}Lichess: {lichessUsername || 'Not synced'}, Chess.com: {chesscomUsername || 'Not synced'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '80%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  button: {
    width: '80%',
    height: 100,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lichessButton: {
    backgroundColor: '#1A1A1A', // Dark color for Lichess
  },
  chesscomButton: {
    backgroundColor: '#0062ff', // Chess.com blue
  },
  buttonImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  syncedContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#dcdcdc',
    marginTop: 30,
    alignItems: 'center',
    borderRadius: 10,
  },
  syncedText: {
    fontSize: 16,
    color: '#333',
  },
});
