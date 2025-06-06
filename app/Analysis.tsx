import React, { useEffect, useRef, useState } from "react";
import { View, Button, StyleSheet, Platform, TextInput, Alert, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";

import Chessboard, { ChessboardRef } from 'react-native-chessboard';
import { parsePGN, ParseResult } from '../src/Utils/chessParser';
import { EvaluatedPosition, Report, analyse, EngineLine } from '../src/Utils/chessAnalysis';
import { router, useLocalSearchParams } from "expo-router";

import { Amplify } from 'aws-amplify';
import { generateClient, GraphQLResult } from 'aws-amplify/api';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser} from 'aws-amplify/auth';
import { createAnalysis } from '../src/graphql/mutations';
import * as queries from '../src/graphql/queries';
import { Square } from "chess.js";


Amplify.configure(amplifyconfig);
const client = generateClient();

declare global { //Functions for interaction with iframe
  interface Window {
    parentCallback: ( rawEvals : any[]) => void;
    childCallback: ( fenPositions: String[]) => void;
  }
}

interface MoveData {
  san: string;
  from: Square;
  to: Square;
  fen: string;
  comment?: string;
}

export default function AnalysisScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisStartedWeb, setAnalysisStartedWeb] = useState(false);
  const [analysisStartedMov, setAnalysisStartedMov] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [remainingAnalyses, setValue] = useState(100);
  const [sidePlayed, setSidePlayed] = useState('white');
  const [existAnal, setExistsAnal] = useState(false);

  const [accuracy, setAccuracy] = useState(100);
  const [moves, setMoves] = useState<MoveData[]>([]);
  const chessboardRef = useRef<ChessboardRef>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number | null>(null);

  const handleMoveClick = async (index: number) => {
    try {
      // Reset board if it's the first move
      if (index === 0) {
        await chessboardRef.current?.resetBoard?.();
      }

      // Replay moves up to this index
      for (let i = 0; i <= index; i++) {
        const move = moves[i];
        if (move && move.from && move.to) {
          await chessboardRef.current?.move({ from: move.from, to: move.to });
        }
      }

      setCurrentMoveIndex(index);
    } catch (err) {
      console.warn("Failed to play move", err);
    }
  };

  const { id } = useLocalSearchParams();

  let pgnContent = "";
  let parsedPGN: ParseResult | null = null;
  let positions: String [] = [];
  let evaluatedPositions: EvaluatedPosition[] = [];
  let results!: Report;

  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username, userId, signInDetails } = await getCurrentUser();

      //Check if the id that's coming is from an existing analysis
      const isExistingAnalysis = await client.graphql({
        query: queries.getAnalysis,
        variables: {
          id: id
        }
      }) as GraphQLResult<any>;
      
      if(isExistingAnalysis.data?.getAnalysis){
        setIsConfirmed(true)
        console.log("EXISTING ANALYISIS")
        setExistsAnal(true)

        const rawJson = isExistingAnalysis.data?.getAnalysis?.evaluatedPositions;
        results = JSON.parse(rawJson) as Report;
        const moveDataArray = extractMoves(results.positions, isExistingAnalysis.data?.getAnalysis.aiCommentary);
        console.log("Extracted moves:", moveDataArray); // DEBUG
        setMoves(moveDataArray);
        setAccuracy(isExistingAnalysis.data?.getAnalysis.accuracy);
      }
      
    //REMAINING ANALYSIS
    const existingAnalysis = await client.graphql({
      query: queries.listAnalyses,
      variables: {
        filter: {
          userID: { eq: userId }
        }
      }
    }) as GraphQLResult<any>;

    const count = Array.isArray(existingAnalysis.data?.listAnalyses?.items)
      ? existingAnalysis.data.listAnalyses.items.length
      : 0;
    setValue(100 - count);
    console.log("found", count);

    } catch (err) {
      console.log("amongus")
      console.log(err);
      router.replace('/GameHistory'); // Redirect
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

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Tags recibidos:", data);
      return data;

    } catch (error) {
      console.error("Error:", error);
    }
  };

    function extractMoves(evaluatedPositions: any[], aiCommentary: string[]): MoveData[] {
      return evaluatedPositions
        .filter(pos => typeof pos.move?.uci === 'string' && pos.move.uci.length >= 4)
        .map(pos => {
          const uci = pos.move.uci; // e.g., "e2e4", "e7e8q"
          const from = uci.slice(0, 2) as Square;
          const to = uci.slice(2, 4) as Square;

          // Match commentary for the current FEN
          const matchingComment = aiCommentary.find(entry => 
            typeof entry === 'string' && entry.includes(`Fen: ${pos.fen}`)
          );

          let comment = "";
          if (matchingComment) {
            const match = matchingComment.match(/Response:\s([\s\S]*)/);
            comment = match ? match[1].trim() : "";
          }

          return {
            san: pos.move.san ?? "",
            from,
            to,
            fen: pos.fen,
            ...(comment && { comment })
          };
        });
    }

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
            move: { san: "", uci: "" }, 
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

          let evaluatedPositionsTrimmed: EvaluatedPosition[] = evaluatedPositions.map(pos => ({
            fen: pos.fen,
            move: pos.move,
            opening: pos.opening,
            worker: pos.worker,
            topLines: pos.topLines.slice(0, 2).map(line => ({
              id: line.id,
              depth: line.depth,
              evaluation: line.evaluation,
              moveUCI: line.moveUCI.split(" ")[0],  // keep only the first move
              moveSAN: line.moveSAN  
            }))
          }));
          results = await analyse(evaluatedPositionsTrimmed);
          console.log("Results:");
          console.log(results);

      //TAGGER
      // Create a map from evaluatedPositions using the FEN as key
      const positionMap = new Map<string, EvaluatedPosition>();
      for (const pos of evaluatedPositions) {
        positionMap.set(pos.fen, pos);
      }

      // Create a map to store tags for each fen
      const tagsMap = new Map<string, { tags: string[]; mainLine: string }>();

      const relevantTags = ["blunder", "brilliant", "great", "mistake"];
      for (const resultPos of results.positions) {
        const classification = resultPos.classification?.toLowerCase();
        if (relevantTags.includes(classification ?? "")) {
          const fen = resultPos.fen;

          const fullEval = positionMap.get(fen);
          const mainLine = fullEval?.topLines?.[0]?.moveUCI;

          console.log("Sending fen:", fen);
          console.log("Sending full mainLine:", mainLine);

          if (fen && mainLine) {
            console.log("Mandando las posiciones relevantes a taggear");
            const tagData = await sendPuzzle(fen, mainLine);

          if (tagData && Array.isArray(tagData.tags)) {
            tagsMap.set(fen, {
              tags: tagData.tags,
              mainLine: mainLine,  // assumes this variable is in scope
            });
          } else {
            console.warn("Unexpected response:", tagData);
          }
          }
        }
      }

    //AI commentary
    const defaultPrompt = "<s>IMPORTANT: RESPOND ONLY IN THIRD PERSON. Input:\nPlayer moved Rg8. Best move was Re1. Identified Tags: Fork, mate in 2 . Move classification: Blunder . In third person, write a concise and constructive coaching commentary explaining why this move is a blunder, emphasizing the identified tags.\n\nResponse:\n"
    const aiCommentary: string[] = [];
    for (const [fen, tagData] of tagsMap.entries()) {
      // Find corresponding evaluated position by FEN
      const evalPos = evaluatedPositionsTrimmed.find(pos => pos.fen === fen);

      if (!evalPos) {
        console.warn("No evaluated position found for FEN:", fen);
        continue;
      }

      const classification = evalPos.classification?.toLowerCase();
      const playerMove = evalPos.move.uci;
      const bestMove = tagData.mainLine;
      const tags = tagData.tags.join(", ");

      if (classification && playerMove && bestMove) {
        const prompt = `<s>IMPORTANT: RESPOND ONLY IN THIRD PERSON. Input:\nPlayer moved ${playerMove}. Fen: ${fen}. Best move was ${bestMove}. Identified Tags: ${tags}. Move classification: ${classification}. In third person, write a concise and constructive coaching commentary explaining why this move is a ${classification}, emphasizing the identified tags.\n\nResponse:\n`;

        try {
          const res = await fetch(inputValue, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          });

          const data = await res.json();
          const responseText = data.response;

          aiCommentary.push(`Prompt: ${prompt} ${responseText}`);
        } catch (err) {
          console.error("Failed to fetch AI commentary:", err);
        }
      } else {
        console.warn("Missing required data for FEN:", fen);
      }
    }

    //DB Insertion
    try {
      console.log("aiCommentary")
      console.log(aiCommentary)

      const { userId } = await getCurrentUser();
      let accuracyHere = 0.00;
      if (sidePlayed == 'white') {
        accuracyHere = results.accuracies.white;
      } else {
        accuracyHere = results.accuracies.black;
      }

      console.log("MANDANDO A LA DB CHINGADERAS");
      await client.graphql({
        query: createAnalysis,
        variables: {
          input: {
            gameID: id,
            userID: userId,
            evaluatedPositions: JSON.stringify(results),
            accuracy: accuracyHere,
            aiCommentary: aiCommentary
          }
        }
      });

      const moveDataArray = extractMoves(evaluatedPositions, aiCommentary);
      setMoves(moveDataArray);
      setAccuracy(accuracyHere);
    } catch (error) {
      console.error("ERROR EN EL MUTATION DE createAnalysis ");
      console.error(error);
    }
      } catch (e) {
          console.log('Error:', e)
      }
    };

  const handleStartAnalysisWeb = async () => {
    if(pgnContent == ""){
        console.log("ME QUIERO SUICIDAR")
        console.log("Received ID:", id);
        const res = await client.graphql({
        query: queries.getGame,
        variables: { id }
      }) as GraphQLResult<any>;

      const game = res.data.getGame;

      if(!game){
        throw new Error("DIDNT FIND THE GAME SENT TO ANALYZE");
      }

      const extractMovesOnly = (pgn: string): string | null => {
        const match = pgn.match(/1\..*?(1-0|0-1|1\/2-1\/2)/s);
        return match ? match[0].trim() : null;
      };

      if(game.platform == "Chesscom"){
        console.log("Chesscom game")
        console.log(game.pgn)
        const fullPGN = game.pgn;
        const movesOnly = extractMovesOnly(fullPGN);
        pgnContent = movesOnly || "";
      }
      if(game.platform == "Lichess"){        
        console.log("Lichess game")
        let resultTag = "*";

          if (game.result === "draw") resultTag = "1/2-1/2";
          else if (game.result === "win") resultTag = game.userColor === "white" ? "1-0" : "0-1";
          else if (game.result === "loss") resultTag = game.userColor === "white" ? "0-1" : "1-0";

          const movesArray = game.pgn.trim().split(/\s+/);
          let formatted = "";
          for (let i = 0; i < movesArray.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = movesArray[i];
            const blackMove = movesArray[i + 1] || "";
            formatted += `${moveNumber}. ${whiteMove} ${blackMove} `;
          }

         pgnContent = formatted.trim() + " " + resultTag;
        console.log(pgnContent)
      }

      setSidePlayed(game.userColor)
    }
    // Call the method through iframe window
    const iframe = document.getElementById("iframe") as HTMLIFrameElement;
    function waitForEvaluation(): Promise<EvaluatedPosition[]> {
      return new Promise((resolve) => {
        window.parentCallback = function(rawEvals) {
          const evaluatedPositions1: EvaluatedPosition[] = rawEvals.map((raw: any) => ({
            move: { san: "", uci: "" }, 
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
      try {
        evaluatedPositions = await waitForEvaluation();
      } catch (error) {
        console.error("Error during evaluation:", error);
        // Handle the error gracefully, e.g., set evaluatedPositions to empty or fallback data
        evaluatedPositions = [];
      }

      evaluatedPositions = evaluatedPositions.map((evalPos, i) => {
        if (i === 0) return evalPos; // skip the starting position
        return {
          ...evalPos,
          move: parsedPGN!.positions[i]?.move!
        };
      });        

    console.log("Before evaluating:");
    console.log(evaluatedPositions);

    let evaluatedPositionsTrimmed: EvaluatedPosition[] = evaluatedPositions.map(pos => ({
      fen: pos.fen,
      move: pos.move,
      opening: pos.opening,
      worker: pos.worker,
      topLines: pos.topLines.slice(0, 2).map(line => ({
        id: line.id,
        depth: line.depth,
        evaluation: line.evaluation,
        moveUCI: line.moveUCI.split(" ")[0],  // keep only the first move
        moveSAN: line.moveSAN  
      }))
    }));

      results = await analyse(evaluatedPositionsTrimmed);
      console.log("Results:");
      console.log(results);

      //TAGGER
      // Create a map from evaluatedPositions using the FEN as key
      const positionMap = new Map<string, EvaluatedPosition>();
      for (const pos of evaluatedPositions) {
        positionMap.set(pos.fen, pos);
      }

      // Create a map to store tags for each fen
      const tagsMap = new Map<string, { tags: string[]; mainLine: string }>();

      const relevantTags = ["blunder", "brilliant", "great", "mistake"];
      for (const resultPos of results.positions) {
        const classification = resultPos.classification?.toLowerCase();
        if (relevantTags.includes(classification ?? "")) {
          const fen = resultPos.fen;

          const fullEval = positionMap.get(fen);
          const mainLine = fullEval?.topLines?.[0]?.moveUCI;

          console.log("Sending fen:", fen);
          console.log("Sending full mainLine:", mainLine);

          if (fen && mainLine) {
            console.log("Mandando las posiciones relevantes a taggear");
            const tagData = await sendPuzzle(fen, mainLine);

          if (tagData && Array.isArray(tagData.tags)) {
            tagsMap.set(fen, {
              tags: tagData.tags,
              mainLine: mainLine,  // assumes this variable is in scope
            });
          } else {
            console.warn("Unexpected response:", tagData);
          }
          }
        }
      }

    //AI commentary
    const defaultPrompt = "<s>IMPORTANT: RESPOND ONLY IN THIRD PERSON. Input:\nPlayer moved Rg8. Best move was Re1. Identified Tags: Fork, mate in 2 . Move classification: Blunder . In third person, write a concise and constructive coaching commentary explaining why this move is a blunder, emphasizing the identified tags.\n\nResponse:\n"
    const aiCommentary: string[] = [];
    for (const [fen, tagData] of tagsMap.entries()) {
      // Find corresponding evaluated position by FEN
      const evalPos = evaluatedPositionsTrimmed.find(pos => pos.fen === fen);

      if (!evalPos) {
        console.warn("No evaluated position found for FEN:", fen);
        continue;
      }

      const classification = evalPos.classification?.toLowerCase();
      const playerMove = evalPos.move.uci;
      const bestMove = tagData.mainLine;
      const tags = tagData.tags.join(", ");

      if (classification && playerMove && bestMove) {
        const prompt = `<s>IMPORTANT: RESPOND ONLY IN THIRD PERSON. Input:\nPlayer moved ${playerMove}. Fen: ${fen}. Best move was ${bestMove}. Identified Tags: ${tags}. Move classification: ${classification}. In third person, write a concise and constructive coaching commentary explaining why this move is a ${classification}, emphasizing the identified tags.\n\nResponse:\n`;

        try {
          const res = await fetch(inputValue, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          });

          const data = await res.json();
          const responseText = data.response;

          aiCommentary.push(`Prompt: ${prompt} ${responseText}`);
        } catch (err) {
          console.error("Failed to fetch AI commentary:", err);
        }
      } else {
        console.warn("Missing required data for FEN:", fen);
      }
    }

    //DB Insertion
    try {
      console.log("aiCommentary")
      console.log(aiCommentary)

      const { userId } = await getCurrentUser();
      let accuracyHere = 0.00;
      if (sidePlayed == 'white') {
        accuracyHere = results.accuracies.white;
      } else {
        accuracyHere = results.accuracies.black;
      }

      console.log("MANDANDO A LA DB CHINGADERAS");
      await client.graphql({
        query: createAnalysis,
        variables: {
          input: {
            gameID: id,
            userID: userId,
            evaluatedPositions: JSON.stringify(results),
            accuracy: accuracyHere,
            aiCommentary: aiCommentary
          }
        }
      });

      console.log("AMONGUS SEXO ")
      const moveDataArray = extractMoves(evaluatedPositions, aiCommentary);
      console.log("Extracted moves:", moveDataArray); // DEBUG
      setMoves(moveDataArray);
      setAccuracy(accuracyHere);

    } catch (error) {
      console.error("ERROR EN EL MUTATION DE createAnalysis ");
      console.error(error);
    }

    } catch (error) {
      console.error("Error during analysis:", error);
    }
  };

  const handleStartAnalysisMov = async () => {
    if(pgnContent == ""){
            const res = await client.graphql({
        query: queries.getGame,
        variables: { id }
      }) as GraphQLResult<any>;

      const game = res.data.getGame;

      if(!game){
        throw new Error("DIDNT FIND THE GAME SENT TO ANALYZE");
      }

      const extractMovesOnly = (pgn: string): string | null => {
        const match = pgn.match(/1\..*?(1-0|0-1|1\/2-1\/2)/s);
        return match ? match[0].trim() : null;
      };

      if(game.platform == "Chesscom"){
        console.log("Chesscom game")
        console.log(game.pgn)
        const fullPGN = game.pgn;
        const movesOnly = extractMovesOnly(fullPGN);
        pgnContent = movesOnly || "";
      }
      if(game.platform == "Lichess"){        
        console.log("Lichess game")
        console.log(game.pgn)
        pgnContent = game.pgn
      }

      setSidePlayed(game.userColor)
    }
    // Call the method through webview
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
    }
  };

  if (!isAuthenticated) return null;

  if (Platform.OS === "web" && isConfirmed) {
    return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {/* Chessboard column */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 10 }}>
        <Chessboard
          ref={chessboardRef}
          boardSize={350}
          durations={{ move: 800 }}
        />
        <View style={styles.buttonContainer}>
          <Button
            title={analysisStartedWeb ? "Loading..." : "Start Game Analysis"}
            onPress={handleStartAnalysisWeb}
            disabled={analysisStartedWeb || existAnal}
          />
        </View>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
          Accuracy: {(typeof accuracy === 'number' ? accuracy.toFixed(2) : 'N/A')}%
        </Text>
      </View>

      {/* Moves scrollable column */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 10 }}
        contentContainerStyle={{ paddingVertical: 10 }}
      >
        {moves.map((move, index) => (
          <TouchableOpacity key={index} onPress={() => handleMoveClick(index)}>
            <View style={{ padding: 8, backgroundColor: '#f0f0f0', marginBottom: 4 }}>
              <Text>{`${move.san}`}</Text>
              {move.comment && <Text style={{ color: 'gray' }}>{move.comment}</Text>}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.iframeContainer}>
          <iframe
            id="iframe"
            src={"http://localhost:8081/public/evaluation.html"}
            style={{ width: "100%", height: "100vh", border: "none" }}
            sandbox="allow-scripts allow-same-origin"
          />
        </View>
      </ScrollView>
    </View>
  );
  }
  if ((Platform.OS === "android" || Platform.OS === "ios" ) && isConfirmed) {
    return (
      <View style={styles.container}>
        <Chessboard boardSize={400} />

        <View style={{ marginTop: 16 }}>
          <Button
            title={"Start Game Analysis"} 
            onPress={handleStartAnalysisMov} 
            disabled={analysisStartedMov}
          />
        </View>
        
        <View style={{ width: 0, height: 0, overflow: 'hidden' }}>
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
            //src={"https://your-live-site.com/public/evaluation.html"} //CAMBIAR
            style={{ width: 0, height: 0, opacity: 0 }}
          />
        </View>
      </View>
    );
  }
  if(!existAnal){
    return (
      <View style={{ padding: 16 }}>
        {/* Warning #1 */}
        <Text style={{ marginBottom: 12, fontWeight: 'bold', fontSize: 16 }}>
          You have {remainingAnalyses} analyses left (max 100).
        </Text>

        {/* Warning #2 */}
        <Text style={{ marginBottom: 12, color: 'darkred' }}>
          Only 1 analysis can run at a time. Don’t close the app or change screen while it’s running, it could cause the webworker engine to timeout (it takes 3–5 minutes). 
        </Text>

        {/* User Input */}
        <TextInput
          placeholder="Enter a label for this analysis"
          value={inputValue}
          onChangeText={setInputValue}
          style={{
            borderColor: 'gray',
            borderWidth: 1,
            padding: 8,
            marginBottom: 12,
            borderRadius: 6,
          }}
        />

        {/* Confirm Button */}
        <Button
          title="Confirm"
          onPress={() => {
            if (inputValue.trim() === '') {
              Alert.alert("Please enter something before confirming.");
              return;
            }
            if (remainingAnalyses < 1) {
              Alert.alert("You have exceeded your analysis limit, please delete some");
              router.replace('/GameHistory');
            }
            setIsConfirmed(true);
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  iframeContainer: {
    visibility: "hidden",
  },
  analysisContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  movesAccuracyContainer: {
    flex: 1,
    paddingRight: 8,
  },
  commentaryContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  moveText: {
    fontSize: 16,
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 16,
    color: "green",
  },
  commentText: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
  },
});
