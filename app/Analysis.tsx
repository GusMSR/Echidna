import { Text, View } from '@/components/Themed';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';

import Chessboard from 'react-native-chessboard';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

Amplify.configure(amplifyconfig);

export interface ApiResponse {
  success: boolean;
  
  // Conditional on success:
  evaluation: number | null; // Stockfish evaluation in centipawns (cp), null if there's forced checkmate
  mate: number | null; // Null if no mate is present
  bestmove: string; // Best move and ponder move in UCI format
  continuation: string; // Sequence of moves in UCI format
}  

export default function AnalysisScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;

  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(null); // Store API result (success)

  const [analysisResult, setAnalysisResult] = useState<ApiResponse>({
    success: false,
    bestmove: "No best move found",
    evaluation: 0,
    mate: null,
    continuation: "No continuation found",
  });

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

  const handleStartAnalysis = async () => {
    // Example FEN and depth 
    const exampleFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // Starting position
    const depth = 10;

    setAnalysisStarted(true);
    try {
      const response = await fetch(
        `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(exampleFEN)}&depth=${depth}`
      );
      const result = await response.json();
      if (result.success) {
        setAnalysisSuccess(result.success);
        setAnalysisResult(result); 
        console.log("Analysis result:", result);
        
      } else {
        Alert.alert("Analysis Failed", "Failed to analyze the position.");
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      Alert.alert("Error", "Unable to fetch analysis. Please try again later.");
    } finally {
      setAnalysisStarted(false);
    }
  };

  if (!isAuthenticated) {
    // return null or a loading spinner while checking authentication
    return null; // or return <LoadingSpinner /> if you prefer
  }

  return (
    <View style={styles.container}>

      {/* Commentary Section */}
      <View style={[styles.commentaryContainer, isHorizontal ? styles.commentaryHorizontal : styles.commentaryVertical]}>
        <Text style={styles.commentaryText}>                           AI Commentary                     </Text>
        {/* TODO implement IA commentary */}
      </View>

      <Chessboard boardSize={400} />

      {/* Game Details Section */}
      <View style={styles.gameDetailsContainer}>
        <Text style={styles.gameDetailsText}>Game Details</Text>
        {/* TODO implement game details */}
      </View>

      <Button
        title={analysisStarted ? "Analyzing..." : "Start Game Analysis"}
        onPress={handleStartAnalysis}
        disabled={analysisStarted}
      />

      {analysisSuccess && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            Evaluation: {analysisResult.evaluation}
          </Text>
          <Text style={styles.resultText}>
            Best Move: {analysisResult.bestmove}
          </Text>
          <Text style={styles.resultText}>
            Continuation: {analysisResult.continuation}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  commentaryContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#eaeaea',
    borderRadius: 5,
  },
  commentaryHorizontal: {
    flex: 1,
    alignItems: 'center',
  },
  commentaryVertical: {
    width: '100%',
    alignItems: 'flex-start',
  },
  commentaryText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
  },
  chessboard: {
    width: '100%',
    height: 400,
    marginBottom: 20,
  },
  gameDetailsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '100%',
  },
  gameDetailsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  resultText: {
    fontSize: 16,
    marginVertical: 5,
  },
});
