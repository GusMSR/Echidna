"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

// Import Stockfish using ES module syntax
import { Stockfish } from "./engine.js";

const engine = new Stockfish();
let depth = 18;
let workerCount = 0;
let positions = [];

if (window.Worker) {
    console.log("Web Workers are supported!");
} else {
    console.log("Web Workers are NOT supported in this environment."); //Add an alert to the user somehow
}

window.evaluateFen = (fenArray) => __awaiter(void 0, void 0, void 0, function* () {
    // Reset tracking variables
    positions = fenArray.map(fen => ({ fen, topLines: [], worker: "" }));
    workerCount = 0;

    // Start evaluating positions using workers
    yield new Promise((resolve) => {
        const stockfishManager = setInterval(() => {
            // If all positions are evaluated, stop
            if (!positions.some(pos => pos.topLines.length === 0)) {
                console.log("Finished evaluating!");
                clearInterval(stockfishManager);
                resolve();
                return;
            }
            // Assign Stockfish workers to unevaluated positions
            for (let position of positions) {
                if (position.worker || workerCount >= 8) continue;
                console.log("Created stockfish worker");
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

    //console.log("Evaluated Positions:", positions);
    return positions;
});

// Expose function globally
window.evaluateFen = window.evaluateFen;
