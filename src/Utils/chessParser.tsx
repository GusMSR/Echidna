import { Chess } from "chess.js";
import pgnParser from "pgn-parser";

export interface Position {
    fen: string;
    move?: {
        san: string;
        uci: string;
    };
}

export interface ParseResult {
    //Generate the array for positions
    positions: Position[];
}

/**
 * Parses a PGN string and returns a structured object.
 * @param pgn - The PGN string containing chess moves.
 * @returns {ParseResult} with positions and moves.
 */
export function parsePGN(pgn: string): ParseResult | null {
    if (!pgn) {
        console.error("No PGN provided.");
        return null;
    }

    try {
        //Parse only if the pgn is valid
        let [parsedPGN] = pgnParser.parse(pgn);
        if (!parsedPGN) {
            console.error("Invalid PGN.");
            return null;
        }
        
        //Simulate each position by creating a virtual board
        let board = new Chess();
        let positions: Position[] = [];

        // Store the initial board state
        positions.push({ fen: board.fen() });

        // Process each move; log FEN and SAN
        for (let pgnMove of parsedPGN.moves) {
            let moveSAN = pgnMove.move;

            let virtualBoardMove;
            try {
                virtualBoardMove = board.move(moveSAN);
            } catch (err) {
                console.error("Illegal move detected:", moveSAN);
                return null;
            }

            let moveUCI = virtualBoardMove.from + virtualBoardMove.to;

            positions.push({
                fen: board.fen(),
                move: {
                    san: moveSAN,
                    uci: moveUCI
                }
            });
        }

        return { positions };
    } catch (err) {
        console.error("Error parsing PGN:", err);
        return null;
    }
}
