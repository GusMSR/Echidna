import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

Amplify.configure(amplifyconfig);

export default function AchievementsScreen() {
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
    currentAuthenticatedUser();
  }, []);

  if (!isAuthenticated) {
    return null; // Show loading screen or spinner while authentication is being checked
  }

  return (
    <ScrollView style={styles.container}>
      {/* Category 1 */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Category 1</Text>
        <Text style={[styles.achievementTitle, styles.achievementUnlocked]}>Achievement 1</Text>
        <Text style={styles.achievementDescription}>Description for achievement 1</Text>
        <Text style={[styles.achievementTitle, styles.achievementLocked]}>Achievement 2</Text>
        <Text style={styles.achievementDescription}>Description for achievement 2</Text>
        <Text style={[styles.achievementTitle, styles.achievementLocked]}>Achievement 3</Text>
        <Text style={styles.achievementDescription}>Description for achievement 3</Text>
      </View>

      {/* Category 2 */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Category 2</Text>
        <Text style={[styles.achievementTitle, styles.achievementUnlocked]}>Achievement 1</Text>
        <Text style={styles.achievementDescription}>Description for achievement 1</Text>
        <Text style={[styles.achievementTitle, styles.achievementLocked]}>Achievement 2</Text>
        <Text style={styles.achievementDescription}>Description for achievement 2</Text>
        <Text style={[styles.achievementTitle, styles.achievementLocked]}>Achievement 3</Text>
        <Text style={styles.achievementDescription}>Description for achievement 3</Text>
      </View>

      {/* Category 3 */}
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>Category 3</Text>
        <Text style={[styles.achievementTitle, styles.achievementUnlocked]}>Achievement 1</Text>
        <Text style={styles.achievementDescription}>Description for achievement 1</Text>
        <Text style={[styles.achievementTitle, styles.achievementLocked]}>Achievement 2</Text>
        <Text style={styles.achievementDescription}>Description for achievement 2</Text>
        <Text style={[styles.achievementTitle, styles.achievementLocked]}>Achievement 3</Text>
        <Text style={styles.achievementDescription}>Description for achievement 3</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  categoryContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    elevation: 5, // Shadow effect for pop-out effect
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#555',
  },
  achievementUnlocked: {
    color: 'green', // Green color for unlocked achievements
  },
  achievementLocked: {
    color: 'gray', // Gray color for locked achievements
  },
});
