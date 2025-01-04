import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Chessboard from 'react-native-chessboard';

export default function AnalysisPage() {
  // Assuming `route.params` has a 'game' object or PGN file passed from the history page
  //const { game } = route.params; { route : any, navigation }
  
  const [analysisStarted, setAnalysisStarted] = useState(false);
  
  const handleStartAnalysis = () => {
    // Placeholder for starting the analysis. You will implement the actual analysis logic later.
    setAnalysisStarted(true);
    //console.log("Starting analysis for game:", game);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chess Game Analysis</Text>

      <Chessboard boardSize={400}/>
      
      {/* Show button to start analysis */}
      <Button
        title={analysisStarted ? "Analysis in Progress..." : "Start Game Analysis"}
        onPress={handleStartAnalysis}
        disabled={analysisStarted}
      />
      
      {/* Add more UI components or information about the game, like game details, etc. */}
      <Text style={styles.gameDetails}>
        {/*{game ? `Game ID: ${game.id}` : "No game selected"}*/}
      </Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chessboard: {
    width: '100%',
    height: 400,
    marginBottom: 20,
  },
  gameDetails: {
    fontSize: 16,
    marginTop: 10,
  },
});
