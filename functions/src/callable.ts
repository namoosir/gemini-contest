// import { HttpsError, onCall } from "firebase-functions/v2/https";
// import { getTTS } from "./deepgram";
// import { chunkTextDynamically } from "./utils";

// export const tts = onCall(async (request, response) => {
//   try {
//     let { text } = request.data;

//     text = text
//     .replaceAll("¡", "")
//     .replaceAll("https://", "")
//     .replaceAll("http://", "")
//     .replaceAll(".com", " dot com")
//     .replaceAll(".org", " dot org")
//     .replaceAll(".co.uk", " dot co dot UK")
//     .replaceAll(/```[\s\S]*?```/g, "\nAs shown on the app.\n")
//     .replaceAll(
//       /([a-zA-Z0-9])\/([a-zA-Z0-9])/g,
//       (_: any, precedingText: string, followingText: string) => {
//         return precedingText + " forward slash " + followingText;
//       }
//     );

//     const chunks = chunkTextDynamically(text);
//     let response: { word: string; buffer: Buffer }[] = [];

//     for (const chunk of chunks) {
//       const buffer = await getTTS(chunk);
//       response.push({ word: chunk, buffer: buffer });
//     }

//     return response;
//   } catch (error) {
//     throw new HttpsError(
//       "unknown",
//       "Something went wrong while trying to fetch tts"
//     );
//   }
// });
