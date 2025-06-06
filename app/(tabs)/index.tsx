import { GestureHandlerRootView } from 'react-native-gesture-handler';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Calendar, BookOpen, Puzzle } from 'lucide-react-native';

import { Amplify } from 'aws-amplify';
import { generateClient, GraphQLResult } from 'aws-amplify/api';
import amplifyconfig from '../../src/amplifyconfiguration.json';
import { getCurrentUser} from 'aws-amplify/auth';
import { createUser, createGame, updateUser, deleteGame } from '../../src/graphql/mutations';
import * as queries from '../../src/graphql/queries';


Amplify.configure(amplifyconfig);
const client = generateClient();

export default function TabOneScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username, userId, signInDetails } = await getCurrentUser();
      /*console.log(`The username: ${username}`);
      console.log(`The userId: ${userId}`);
      console.log(`The signInDetails: ${signInDetails}`);*/

      //Try to insert into database (medio mañoso pero no hay pedoooo)
      const res = await client.graphql({
        query: queries.getUser,
        variables: { id: userId }
      }) as GraphQLResult<any>;

      //const result = await client.graphql({ query: queries.listUsers });
      //console.log(result)

      if (!res.data?.getUser) {
        await client.graphql({
          query: createUser,
          variables: {
            input: {
              id: userId,
            }
          }
        });
      }

    //Refreshed and export new games played (if username changed, check if it had exported games before)
    try {
        const user = res.data.getUser;

        if (!user) return;
        const { lichessUsername, chesscomUsername, lastCheckedGameTime } = user;

        if (!lichessUsername || !chesscomUsername) {
          console.log("No synced accounts") 
          return 
        }; // No lichess or chesscom user registered

        // Check if any game in DB has this user and PGN includes the username
        const existingGamesReslichess = await client.graphql({
          query: queries.listGames,
          variables: {
            filter: {
              UserID: { eq: userId },
              platform: { eq: "Lichess"},
            },
            limit: 1,
          }
        }) as GraphQLResult<any>;

        const existingGamesReschess = await client.graphql({
          query: queries.listGames,
          variables: {
            filter: {
              or: [
                { platform: { contains: "Chesscom" } },
                { platform: { contains: "Chess.com" } }
              ]
            },
            limit: 1,
          }
        }) as GraphQLResult<any>;

        const hasGameslichess = existingGamesReslichess.data.listGames.items.length > 0;
        const hasGameschess = existingGamesReschess.data.listGames.items.length > 0;

        const now = Date.now();
        let since = new Date().setMonth(new Date().getMonth() - 6)
        if(hasGameslichess){
          //console.log("Retrieving since last checked") 
          // Prepare time range
          const sinceDate = lastCheckedGameTime
            ? new Date(lastCheckedGameTime)
            : new Date(new Date().setMonth(new Date().getMonth() - 6));
          since = sinceDate.getTime();
        }

      const url = `https://lichess.org/api/games/user/${lichessUsername}?since=${since}&until=${now}&max=300&perfType=blitz,rapid,classical`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/x-ndjson",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Readable stream not available in response.");

      const decoder = new TextDecoder("utf-8");
      let text = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let lines = buffer.split("\n");
        buffer = lines.pop() || ""; // guarda la última línea incompleta

        for (const line of lines) {
          if (line.trim().length > 0) {
            text += line + "\n";
          }
        }
      }

      if (buffer.trim().length > 0) {
        text += buffer + "\n";
      }

      const games = text
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line));

        for (const game of games) {
          //console.log("Lichess object:")
          //console.log(game)
          const pgn = game.moves;
          let color: "white" | "black" | null = null;
          if (game.players.white?.user?.id?.toLowerCase() === lichessUsername.toLowerCase()) {
            color = "white";
          } else if (game.players.black?.user?.id?.toLowerCase() === lichessUsername.toLowerCase()) {
            color = "black";
          } else {
            console.warn("Game does not belong to user:", game);
            continue;
          }

          let result: "win" | "loss" | "draw" = "draw";
          if (game.winner === color) {
            result = "win";
          } else if (game.winner && game.winner !== color) {
            result = "loss";
          }

          const newGame = {
            UserID: userId,
            pgn,
            platform: "Lichess",
            date: game.createdAt
            ? new Date(game.createdAt).toISOString()
            : new Date().toISOString(),
            result,
            rating: game.players[color]?.rating,
            userColor: color,
          };

          if (!newGame.pgn || !newGame.platform || !newGame.result || !newGame.userColor || !newGame.UserID) {
            console.error("Missing required fields in newGame:", newGame);
          }
          await client.graphql({
            query: createGame,
            variables: {input: newGame}
          }) as GraphQLResult<any>; 
        }

        // Update lastCheckedGameTime
        await client.graphql({
          query: updateUser,
          variables: {
            input: {
              id: userId,
              lastCheckedGameTime: new Date().toISOString(),
            }
          }
        }) as GraphQLResult<any>;

  const  extractTag = (pgn: string, tag: string): string | null => {
    const match = pgn.match(new RegExp(`\\[${tag} "(.*?)"\\]`));
    return match ? match[1] : null;
  };

  if (hasGameschess) {
    //console.log("Retrieving chess.com games since last checked");

    const sinceDate = lastCheckedGameTime
      ? new Date(lastCheckedGameTime)
      : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const sinceYear = sinceDate.getFullYear();
    const sinceMonth = sinceDate.getMonth() + 1;

    // Fetch only the month/year since last checked
    const chessComUrl = `https://api.chess.com/pub/player/${chesscomUsername}/games/${sinceYear}/${String(sinceMonth).padStart(2, "0")}`;

    const chessResponse = await fetch(chessComUrl);
    if (!chessResponse.ok) {
      throw new Error(`Chess.com HTTP error! status: ${chessResponse.status}`);
    }
    const chessData = await chessResponse.json();

    for (const game of chessData.games) {
      //console.log("chesscom object:");
      //console.log(game);

      if (!game.pgn) {
        console.warn("Game missing PGN, skipping:", game);
        continue;
      }

    const pgn = game.pgn;

    const whiteUsername = extractTag(pgn, "White")?.toLowerCase();
    const blackUsername = extractTag(pgn, "Black")?.toLowerCase();

      let color: "white" | "black" | null = null;
      if (whiteUsername === chesscomUsername.toLowerCase()) color = "white";
      else if (blackUsername === chesscomUsername.toLowerCase()) color = "black";
      else {
        console.warn("Game does not belong to user (PGN tags):");
        continue;
      }

      let result: "win" | "loss" | "draw" = "draw";
      const rawResult = extractTag(pgn, "Result");
      if ((color === "white" && rawResult === "1-0") || (color === "black" && rawResult === "0-1")) {
        result = "win";
      } else if ((color === "white" && rawResult === "0-1") || (color === "black" && rawResult === "1-0")) {
        result = "loss";
      } else if (rawResult === "1/2-1/2") {
        result = "draw";
      }

    const ratingStr = extractTag(pgn, color === "white" ? "WhiteElo" : "BlackElo");
    const rating = ratingStr ? parseInt(ratingStr) : 0;

    const dateTag = extractTag(pgn, "Date");
    const date = dateTag
      ? new Date(dateTag.replace(/\./g, "-")).toISOString()
      : game.end_time
      ? new Date(game.end_time * 1000).toISOString()
      : new Date().toISOString();

      const newGame = {
        UserID: userId,
        pgn: game.pgn,
        platform: "Chesscom",
        date,
        result,
        rating,
        userColor: color,
      };

      if (!newGame.pgn || !newGame.platform || !newGame.result || !newGame.userColor || !newGame.UserID) {
        console.error("Missing required fields in Chess.com newGame:", newGame);
        continue;
      }

      await client.graphql({
        query: createGame,
        variables: { input: newGame },
      }) as GraphQLResult<any>;
    }
  } else {
    // If no games, fetch 6 months back (one request per month)
    //console.log("No chess.com games found; fetching last 6 months");

    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");

      const chessComUrl = `https://api.chess.com/pub/player/${chesscomUsername}/games/${year}/${month}`;

      const chessResponse = await fetch(chessComUrl);
      if (!chessResponse.ok) {
        console.warn(`Chess.com HTTP error for ${year}-${month}! status: ${chessResponse.status}`);
        continue;
      }
      const chessData = await chessResponse.json();

      for (const game of chessData.games) {
        //console.log("chesscom object:")
        //console.log(game)
        let color: "white" | "black" | null = null;
        if (game.white.username.toLowerCase() === chesscomUsername.toLowerCase()) color = "white";
        else if (game.black.username.toLowerCase() === chesscomUsername.toLowerCase()) color = "black";
        else {
          console.warn("Game does not belong to user", game);
          continue;
        }

        let result: "win" | "loss" | "draw" = "draw";
        const userResult = game[color].result;
        if (userResult === "win") result = "win";
        else if (["checkmated", "timeout", "resigned", "lose"].includes(userResult)) result = "loss";
        else if (["agreed", "stalemate", "repetition", "timevsinsufficient", "insufficient"].includes(userResult)) result = "draw";

        const newGame = {
          UserID: userId,
          pgn: game.pgn,
          platform: "Chesscom",
          date: game.end_time ? new Date(game.end_time * 1000).toISOString() : new Date().toISOString(),
          result,
          rating: game[color].rating,
          userColor: color,
        };

        if (!newGame.pgn || !newGame.platform || !newGame.result || !newGame.userColor || !newGame.UserID) {
          console.error("Missing required fields in Chess.com newGame:", newGame);
          continue;
        }

        await client.graphql({
          query: createGame,
          variables: { input: newGame },
        }) as GraphQLResult<any>;
      }
    }
  }

     try {
    // 1. Fetch all user's games with pagination
    let allGames: any[] = [];
    let nextToken: string | null = null;

    do {
      const res = await client.graphql({
        query: queries.listGames,
        variables: {
          filter: { UserID: { eq: userId } },
          limit: 1000,
          nextToken,
        },
      }) as { data: any };

      const gamesData = res.data.listGames;
      allGames = allGames.concat(gamesData.items);
      nextToken = gamesData.nextToken;
    } while (nextToken);

    // 2. Identify duplicates based on pgn, platform, and rating
    const seen = new Map<string, string>(); // key -> game id
    const duplicates: string[] = [];

    for (const game of allGames) {
      const key = `${game.pgn}`;
      if (seen.has(key)) {
        duplicates.push(game.id);
      } else {
        seen.set(key, game.id);
      }
    }

    //console.log(`Found ${duplicates.length} duplicate games.`);

    // 3. Delete duplicates
    for (const gameId of duplicates) {
      await client.graphql({
        query: deleteGame,
        variables: { input: { id: gameId } },
      });
      //console.log(`Deleted duplicate game: ${gameId}`);
    }

    //console.log('All duplicates deleted successfully.');
  } catch (error) {
    console.error('Error deleting duplicates:', error);
  }
      } catch (err) {
        console.error("Error syncing games:", err);
      }

    } catch (err) {
      console.log(err);
      router.replace('/SignIn');
    }
  }
  useEffect(() => {
    // Code executed once when app launched
    currentAuthenticatedUser();
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your challenge!</Text>
      <View style={styles.separator} />

      <TouchableOpacity style={styles.button} onPress={() => { router.push('/Challenges'); /* TODO: Implement Daily Challenge */ }}>
        <Calendar size={24} color="#fff" />
        <Text style={styles.buttonText}>Daily</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={() => { router.push('/Challenges');/* TODO: Implement Thematic Challenge */ }}>
        <BookOpen size={24} color="#fff" />
        <Text style={styles.buttonText}>Thematic</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => { router.push('/TrainingCicle');/* TODO: Implement Puzzle Challenge */ }}>
        <Puzzle size={24} color="#fff" />
        <Text style={styles.buttonText}>Puzzle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 20,
    height: 2,
    width: '80%',
    backgroundColor: '#444',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E79B2',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
