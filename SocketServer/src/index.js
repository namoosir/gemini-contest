/**
 * References
 *
 * Status code: https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1
 */

import { WebSocketServer } from "ws";
import { getSTT, getTTS } from "./deepgram.js";

const wss = new WebSocketServer({ port: 8080 }, () =>
  console.log("WebSocket server started on port 8080")
);

wss.on("connection", (client, req) => {
  console.log("Client connected");

  client.on("message", (data) => {
    try {
      const jsonObj = JSON.parse(data.toString());
      const { action } = jsonObj;

      switch (action) {
        case "tts":
          const { text } = jsonObj;
          getTTS(text, client);
          console.log(`TTS request for this text: ${text}`);
          break;

        case "stt":
          const { blob } = jsonObj;
          getSTT(blob, client);
          break;

        default:
          client.close(1011, "Invalid request");
      }
    } catch (error) {
      console.error(error);
      client.close(1003, error);
    }
  });

  client.on("error", (err) => console.error(err.message));
  client.on("close", () => console.log("Session closed."));
});
