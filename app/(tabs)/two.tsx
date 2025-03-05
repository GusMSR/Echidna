import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';

Amplify.configure(amplifyconfig);

export default function TabTwoScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username } = await getCurrentUser();
      console.log(`The username: ${username}`);
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

  const navigateToCalendar = () => {
    router.push('/Calendar');
  };

  const navigateToStats = () => {
    router.push('/Stats');
  };

  const navigateToAchievementHistory = () => {
    router.push('/Achivements');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check your progress!</Text>
      <View style={styles.separator} />

      <View style={styles.cardsContainer}>
        {/* Calendar */}
        <TouchableOpacity style={styles.card} onPress={navigateToCalendar}>
          <Ionicons name="calendar" size={40} color="#fff" />
          <Text style={styles.cardText}>Calendar</Text>
        </TouchableOpacity>

        {/* Stats */}
        <TouchableOpacity style={styles.card} onPress={navigateToStats}>
          <FontAwesome name="bar-chart" size={40} color="#fff" />
          <Text style={styles.cardText}>Stats</Text>
        </TouchableOpacity>

        {/* Achievement History */}
        <TouchableOpacity style={styles.card} onPress={navigateToAchievementHistory}>
          <Ionicons name="trophy" size={40} color="#fff" />
          <Text style={styles.cardText}>Achievements</Text>
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
    backgroundColor: '#f8f9fa', // Light background color for the screen
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: '#ddd',
  },
  cardsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
    flexWrap: 'wrap', // Allow wrapping on smaller screens
  },
  card: {
    backgroundColor: '#4e4e4e', // Grey background for the card
    borderRadius: 10,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    elevation: 5, // Add shadow for depth
    marginHorizontal: 10,
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
});
