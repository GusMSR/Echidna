import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { Link, router } from 'expo-router';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

Amplify.configure(amplifyconfig);

export default function GameHistoryScreen() {
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

  const navigateToAddGame = () => {
    router.push('/AddGameByHand'); // Navigates to the AddGameByHand page
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.gameListContainer}>
        <View style={styles.gameItem}>
          <Text>Plataforma: Chess.com</Text>
          <Text>Fecha: 2025-03-05</Text>
          <Text>Resultado: Victoria</Text>
          <Text>Rating: 1500</Text>
          <Text>Color: Blanco</Text>
        </View>
        <View style={styles.gameItem}>
          <Text>Plataforma: Lichess.org</Text>
          <Text>Fecha: 2025-03-04</Text>
          <Text>Resultado: Derrota</Text>
          <Text>Rating: 1400</Text>
          <Text>Color: Negro</Text>
        </View>
        <View style={styles.gameItem}>
          <Text>Plataforma: Chess.com</Text>
          <Text>Fecha: 2025-03-03</Text>
          <Text>Resultado: Tablas</Text>
          <Text>Rating: 1600</Text>
          <Text>Color: Blanco</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={navigateToAddGame}>
        <Text style={styles.addButtonText}>Add Game by Hand</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  gameListContainer: {
    width: '100%',
    marginBottom: 20,
  },
  gameItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
