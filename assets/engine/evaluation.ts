import { Stockfish, EngineLine} from "./engine";

const engine = new Stockfish();

export interface EvaluatedPosition {
    fen: string;
    topLines: EngineLine[],
    worker: string
}

//Extend the Window interface to include evaluateFen
declare global {
    interface Window {
        evaluateFen: (fenArray: string[]) => Promise<EvaluatedPosition[]>;
    }
}

let depth = 12;
let workerCount = 0;
let positions: EvaluatedPosition[] = [];

window.evaluateFen = async (fenArray: string[]): Promise<EvaluatedPosition[]> => {
    // Reset tracking variables
    positions = fenArray.map(fen => ({ fen, topLines: [], worker: "" }));
    workerCount = 0;

    // Start evaluating positions using workers
    await new Promise<void>((resolve) => {
        const stockfishManager = setInterval(() => {
            // If all positions are evaluated, stop
            if (!positions.some(pos => pos.topLines.length === 0)) {
                clearInterval(stockfishManager);
                resolve();
                return;
            }

            // Assign Stockfish workers to unevaluated positions
            for (let position of positions) {
                if (position.worker || workerCount >= 8) continue;

                let worker = new Stockfish();
                worker.evaluate(position.fen, depth).then((engineLines) => {
                    position.topLines = engineLines;
                    workerCount--;
                });

                position.worker = "active";
                workerCount++;
            }
        }, 10);
    });

    console.log("Evaluated Positions:", positions);
    return positions;
};

//Expose function globally
(window as any).evaluateFen = window.evaluateFen;