import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getTTS } from "./deepgram";
import { chunkTextDynamically } from "./utils";

export const tts = onCall(async (request) => {
  try {
    const { text } = request.data;
    const chunks = chunkTextDynamically(text);
    let response: { word: string; buffer: Buffer }[] = [];

    for (const chunk of chunks) {
      const buffer = await getTTS(chunk);
      response.push({ word: chunk, buffer: buffer });
    }

    return response;
  } catch (error) {
    throw new HttpsError(
      "unknown",
      "Something went wrong while trying to fetch tts"
    );
  }
});
