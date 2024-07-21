import { segmentTextBySentence, synthesizeAudio } from "./utils.js";

export const getTTS = async (text, client) => {
  try {
    const segments = segmentTextBySentence(text);

    if (segments) {
      for (const segment of segments) {
        try {
          const audioData = await synthesizeAudio(segment);
          client.send(JSON.stringify({ word: segment, buffer: audioData }));
        } catch (error) {
          throw new Error(
            `Something went wrong while trying to synthesize audio: ${error}`
          );
        }
      }
    }
    console.log("Done!.\n");
  } catch (error) {
    throw new Error(
      `Some error occured while processing TTS request: ${error}`
    );
  }
};

export const getSTT = async (blob, client) => {
  try {
    console.log(blob)
    const socket = new WebSocket(
      "wss://api.deepgram.com/v1/listen?punctuate=true",
      ["token", import.meta.env.VITE_DEEPGRAM_API_KEY || ""]
    );

    socket.send(blob);

    socket.onmessage = (message) => {
      const received = JSON.parse(message.data);
      const transcriptText = received.channel.alternatives[0].transcript;
      client.send(JSON.stringify({ text: transcriptText }));
    };

    socket.onerror = (error) => {
      throw new Error(`Socket Error processing stt message: ${error}`);
    };

    socket.onclose = () => {
      console.log("WebSocket closed.");
    };
  } catch (error) {
    throw new Error(`From stt ${error}`);
  }
};
