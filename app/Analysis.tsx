import React, { useEffect, useRef, useState } from "react";
import { View, Button, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser } from 'aws-amplify/auth';

import Chessboard from 'react-native-chessboard';
import { parsePGN, ParseResult } from '../src/Utils/chessParser';
import { EvaluatedPosition, Report, analyse, EngineLine } from '../src/Utils/chessAnalysis';
import { router } from "expo-router";

Amplify.configure(amplifyconfig);

declare global { //Functions for interaction with iframe
  interface Window {
    parentCallback: ( rawEvals : any[]) => void;
    childCallback: ( fenPositions: String[]) => void;
  }
}

export default function AnalysisScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisStartedWeb, setAnalysisStartedWeb] = useState(false);
  const [analysisStartedMov, setAnalysisStartedMov] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const pgnContent = "1. e4 e5 2. d4 exd4 3. Nf3 c5 4. Bc4 Be7 5. O-O Nf6 6. e5 Ng4 7. h3 Nh6 8. c3 d5 9. exd6 Qxd6 10. cxd4 cxd4 1-0";
  let parsedPGN: ParseResult | null = null;
  let positions: String [] = [];
  let evaluatedPositions: EvaluatedPosition[] = [];

  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username, userId, signInDetails } = await getCurrentUser();
      //console.log(`Username: ${username}, UserID: ${userId}`);
    } catch (err) {
      console.log(err);
      router.replace('/SignIn'); // Redirect
    }
  }

  useEffect(() => {
    currentAuthenticatedUser();
  }, []);

  const sendPuzzle = async (fen : string, main_line : string) => {
    try {
      //CAMBIAR CUANDO SE DESPLIEGUE ESTA MADRE
      const response = await fetch("http://127.0.0.1:5000/tag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fen: fen,
          main_line: main_line, 
        }),
      });
  
      const data = await response.json();
      console.log("Tags recibidos:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //Expose function to webview, that's why is outside handleStartAnalysis
    const handleMessage = async (event: any) => {
      // Data from WebView is in event.nativeEvent.data
      const data = event.nativeEvent.data;
      console.log('Received from WebView');
      //Parse data 
      try {
          const parsedData = JSON.parse(data);
          console.log('Parsed Data');
          const evaluatedPositions2: EvaluatedPosition[] = parsedData.map((raw: any) => ({
            move: { san: "", uci: "" }, // You can inject real move data if needed
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
          evaluatedPositions = evaluatedPositions2;      
          console.log("Before evaluating:");
          console.log(evaluatedPositions);
          let results: Report = await analyse(evaluatedPositions);
          console.log("Results:");
          console.log(results);
          setAnalysisStartedMov(false);
      } catch (e) {
          console.log('Error:', e)
      }
    };

  const handleStartAnalysisWeb = async () => {
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
      setAnalysisStartedWeb(true);
      positions = parsedPGN!.positions.map(pos => pos.fen);
    } else {
      setAnalysisStartedWeb(false);
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

      //console.log("Before evaluating:");
      //console.log(evaluatedPositions);
      let results: Report = await analyse(evaluatedPositions);
      console.log("Results:");
      console.log(results);

      //TAGGER
      const relevantTags = ["blunder", "brilliant", "great", "mistake"];
      /*for (const pos of evaluatedPositions) {
        const classification = pos.classification?.toLowerCase();
        if (classification && relevantTags.includes(classification)) {
          const fen = pos.fen;
          const mainLine = pos.topLines?.[0]?.moveUCI;
    
          if (fen && mainLine) {
            console.log("Mandando las posiciones relevantes a taggear")
            await sendPuzzle(fen, mainLine);
          }
        }
      }*/

      //Comentarios IA
      fetch("https://758b-34-125-248-224.ngrok-free.app/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: "<s>IMPORTANT: RESPOND ONLY IN THIRD PERSON. Input:\nPlayer moved Rg8. Best move was Re1. Identified Tags: Fork, mate in 2 . Move classification: Blunder . In third person, write a concise and constructive coaching commentary explaining why this move is a blunder, emphasizing the identified tags.\n\nResponse:\n" }),
        })
          .then(res => res.json())
          .then(data => console.log(data.response));

      setAnalysisStartedWeb(false);
    } catch (error) {
      console.error("Error during analysis:", error);
      setAnalysisStartedWeb(false);
    }
  };

  const handleStartAnalysisMov = async () => {
    // Call the method through webview
    //AÑADIR FETCH PARA EL TAGGER
    const sendDataToWebView = ( fenArray: String[]) => {
      const data = { message: fenArray};
      webViewRef.current!.postMessage(JSON.stringify(data));
    };

    if (pgnContent) {
      parsedPGN = parsePGN(pgnContent);
      console.log("Parsed PGN mobile");
      setAnalysisStartedMov(true);
      positions = parsedPGN!.positions.map(pos => pos.fen);
    } else {
      setAnalysisStartedMov(false);
      console.error("Failed to load PGN content.");
      return;
    }

    try {
      evaluatedPositions = evaluatedPositions.map((evalPos, i) => {
        if (i === 0) return evalPos; // skip the starting position
        return {
          ...evalPos,
          move: parsedPGN!.positions[i]?.move!
        };
      });  
      sendDataToWebView(positions);
    } catch (error) {
      console.error("Error during analysis:", error);
      setAnalysisStartedMov(false);
    }
  };

  if (!isAuthenticated) return null; // or show loading indicator

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
      <Chessboard boardSize={400} />

      <Button title={analysisStartedWeb ? "Analyzing..." : "Start Game Analysis"} 
        onPress={handleStartAnalysisWeb} 
        disabled={analysisStartedWeb} 
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

      <Button title={analysisStartedMov ? "Analyzing..." : "Start Game Analysis"} 
        onPress={handleStartAnalysisMov} 
        disabled={analysisStartedMov} 
      />
      
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        onLoad={() => {}}
        onMessage={handleMessage}
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
