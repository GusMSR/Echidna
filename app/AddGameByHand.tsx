import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker'; // Web
import 'react-datepicker/dist/react-datepicker.css';
import { Text, View } from '@/components/Themed';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { Chess } from 'chess.js';

import { Amplify } from 'aws-amplify';
import { generateClient, GraphQLResult } from 'aws-amplify/api';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser} from 'aws-amplify/auth';
import { createGame } from '../src/graphql/mutations';
import * as queries from '../src/graphql/queries';


Amplify.configure(amplifyconfig);
const client = generateClient();

export default function AddGameByHandScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [whiteMoves, setWhiteMoves] = useState(Array(5).fill(''));
  const [blackMoves, setBlackMoves] = useState(Array(5).fill(''));
  const [showPicker, setShowPicker] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | null>('success');

  const [gameDate, setGameDate] = useState('');
  const [gameResult, setGameResult] = useState('');
  const [userColor, setUserColor] = useState('');
  const [gamePgn, setgamePgn] = useState('');


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
    return null; 
  }

const handleAddMove = () => {
  console.log('Add move pressed');
  setWhiteMoves(prev => [...prev, '']);
  setBlackMoves(prev => [...prev, '']);
};

const handleSubmitGame = async () => {
  const chess = new Chess();

  // Combine moves
  const combinedMoves = [];
  for (let i = 0; i < whiteMoves.length; i++) {
    const whiteMove = whiteMoves[i].trim();
    const blackMove = blackMoves[i]?.trim();
    if (whiteMove) combinedMoves.push(whiteMove);
    if (blackMove) combinedMoves.push(blackMove);
  }

  // 10 moves at least
  if (combinedMoves.length < 10) {
    setStatusType('error');
    setStatusMessage('At least 5 moves per side (10 total) are required.');
    return;
  }

  //Simulate game
  try {
    for (const move of combinedMoves) {
      const result = chess.move(move);

      if (!result) {
        throw new Error(`Invalid move detected: "${move}"`);
      }
    }
  } catch (error) {
    setStatusType('error');

    if (error instanceof Error) {
      setStatusMessage(error.message);
    } else {
      setStatusMessage('An unknown error occurred during move simulation.');
    }

    setTimeout(() => {
      setStatusMessage('');
      setStatusType(null);
    }, 3000);
  }

  // Obtain pgn
  const pgn = chess.pgn();
  setgamePgn(pgn);

  //do the query
  // === Validation ===
  if (!gamePgn.trim()) {
    setStatusType('error');
    setStatusMessage('Game PGN cannot be empty.');
    return;
  }

  if (!gameResult.trim()) {
    setStatusType('error');
    setStatusMessage('Game result is required.');
    return;
  }

  if (!userColor.trim()) {
    setStatusType('error');
    setStatusMessage('Please specify your color (white or black).');
    return;
  }

  if (!gameDate) {
    setStatusType('error');
    setStatusMessage('Game date is required.');
    return;
  }

  const selectedDate = new Date(gameDate);
  const now = new Date();
  if (selectedDate > now) {
    setStatusType('error');
    setStatusMessage('Game date cannot be in the future.');
    return;
  }

  // === All validations passed ===
  const input = {
    pgn: gamePgn,
    platform: 'Manual',
    date: gameDate,
    result: gameResult,
    rating: null, // You can fill this if available
    userColor: userColor.toLowerCase(),
  };

  try {
    await client.graphql({
      query: createGame,
      variables: {
        input: input,
      },
    });
    setStatusType('success');
    setStatusMessage('Game successfully saved!');
  } catch (error) {
    console.error('Error creating game:', error);
    setStatusType('error');
    setStatusMessage('Failed to save game. Please try again.');
  }

  // Clear message after 3 seconds
  setTimeout(() => {
    setStatusType(null);
    setStatusMessage('');
  }, 3000);

  setStatusType('success');
  setStatusMessage('Game successfully saved');
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
      <ScrollView style={styles.gameContainer}>
        <Text style={styles.label}>Moves</Text>
        {whiteMoves.map((_, idx) => (
          <View style={styles.moveRow} key={`move-row-${idx}`}>
            <View style={styles.moveInputContainer}>
              <TextInput 
                style={styles.moveInput} 
                placeholder={`White ${idx + 1}`} 
                value={whiteMoves[idx]}
                onChangeText={(text) => {
                  const newMoves = [...whiteMoves];
                  newMoves[idx] = text;
                  setWhiteMoves(newMoves);
                }}
              />
            </View>

            <View style={styles.moveInputContainer}>
              <TextInput 
                style={styles.moveInput} 
                placeholder={`Black ${idx + 1}`} 
                value={blackMoves[idx]}
                onChangeText={(text) => {
                  const newMoves = [...blackMoves];
                  newMoves[idx] = text;
                  setBlackMoves(newMoves);
                }}
              />
            </View>
          </View>
        ))}

      {/* Fixed Inputs */}
      <View style={styles.fixedInputsContainer}>
        <Text style={styles.label}>Date</Text>
          {Platform.OS === 'web' ? (
        <View style={styles.fixedInput}>
          <DatePicker
            selected={gameDate ? new Date(gameDate) : null}
            onChange={(date) => {
              if (date) {
                const isoDate = date.toISOString(); // AWSDateTime format
                setGameDate(isoDate);
              }
            }}
            placeholderText="Select date"
            dateFormat="Pp"
            showTimeSelect
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.fixedInput}
          onPress={() => setShowPicker(true)}
        >
          <Text>{gameDate ? new Date(gameDate).toLocaleString() : 'Select date'}</Text>
        </TouchableOpacity>
      )}

          {showPicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  const isoDate = selectedDate.toISOString(); // AWSDateTime format
                  setGameDate(isoDate);
                }
              }}
            />
          )}

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Result</Text>
          <Picker
            selectedValue={gameResult}
            onValueChange={(itemValue) => setGameResult(itemValue)}
          >
            <Picker.Item label="Select Result" value="" />
            <Picker.Item label="Win" value="win" />
            <Picker.Item label="Lose" value="lose" />
            <Picker.Item label="Draw" value="draw" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Color Played</Text>
          <Picker
            selectedValue={userColor}
            onValueChange={(itemValue) => setUserColor(itemValue)}
          >
            <Picker.Item label="Select Color" value="" />
            <Picker.Item label="White" value="white" />
            <Picker.Item label="Black" value="black" />
          </Picker>
        </View>
      </View>

      </ScrollView>

      <TouchableOpacity style={styles.addMoveButton} onPress={handleAddMove}>
        <Text style={styles.addMoveButtonText}>Add Move</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitGame}>
        <Text style={styles.submitButtonText}>Submit Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  gameContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  movesContainer: {
    flex: 1,
    marginRight: 8,
  },
  moveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fixedInputsContainer: {
    marginTop: 16,
  },
  fixedInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  addMoveButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  addMoveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#28A745',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  label: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 4,
  color: '#333',
},
pickerContainer: {
  marginBottom: 16,
},statusPopup: {
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
moveRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 8,
},
moveInputContainer: {
  flex: 1,
  marginHorizontal: 4,
},
moveInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  padding: 10,
},
});