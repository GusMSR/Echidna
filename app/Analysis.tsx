import { Text, View } from '@/components/Themed';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { File, Paths } from 'expo-file-system/next';

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

  const handleStartAnalysis = async () => {
      //Read the pgn file and extract the string or just get the string TODO


      // Example usage after reading file
      const pgnContent = "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. Nf3 Bg4 5. Be2 Nc6 6. O-O O-O-O 7. d3 e6 8. Be3 Nf6 9. h3 Bh5 10. Ng5 Bg6 11. Nf3 h6 12. Qd2 e5 13. b4 Nxb4 14. a3 Nc6 15. Rab1 e4 16. Nb5 exf3 17. Nxa7+ Nxa7 18. Qxa5 fxe2 19. Rfe1 Nc6 20. Qb5 Bxd3 21. cxd3 Rd6 22. Qxb7+ Kd7 23. Rxe2 Nd5 24. Bc5 Rg6 25. Bxf8 Rxf8 26. Qb5 Nc3 27. Qf5+ Kd8 28. Rbe1 Nxe2+ 29. Rxe2 Rf6 30. Qc5 Re8 31. Rxe8+ Kxe8 32. Qe3+ Kd7 33. a4 Re6 34. Qc5 Rd6 35. a5 Rxd3 36. a6 Rd1+ 37. Kh2 Ra1 38. Qd5+ Kc8 39. Qxc6 f5 40. Qb7+ Kd7 41. a7 Rxa7 42. Qxa7 g5 43. Qc5 Ke6 44. Qxc7 Kf6 45. Qh7 f4 46. g3 fxg3+ 47. Kxg3 Ke5 48. Kg4 Kd4 49. Kh5 1-0";
      let depth = 10;
      let parsedPGN : ParseResult | null;

      //Store evaluated positions to analyze
      let evaluatedPositions: EvaluatedPosition[] = [];

      if (pgnContent) {
          parsedPGN = parsePGN(pgnContent);
          console.log('Parsed PGN');

          setAnalysisStarted(true);
            for (let position of parsedPGN?.positions!) {
              let queryFen = position.fen.replace(/\s/g, "%20");
              let cloudEvaluationResponse;
          
              try {
                  cloudEvaluationResponse = await fetch(
                      `https://lichess.org/api/cloud-eval?fen=${queryFen}&multiPv=2`,
                      { method: "GET" }
                  );
          
                  if (!cloudEvaluationResponse) continue;
              } catch {
                  continue;
              }
          
              if (!cloudEvaluationResponse.ok) {
                  continue;
              }
          
              let cloudEvaluation = await cloudEvaluationResponse.json();
          
              (position as EvaluatedPosition).topLines = cloudEvaluation.pvs.map((pv: any, id: number) => {
                const evaluationType = pv.cp == undefined ? "mate" : "cp";
                const evaluationScore = pv.cp ?? pv.mate ?? "cp";
    
                let line: EngineLine = {
                    id: id + 1,
                    depth: depth,
                    moveUCI: pv.moves.split(" ")[0] ?? "",
                    evaluation: {
                        type: evaluationType,
                        value: evaluationScore,
                    },
                };
    
                let cloudUCIFixes: { [key: string]: string } = {
                    e8h8: "e8g8",
                    e1h1: "e1g1",
                    e8a8: "e8c8",
                    e1a1: "e1c1",
                };
                line.moveUCI = cloudUCIFixes[line.moveUCI] ?? line.moveUCI;
    
                return line;
            });    
              (position as EvaluatedPosition).worker = "cloud";
          }

          //Store evaluated positions
          evaluatedPositions = parsedPGN?.positions! as EvaluatedPosition[]; // MAYBE UNSAFE BUT WHO CARES (MAP IF RUNTIME ERROR)

      } else {
          console.error('Failed to load PGN content.');
      }

      let results: Report;  // Declare the variable for the results

      // Generate report
      try {
        // Get the analyzed results (make sure to await the analysis if it's async)
        results = await analyse(evaluatedPositions);
      
        // Create a new File object in the cache directory with the desired filename
        const file = new File(Paths.cache, 'analysis_result.json');
      
        // Create the file (this may throw an error if the file already exists or if there are permission issues)
        await file.create();
      
        // Write the results data to the file
        await file.write(JSON.stringify(results, null, 4));
      
        // Log the file content (for verification)
        console.log(await file.text()); // This will print the contents of the file (e.g., the JSON)
      
      } catch (error) {
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