import { StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { Amplify } from 'aws-amplify';
import { generateClient, GraphQLResult } from 'aws-amplify/api';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser} from 'aws-amplify/auth';
import { updateUser } from '../src/graphql/mutations';
import * as queries from '../src/graphql/queries';

Amplify.configure(amplifyconfig);
const client = generateClient();

export default function SincronizationScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [lichessUsername, setLichessUsername] = useState('');
  const [chesscomUsername, setChesscomUsername] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);


  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username, userId, signInDetails } = await getCurrentUser();
      //console.log(`The username: ${username}`);
      //console.log(`The userId: ${userId}`);
      //console.log(`The signInDetails: ${signInDetails}`);

      // Set the current syced accounts
        const res = await client.graphql({
          query: queries.getUser,
          variables: { id: userId },
        }) as GraphQLResult<any>;

        const user = res.data?.getUser;
        if (user) {
          setLichessUsername(user.lichessUsername || 'Not synced');
          setChesscomUsername(user.chesscomUsername || 'Not synced');
        }

    } catch (err) {
      console.log(err);
      router.replace('/SignIn');
    }
  }

  useEffect(() => {
    currentAuthenticatedUser();
  }, []);

  if (!isAuthenticated) {
    return null; 
  }

  const handleSyncLichess = async () => {
    console.log('Syncing with Lichess account...');
    try {
      const res = await fetch(`https://lichess.org/api/user/${username}`);
      if (!res.ok) throw new Error('Invalid username');
      const user = await res.json();
      console.log(user);

      setLichessUsername(user.username);
      setStatusMessage('Lichess user synced');

      //Update the synced account
      const {userId} = await getCurrentUser();
      await client.graphql({
        query: updateUser,
        variables: {
          input: {
            id: userId, 
            lichessUsername: user.username,
          }
        },
      });

      setStatusType('success');
    } catch (e) {
      console.error('Username not found');
      setStatusMessage('Lichess user not found');
      setStatusType('error');
    }
    setTimeout(() => {
      setStatusMessage('');
      setStatusType(null);
    }, 3000);
  };

  const handleSyncChesscom = async () => {
    console.log('Syncing with Chess.com account...');
    try {
      const res = await fetch(`https://api.chess.com/pub/player/${username}`);
      if (!res.ok) throw new Error('Invalid username');
      const user = await res.json();
      console.log(user);

      setChesscomUsername(user.username);
      setStatusMessage('Chess.com account synced');

      //Update the synced account
      const {userId} = await getCurrentUser();
      await client.graphql({
        query: updateUser,
        variables: {
          input: {
            id: userId, 
            chesscomUsername: user.username,
          }
        },
      });

      setStatusType('success');
    } catch (e) {
      console.error('Username not found');
      setStatusMessage('Chess.com user not found');
      setStatusType('error');
    }

    setTimeout(() => {
      setStatusMessage('');
      setStatusType(null);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {statusMessage ? (
        <View
          style={[
            styles.statusPopup,
            statusType === 'error' ? styles.statusPopupError : styles.statusPopupSuccess,
          ]}
        >
          <Text style={{ color: 'white' }}>{statusMessage}</Text>
        </View>
      ) : null}
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
          Synchronized: {"\n"}Lichess: {lichessUsername}, Chess.com: {chesscomUsername}
        </Text>
      </View>
      <Text style={styles.syncWarning}> ⚠️ Warning: synching a new account or changing to a new one might cause your game history to not show for a few hours while your games are being exported</Text>
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
  statusPopup: {
  position: 'absolute',
  top: 20,
  left: 0,
  right: 0,
  padding: 10,
  textAlign: 'center',
  fontWeight: 'bold',
  borderRadius: 5,
  zIndex: 1000,
},

statusPopupSuccess: {
  backgroundColor: 'rgba(0, 200, 0, 0.8)',
  color: 'white',
},

statusPopupError: {
  backgroundColor: 'rgba(255, 0, 0, 0.8)',
  color: 'white',
},
syncWarning: {
  marginTop: 40,
  marginHorizontal: 20,
  fontSize: 14,
  color: '#d97706', // un naranja suave de advertencia
  textAlign: 'center',
  fontStyle: 'italic',
}
});
