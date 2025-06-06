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

//Object.defineProperty(exports, "__esModule", { value: true });
//  exports.Stockfish = void 0;

export class Stockfish {
    constructor() {
        this.worker = new Worker(this.getEnginePath());
        this.depth = 0;
        this.initWorker();
    }

    getEnginePath() {
        return typeof WebAssembly === "object" ? "./stockfish-nnue-16.js" : "./stockfish.js";
    }

    initWorker() {
        this.worker.postMessage("uci");
        this.worker.postMessage("setoption name MultiPV value 2");  

        // Add logging to debug worker communication
        this.worker.addEventListener("message", event => {
            //console.log("Worker says:", event.data);  // Log everything the worker sends
        });

        this.worker.addEventListener("error", event => {
            //console.error("Worker error:", event);
        });
    }

    evaluate(fen, targetDepth, verbose = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.worker.postMessage(`position fen ${fen}`);
            this.worker.postMessage(`go depth ${targetDepth}`);

            const messages = [];
            const lines = [];

            return new Promise((resolve) => {
                this.worker.addEventListener("message", (event) => {
                    let message = event.data;
                    messages.unshift(message);

                    if (verbose) console.log(message);

                    let latestDepth = parseInt(message.match(/(?:depth )(\d+)/)?.[1] || "0");
                    this.depth = Math.max(latestDepth, this.depth);

                    if (message.startsWith("bestmove") || message.includes("depth 0")) {
                        let searchMessages = messages.filter(msg => msg.startsWith("info depth"));

                        for (let searchMessage of searchMessages) {
                            let id = parseInt(searchMessage.match(/(?:multipv )(\d+)/)?.[1]);
                            let depth = parseInt(searchMessage.match(/(?:depth )(\d+)/)?.[1]);
                            //let moveUCI = searchMessage.match(/(?: pv )(.+?)(?= |$)/)?.[1];
                            let moveUCI = searchMessage.match(/ pv (.+)/)?.[1];
                            let evaluation = {
                                type: searchMessage.includes(" cp ") ? "cp" : "mate",
                                value: parseInt(searchMessage.match(/(?:(?:cp )|(?:mate ))([\d-]+)/)?.[1] || "0")
                            };

                            if (fen.includes(" b ")) {
                                evaluation.value *= -1;
                            }

                            if (!id || !depth || !moveUCI || depth !== targetDepth || lines.some(line => line.id === id)) {
                                continue;
                            }

                            lines.push({ id, depth, evaluation, moveUCI });
                        }

                        this.worker.terminate();
                        resolve(lines);
                    }
                });

                this.worker.addEventListener("error", () => this.handleWorkerError(fen, targetDepth, verbose, resolve));
            });
        });
    }

    handleWorkerError(fen, targetDepth, verbose, resolve) {
        this.worker.terminate();
        this.worker = new Worker("/static/scripts/stockfish.js");
        this.initWorker();
        this.evaluate(fen, targetDepth, verbose).then(resolve);
    }
}

//exports.Stockfish = Stockfish;
