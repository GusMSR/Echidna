import { Button, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { Link, router } from 'expo-router';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser} from 'aws-amplify/auth';

import  Chessboard  from 'react-native-chessboard';

Amplify.configure(amplifyconfig);

export default function ChallengesScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;

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
    return null;
  }

  return (
    <View style={isHorizontal ? styles.horizontalContainer : styles.verticalContainer}>
      <View style={styles.chessboardContainer}>
        <Text style={styles.playerName}>REPLACE WITH BLACKS NAME</Text> 
        <Chessboard boardSize={400} />
        <Text style={styles.playerName}>REPLACE WITH WHITES NAME</Text> 
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.challengeType}>Challenge Type: GET CHALLENGE TYPE</Text>
        <ScrollView style={styles.pgnBox}>
          <Text style={styles.pgnTitle}>Moves</Text>
          <Text style={styles.pgnContent}>
            {"1. e4     e5\n2. Nf3    Nc6\n3. Bb5    a6\n4. Ba4    Nf6\n5. O-O    Be7"}
          </Text>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button title="Go to Analysis" onPress={() => { /* TODO: Navigate to analysis page and automatically?*/ }} />
        </View>

        
      <Link href="/Analysis">
        Temporal Access to Analysis Page
      </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  verticalContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  chessboardContainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeType: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pgnBox: {
    width: '90%',
    height: 150,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 40,
  },
  pgnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pgnContent: {
    fontSize: 14,
  },
  buttonContainer: {
    alignItems: 'center', 
  },
});
