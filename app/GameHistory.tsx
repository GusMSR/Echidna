import { Alert, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';


import { Amplify } from 'aws-amplify';
import { generateClient, GraphQLResult } from 'aws-amplify/api';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser} from 'aws-amplify/auth';
import * as queries from '../src/graphql/queries';
import { deleteAnalysis } from '../src/graphql/mutations';

Amplify.configure(amplifyconfig);
const client = generateClient();

interface Game {
  id: string;
  platform: string;
  date: string;
  result: string;
  userColor: string;
}

interface Analysis {
  id: string;
  gameID: string;
  userID: string;
}

interface Filters {
  color: string;
  result: string;
}

export default function GameHistoryScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [filters, setFilters] = useState({ color: '', result: '' });
  const [analyses, setAnalyses] = useState<any[]>([]); // Replace 'any' with your Analysis type
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [userIdGlobal, setUserId] = useState('');
  const [loadingGames, setLoadingGames] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | null>('success');

  const fetchGames = async () => {
    setLoadingGames(true)
    try {
      const {userId} = await getCurrentUser();
      setUserId(userId)

      // Lichess
      const lichessRes = await client.graphql({
        query: queries.listGames,
        variables: {
          filter: {
            UserID: { eq: userId },
            platform: { eq: "Lichess" },
          },
          sortDirection: 'DESC', // Para que traiga los más recientes primero
        },
      }) as GraphQLResult<any>;

      // Chess.com
      const chessComRes = await client.graphql({
        query: queries.listGames,
        variables: {
          filter: {
            UserID: { eq: userId },
            or: [
                { platform: { contains: "Chesscom" } },
                { platform: { contains: "Chess.com" } }
              ]
          },
          sortDirection: 'DESC',
        },
      }) as GraphQLResult<any>;

      const lichessGames: Game[] = lichessRes.data?.listGames?.items || [];
      const chessComGames: Game[] = chessComRes.data?.listGames?.items || [];
      const combinedGames = [...lichessGames, ...chessComGames];

      combinedGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestGames = combinedGames.slice(0, 50);

      console.log("FETCHED GAMES")
      //console.log(combinedGames)
      setGames(latestGames);
      setFilteredGames(latestGames);
      setLoadingGames(false)
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

    const bindAnalysis = async () => {
      const {userId} = await getCurrentUser();
      try {
        setLoadingAnalyses(true);
        const existingAnalysis = await client.graphql({
          query: queries.listAnalyses,
          variables: {
            filter: {
              userID: { eq: userId }
            }
          }
        }) as GraphQLResult<{ listAnalyses: { items: Analysis[] } }>; // Type it correctly

        const fetchedItems = existingAnalysis.data?.listAnalyses?.items || [];
        setAnalyses(fetchedItems);
        console.log("FETCHED ANALYSIS")
        //console.log(fetchedItems)
      } catch (error) {
        console.error("Error fetching existing analyses:", error);
        return [];
      } finally {
        setLoadingAnalyses(false);
      }
    };

  const handleDeleteAnalysis = async (analysisId: string) => {
    console.log("Attempting to delete analysis with ID:", analysisId);
    try {
      await client.graphql({
        query: deleteAnalysis,
        variables: { input: { id: analysisId } },
      });
      await bindAnalysis(); // Call refreshAnalyses (formerly bindAnalysis)
      setStatusMessage("Analysis deleted successfully!");
      setStatusType('success'); // Set to 'success'
      console.log("Analysis deleted successfully!");

      setTimeout(() => {
        setStatusMessage('');
        setStatusType(null);
      }, 3000);
    } catch (error) {
      console.error("Error deleting analysis:", error);
      setStatusMessage("Failed to delete analysis. Please try again.");
      setStatusType('error'); // Set to 'error'

      setTimeout(() => {
        setStatusMessage('');
        setStatusType(null);
      }, 3000);
    }
  };

  const handleFilter = () => {
    const { color, result } = filters;
    const filtered = games.filter((g) =>
      (!color || g.userColor === color) &&
      (!result || g.result === result)
    );
    setFilteredGames(filtered);
  };

  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username, userId, signInDetails } = await getCurrentUser();
      /*console.log(`The username: ${username}`);
      console.log(`The userId: ${userId}`);
      console.log(`The signInDetails: ${signInDetails}`);*/
    } catch (err) {
      console.log(err);
      router.replace('/SignIn');
    }
  }

  useEffect(() => {
    currentAuthenticatedUser();
    fetchGames();
    bindAnalysis();
  }, []);

  if (!isAuthenticated) {
    return null; 
  }

  const navigateToAddGame = () => {
    router.push('/AddGameByHand'); // Navigates to the AddGameByHand page
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
      <Text style={styles.title}>Game History</Text>

      <Button title="Refresh" onPress={fetchGames} disabled={loadingGames || loadingAnalyses} />

      <View style={styles.filterRow}>
        <Picker
          selectedValue={filters.color}
          style={styles.picker}
          onValueChange={(value) => setFilters({ ...filters, color: value })}
        >
          <Picker.Item label="All Colors" value="" />
          <Picker.Item label="White" value="white" />
          <Picker.Item label="Black" value="black" />
        </Picker>

        <Picker
          selectedValue={filters.result}
          style={styles.picker}
          onValueChange={(value) => setFilters({ ...filters, result: value })}
        >
          <Picker.Item label="All Results" value="" />
          <Picker.Item label="Win" value="win" />
          <Picker.Item label="Loss" value="loss" />
          <Picker.Item label="Draw" value="draw" />
        </Picker>

        <Button title="Apply Filters" onPress={handleFilter} />
      </View>

      {loadingGames || loadingAnalyses ? (
        <Text style={styles.loadingText}>Loading games and analyses...</Text>
      ) : (
        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            // Find if an analysis exists for the current game
            const associatedAnalysis = analyses.find(
              (analysis) => analysis.gameID === item.id
            );

            return (
              <View style={styles.card}>
                <Text><Text style={styles.bold}>Platform:</Text> {item.platform}</Text>
                <Text><Text style={styles.bold}>Date:</Text> {new Date(item.date).toLocaleString()}</Text>
                <Text><Text style={styles.bold}>Result:</Text> {item.result}</Text>
                <Text><Text style={styles.bold}>Color:</Text> {item.userColor}</Text>

                {associatedAnalysis ? (
                  <View style={styles.analysisButtonsContainer}>
                    <TouchableOpacity
                      style={styles.existingAnalysisButton} // Different style for existing analysis
                      onPress={() => {
                        router.push({
                          pathname: '/Analysis',
                          params: { id: associatedAnalysis.id }, // Send analysisId for existing
                        });
                      }}
                    >
                    <Text style={styles.existingAnalysisText}>Go to Existing Analysis</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteAnalysisButton} // Style for delete button
                      onPress={() => handleDeleteAnalysis(associatedAnalysis.id)}
                    >
                      <Text style={styles.deleteAnalysisText}>Delete Analysis</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.analysisButton} // Original style for new analysis
                    onPress={() => {
                      router.push({
                        pathname: '/Analysis',
                        params: { id: item.id }, // Send gameId for new analysis
                      });
                    }}
                  >
                    <Text style={styles.analysisText}>Go to Analysis</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity
        onPress={navigateToAddGame}
        style={styles.addGameButton} // Added style for consistency
      >
        <Text style={styles.link}>Add Game by Hand</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  filterRow: { flexDirection: 'column', marginBottom: 16 },
  picker: { height: 50, width: '100%', marginBottom: 8 },
  list: { paddingBottom: 24 },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  statusPopup: {
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
  bold: { fontWeight: 'bold' },
  analysisButton: {
    backgroundColor: '#4CAF50',
    marginTop: 8,
    padding: 10,
    borderRadius: 4,
  },
  analysisText: {
    color: 'white',
    textAlign: 'center',
  },
  statusPopupSuccess: {
  backgroundColor: 'rgba(0, 200, 0, 0.8)',
  color: 'white',
},
statusPopupError: {
  backgroundColor: 'rgba(255, 0, 0, 0.8)',
  color: 'white',
},
  link: {
    color: '#1e90ff',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 16,
  },
  analysisButtonsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
    alignItems: 'center', // Align items vertically in the center
  },
  existingAnalysisButton: {
    backgroundColor: '#28A745', // Green for existing analysis
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8, // Space between buttons
  },
  existingAnalysisText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteAnalysisButton: {
    backgroundColor: '#DC3545', // Red for delete button
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8, // Space between buttons
  },
  deleteAnalysisText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addGameButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#6C757D', // Example grey background
    borderRadius: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});