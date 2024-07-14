import { HttpsError, onCall } from "firebase-functions/v2/https";
import { getTTS } from "./deepgram";

export const tts = onCall(async (request) => {
  try {
    const { text } = request.data;
    return await getTTS(text);
  } catch (error) {
    throw new HttpsError(
      "unknown",
      "Something went wrong while trying to fetch tts"
    );
  }
});
