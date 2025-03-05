import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

Amplify.configure(amplifyconfig);

export default function AddGameByHandScreen() {
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
      <ScrollView style={styles.gameContainer}>
        <View style={styles.movesContainer}>
          <Text style={styles.moveTitle}>White</Text>
          {/* White moves */}
          {Array(6).fill(null).map((_, idx) => (
            <View style={styles.moveInputContainer} key={`white-${idx}`}>
              <TextInput 
                style={styles.moveInput} 
                placeholder={`Move ${idx + 1}`} 
              />
            </View>
          ))}
        </View>

        <View style={styles.movesContainer}>
          <Text style={styles.moveTitle}>Black</Text>
          {/* Black moves */}
          {Array(6).fill(null).map((_, idx) => (
            <View style={styles.moveInputContainer} key={`black-${idx}`}>
              <TextInput 
                style={styles.moveInput} 
                placeholder={`Move ${idx + 1}`} 
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addMoveButton}>
        <Text style={styles.addMoveButtonText}>Add Move</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  gameContainer: {
    width: '100%',
    marginBottom: 20,
  },
  movesContainer: {
    marginBottom: 20,
  },
  moveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  moveInputContainer: {
    marginBottom: 10,
  },
  moveInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addMoveButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addMoveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
