import { GestureHandlerRootView } from 'react-native-gesture-handler';
import EditScreenInfo from '@/components/EditScreenInfo';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Calendar, BookOpen, Puzzle } from 'lucide-react-native';

import { Amplify } from 'aws-amplify';
import { generateClient, GraphQLResult } from 'aws-amplify/api';
import amplifyconfig from '../../src/amplifyconfiguration.json';
import { getCurrentUser} from 'aws-amplify/auth';
import { createUser } from '../../src/graphql/mutations';
import * as queries from '../../src/graphql/queries';


Amplify.configure(amplifyconfig);
const client = generateClient();

export default function TabOneScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username, userId, signInDetails } = await getCurrentUser();
      /*console.log(`The username: ${username}`);
      console.log(`The userId: ${userId}`);
      console.log(`The signInDetails: ${signInDetails}`);*/

      //Try to insert into database (medio mañoso pero no hay pedoooo)
      const res = await client.graphql({
        query: queries.getUser,
        variables: { id: userId }
      }) as GraphQLResult<any>;

      //const result = await client.graphql({ query: queries.listUsers });
      //console.log(result)

      if (!res.data?.getUser) {
        await client.graphql({
          query: createUser,
          variables: {
            input: {
              id: userId,
            }
          }
        });
      }

    } catch (err) {
      console.log(err);
      router.replace('/SignIn');
    }
  }
  useEffect(() => {
    // Code executed once when app launched

    //Auth
    currentAuthenticatedUser();

    //Refreshed and export new games played (if username changed, check if it had exported games before)

  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your challenge!</Text>
      <View style={styles.separator} />

      <TouchableOpacity style={styles.button} onPress={() => { router.push('/Challenges'); /* TODO: Implement Daily Challenge */ }}>
        <Calendar size={24} color="#fff" />
        <Text style={styles.buttonText}>Daily</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={() => { router.push('/Quiz');/* TODO: Implement Thematic Challenge */ }}>
        <BookOpen size={24} color="#fff" />
        <Text style={styles.buttonText}>Thematic</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => { router.push('/TrainingCicle');/* TODO: Implement Puzzle Challenge */ }}>
        <Puzzle size={24} color="#fff" />
        <Text style={styles.buttonText}>Puzzle</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 20,
    height: 2,
    width: '80%',
    backgroundColor: '#444',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E79B2',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
