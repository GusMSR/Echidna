import { Text, View } from '@/components/Themed';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

import Chessboard from 'react-native-chessboard';
import { parsePGN, Position, ParseResult } from '../src/Utils/chessParser';  // Import the parsing function and types
import { Evaluation, EngineLine, EvaluatedPosition, ClassificationCount, Report, analyse } from '../src/Utils/chessAnalysis'; // Import the analysis function and types

Amplify.configure(amplifyconfig);

export interface ApiResponse {
  success: boolean;
  evaluation: number | null;
  mate: number | null;
  bestmove: string;
  continuation: string;
}


export default function AnalysisScreen() {
  const { width, height } = useWindowDimensions();
  const isHorizontal = width > height;

  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(null); // Store API result (success)
  const [analysisResult, setAnalysisResult] = useState<ApiResponse>({
    success: false,
    bestmove: 'No best move found',
    evaluation: 0,
    mate: null,
    continuation: 'No continuation found',
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

  async function postChessApi(data = {}) {
    const response = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });
    return response.json();
}

  const handleStartAnalysis = async () => {
      //Read the pgn file and extract the string or just get the string TODO


      // Example usage after reading file
      const pgnContent = "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. Nf3 Bg4 5. Be2 Nc6 6. O-O O-O-O 7. d3 e6 8. Be3 Nf6 9. h3 Bh5 10. Ng5 Bg6 11. Nf3 h6 12. Qd2 e5 13. b4 Nxb4 14. a3 Nc6 15. Rab1 e4 16. Nb5 exf3 17. Nxa7+ Nxa7 18. Qxa5 fxe2 19. Rfe1 Nc6 20. Qb5 Bxd3 1-0";
      let depth = 10;
      let parsedPGN : ParseResult | null;

      //Store evaluated positions to analyze
      let evaluatedPositions: EvaluatedPosition[] = [];

      if (pgnContent) {
          parsedPGN = parsePGN(pgnContent);
          console.log('Parsed PGN');

          setAnalysisStarted(true);
          let positions = parsedPGN?.positions!;

          console.log("Starting evaluation loop...");
          console.log("Initial positions:", positions);

          // Fetch cloud evaluations 
          for (let position of positions) {
            let queryFen = position.fen;
            let cloudEvaluation;
            
            try {
                cloudEvaluation = await postChessApi({
                    fen: queryFen,
                    variants: 2, // Requesting 2 variants
                    depth: 12, 
                    maxThinkingTime: 100 
                });
            } catch (error) {
                console.error("API request failed:", error);
                continue; // Skip this position and move to the next
            }
            
            if (!cloudEvaluation || !cloudEvaluation.continuation) {
                console.error("Invalid API response:", cloudEvaluation);
                continue;
            }
            
            (position as EvaluatedPosition).worker = "cloud";
            console.log("API response processed successfully", cloudEvaluation);
        }

      } else {
        setAnalysisStarted(false);
          console.error('Failed to load PGN content.');
      }

      let results: Report;  // Declare the variable for the results

      // Generate report
      try {
        // Get the analyzed results (make sure to await the analysis if it's async)
        results = await analyse(evaluatedPositions)
        console.log(results);
        setAnalysisStarted(false);
      } catch (error) {
        setAnalysisStarted(false);
        console.error('Error during analysis or saving:', error);
      }
      
      //Sending it to the AI and getting the full eval
  };

  if (!isAuthenticated) {
    return null; // or show loading spinner
  }

  return (
    <View style={styles.container}>
      <View style={[styles.commentaryContainer, isHorizontal ? styles.commentaryHorizontal : styles.commentaryVertical]}>
        <Text style={styles.commentaryText}>                           AI Commentary                     </Text>
      </View>

      <Chessboard boardSize={400} />

      <View style={styles.gameDetailsContainer}>
        <Text style={styles.gameDetailsText}>Game Details</Text>
      </View>

      <Button
        title={analysisStarted ? "Analyzing..." : "Start Game Analysis"}
        onPress={handleStartAnalysis}
        disabled={analysisStarted}
      />
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