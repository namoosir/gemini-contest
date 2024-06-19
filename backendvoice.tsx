import * as dotenv from "dotenv";
import { createClient } from "@deepgram/sdk";
import WebSocket from "ws";

dotenv.config();

const deepgramApiKey: string | undefined = process.env.VITE_DEEPGRAM_API_KEY;

if (!deepgramApiKey) {
  console.error("DEEPGRAM_API_KEY is not set in the environment variables");
  process.exit(1);
}

const deepgram = createClient(deepgramApiKey);

// Create WebSocket server instance
const wss = new WebSocket.Server({ port: 8080 });

wss.on("listening", () => {
  console.log("WebSocket server is running on ws://localhost:8080");
});

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");

  const connection = deepgram.transcription.live({
    punctuate: true,
    model: "nova",
    language: "en-US",
  });

  connection.on("open", () => {
    console.log("Deepgram connection opened");
  });

  connection.on("transcriptReceived", (transcript) => {
    ws.send(
      JSON.stringify({
        transcript: transcript.results.channels[0].alternatives[0].transcript,
      })
    );
  });

  connection.on("close", () => {
    console.log("Deepgram connection closed");
  });

  connection.on("error", (error) => {
    console.error("Deepgram error:", error);
    ws.send(
      JSON.stringify({ error: "Error with Deepgram transcription service" })
    );
  });

  ws.on("message", (message: WebSocket.Data) => {
    connection.send(message.toString());
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    connection.finish();
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    connection.finish();
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
