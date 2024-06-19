"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var sdk_1 = require("@deepgram/sdk");
var ws_1 = require("ws");
dotenv.config();
var deepgramApiKey = process.env.VITE_DEEPGRAM_API_KEY;
if (!deepgramApiKey) {
    console.error("DEEPGRAM_API_KEY is not set in the environment variables");
    process.exit(1);
}
var deepgram = (0, sdk_1.createClient)(deepgramApiKey);
// Create WebSocket server instance
var wss = new ws_1.default.Server({ port: 8080 });
wss.on("listening", function () {
    console.log("WebSocket server is running on ws://localhost:8080");
});
wss.on("connection", function (ws) {
    console.log("New client connected");
    var connection = deepgram.transcription.live({
        punctuate: true,
        model: "nova",
        language: "en-US",
    });
    connection.on("open", function () {
        console.log("Deepgram connection opened");
    });
    connection.on("transcriptReceived", function (transcript) {
        ws.send(JSON.stringify({
            transcript: transcript.results.channels[0].alternatives[0].transcript,
        }));
    });
    connection.on("close", function () {
        console.log("Deepgram connection closed");
    });
    connection.on("error", function (error) {
        console.error("Deepgram error:", error);
        ws.send(JSON.stringify({ error: "Error with Deepgram transcription service" }));
    });
    ws.on("message", function (message) {
        connection.send(message.toString());
    });
    ws.on("close", function () {
        console.log("Client disconnected");
        connection.finish();
    });
    ws.on("error", function (error) {
        console.error("WebSocket error:", error);
        connection.finish();
    });
});
console.log("WebSocket server is running on ws://localhost:8080");
