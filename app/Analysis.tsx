import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

import Chessboard from 'react-native-chessboard';
import { parsePGN, ParseResult } from '../src/Utils/chessParser';
import { EvaluatedPosition, Report, analyse, EngineLine } from '../src/Utils/chessAnalysis';

Amplify.configure(amplifyconfig);

declare global {
  interface Window {
    parentCallback: ( rawEvals : any[]) => void;
    childCallback: (  fenPositions: String[] ) => void;
  }
}


export default function AnalysisScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username, userId, signInDetails } = await getCurrentUser();
      console.log(`Username: ${username}, UserID: ${userId}`);
    } catch (err) {
      console.log(err);
      // router.replace('/SignIn'); // Uncomment if you want redirection
    }
  }

  useEffect(() => {
    currentAuthenticatedUser();
  }, []);

  const handleStartAnalysis = async () => {
    const pgnContent = "1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. Nf3 Bg4 5. Be2 Nc6 6. O-O O-O-O 7. d3 e6 8. Be3 Nf6 9. h3 Bh5 10. Ng5 Bg6 11. Nf3 h6 12. Qd2 e5 13. b4 Nxb4 14. a3 Nc6 15. Rab1 e4 16. Nb5 exf3 17. Nxa7+ Nxa7 18. Qxa5 fxe2 19. Rfe1 Nc6 20. Qb5 Bxd3 1-0";
    let parsedPGN: ParseResult | null = null;
    let positions: String [] = [];
    let evaluatedPositions: EvaluatedPosition[] = [];

    // Call the method through iframe window
    const iframe = document.getElementById("iframe") as HTMLIFrameElement;
    function waitForEvaluation(): Promise<EvaluatedPosition[]> {
      return new Promise((resolve) => {
        window.parentCallback = function(rawEvals) {
          const evaluatedPositions1: EvaluatedPosition[] = rawEvals.map((raw: any) => ({
            move: { san: "", uci: "" }, // Provide a placeholder move 
            fen: raw.fen,
            topLines: raw.topLines.map((line: any) => ({
              id: line.id,
              depth: line.depth,
              evaluation: {
                type: line.evaluation.type,
                value: line.evaluation.value,
              },
              moveUCI: line.moveUCI,
            })),
            worker: raw.worker,
          }));
          resolve(evaluatedPositions1);
        };
      });
    } 

    if (pgnContent) {
      parsedPGN = parsePGN(pgnContent);
      console.log("Parsed PGN");
      setAnalysisStarted(true);
      positions = parsedPGN!.positions.map(pos => pos.fen);
    } else {
      setAnalysisStarted(false);
      console.error("Failed to load PGN content.");
      return;
    }

    try {
      iframe.contentWindow?.childCallback( positions );
      evaluatedPositions = await waitForEvaluation();

      evaluatedPositions = evaluatedPositions.map((evalPos, i) => {
        if (i === 0) return evalPos; // skip the starting position
        return {
          ...evalPos,
          move: parsedPGN!.positions[i]?.move!
        };
      });        

      console.log("Before evaluating:");
      console.log(evaluatedPositions);
      let results: Report = await analyse(evaluatedPositions);
      console.log("Results:");
      console.log(results);
      setAnalysisStarted(false);
    } catch (error) {
      console.error("Error during analysis:", error);
      setAnalysisStarted(false);
    }
  };

  if (!isAuthenticated) return null; // or show loading indicator

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
      <Chessboard boardSize={400} />

      <Button title={analysisStarted ? "Analyzing..." : "Start Game Analysis"} 
        onPress={handleStartAnalysis} 
        disabled={analysisStarted} 
      />
      <iframe
        id='iframe'
        src={"http://localhost:8081/public/evaluation.html"}
        //src={"https://your-live-site.com/public/evaluation.html"} //CHANGE BEFORE PUBLISHING AS A WEBPAGE
        style={{ width: "100%", height: "100vh", border: "none" }}
        sandbox="allow-scripts allow-same-origin"
      />
    </View>
    );
  }
  return (
    <View style={styles.container}>
      <Chessboard boardSize={400} />

      <Button title={analysisStarted ? "Analyzing..." : "Start Game Analysis"} 
        onPress={handleStartAnalysis} 
        disabled={analysisStarted} 
      />
      
      <WebView
        originWhitelist={["*"]}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        onLoad={() => {}}
        onMessage={(event) => {}}
	      javaScriptEnabled={true}
        domStorageEnabled={true}

        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
        }}
        onLoadProgress={({ nativeEvent }) => console.log("Loading progress: ", nativeEvent.progress)}

        source ={{ uri: "http://localhost:8081/public/evaluation.html" }}
        //src={"https://your-live-site.com/public/evaluation.html"} //CHANGE BEFORE PUBLISHING AS A WEBPAGE
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
