import { StyleSheet, ScrollView, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

// Configure Amplify
Amplify.configure(amplifyconfig);

export default function StatsScreen() {
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
    return null; // Return null or a loading spinner while checking authentication
  }

  return (
    <ScrollView style={styles.container}>
      {/* Rating Graph Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Player Rating</Text>
        <View style={styles.graphPlaceholder}>
          <Text>Graph Placeholder - Rating vs Goal</Text>
          <Text>TODO: Implement graph with horizontal asymptote and time frame selector (All Time, Last Year, Last 3 Months)</Text>
          {/*TODO: Implement Recap*/}
        </View>
      </View>

      {/* Recap Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recap</Text>
        <View style={styles.recapContainer}>
          <Text> Check here after you finish your training cycle for a recap</Text>
          {/*TODO: Implement Recap*/}
        </View>
      </View>

      {/* Insights Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Player Insights</Text>

        {/* Winrate Section */}
        <View style={styles.insightContainer}>
          <Text>Winrate: TODO - Display total winrate</Text>
          <Text>Winrate (Last 20 Games): TODO - Display winrate of last 20 games</Text>
          <Text>Activity Schedule: TODO - Show when player plays most during the day</Text>
          <Text>WinStreak: TODO - Display current win streak</Text>
          <Text>LoseStreak: TODO - Display current lose streak</Text>
        </View>
      </View>

      {/* Radial Diagram Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Player Strength & Objectives</Text>
        <View style={styles.radialDiagramContainer}>
          <Text>TODO: Implement Radial Diagram (Strength and Objective)</Text>
          <Text>Strength: Tácticas, ataque, defensa, fortaleza mental, aperturas, estrategia y finales (Scale: 1-100)</Text>
          <Text>Objective: Grayed out polygon of the player's goal (Scale: 1-100)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  graphPlaceholder: {
    height: 350,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  recapContainer: {
    height: 100,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  insightContainer: {
    backgroundColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  radialDiagramContainer: {
    height: 250,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderRadius: 10,
  },
});
