import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";
import * as Expo from "expo-asset";

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

import Chessboard from 'react-native-chessboard';
import { parsePGN, ParseResult } from '../src/Utils/chessParser';
import { Evaluation, EvaluatedPosition, Report, analyse } from '../src/Utils/chessAnalysis';

Amplify.configure(amplifyconfig);

export default function AnalysisScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [webViewUri, setWebViewUri] = useState<string | null>(null);

  const { localUri } = Expo.Asset.fromModule(require('../assets/engine/index.html'));

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
    let evaluatedPositions: EvaluatedPosition[] = [];

    if (pgnContent) {
      parsedPGN = parsePGN(pgnContent);
      console.log("Parsed PGN");
      setAnalysisStarted(true);
    } else {
      setAnalysisStarted(false);
      console.error("Failed to load PGN content.");
      return;
    }

    try {
      let results: Report = await analyse(evaluatedPositions);
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
        src={require('../assets/engine/index.html')}
        style={{ width: "100%", height: "100vh", border: "none" }}
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
        source={
          Platform.OS === 'android'
            ? {
                uri: localUri!.includes('ExponentAsset')
                  ? localUri
                  : 'file:///android_asset/' + localUri!.substr(9),  // Adjust for Android path
              }
            : require('../assets/engine/index.html')  // For iOS use direct reference
        }
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
