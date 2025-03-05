import { StyleSheet, View, Button, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

Amplify.configure(amplifyconfig);

export default function TrainingCycleScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cycleDuration, setCycleDuration] = useState('');
  const [gameObjective, setGameObjective] = useState('');
  const [disciplineObjective, setDisciplineObjective] = useState('');
  const [ratingGoal, setRatingGoal] = useState('');

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
    return null; // or return a loading spinner if you prefer
  }

  const handleSubmit = () => {
    console.log('Training Cycle Submitted:');
    console.log(`Duration: ${cycleDuration} months`);
    console.log(`Game Objective: ${gameObjective}`);
    console.log(`Discipline Objective: ${disciplineObjective}`);
    console.log(`Rating Goal: ${ratingGoal}`);
    // Handle submission logic here
  };

  const handleOptionSelect = (setter: React.Dispatch<React.SetStateAction<any>>, value: string) => {
    setter(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Training Cycle</Text>

      {/* Training Duration */}
      <Text style={styles.label}>Training Duration (Months):</Text>
      <View style={styles.optionContainer}>
        {['1', '2', '3', '4', '5', '6'].map((month) => (
          <TouchableOpacity
            key={month}
            style={[styles.optionButton, cycleDuration === month && styles.selectedOption]}
            onPress={() => handleOptionSelect(setCycleDuration, month)}
          >
            <Text style={styles.optionText}>{month} Month</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Game Objective */}
      <Text style={styles.label}>Game Objective:</Text>
      <View style={styles.optionContainer}>
        {['defensive', 'offensive', 'strategic', 'provocative', 'solid'].map((objective) => (
          <TouchableOpacity
            key={objective}
            style={[styles.optionButton, gameObjective === objective && styles.selectedOption]}
            onPress={() => handleOptionSelect(setGameObjective, objective)}
          >
            <Text style={styles.optionText}>{objective.charAt(0).toUpperCase() + objective.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Discipline Objective */}
      <Text style={styles.label}>Discipline Objective:</Text>
      <View style={styles.optionContainer}>
        {['daily', 'weekly', 'monthly'].map((discipline) => (
          <TouchableOpacity
            key={discipline}
            style={[styles.optionButton, disciplineObjective === discipline && styles.selectedOption]}
            onPress={() => handleOptionSelect(setDisciplineObjective, discipline)}
          >
            <Text style={styles.optionText}>{discipline.charAt(0).toUpperCase() + discipline.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rating Goal */}
      <Text style={styles.label}>Rating Goal:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your rating goal"
        keyboardType="numeric"
        value={ratingGoal}
        onChangeText={setRatingGoal}
      />

      {/* Submit Button */}
      <Button title="Submit Training Cycle" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  optionButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: '#4caf50',
  },
  optionText: {
    color: '#333',
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
});
