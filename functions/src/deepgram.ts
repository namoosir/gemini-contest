// import { createClient } from "@deepgram/sdk";
import "dotenv/config";
import { segmentTextBySentence } from "./utils";
import { logger } from "firebase-functions/v2";
import https from "https";

const DEEPGRAM_URL =
  "https://api.deepgram.com/v1/speak?model=aura-athena-en&encoding=linear16&container=wav";
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export const getTTS = async (text: string) => {
  type response = {
    word: string;
    buffer: Uint8Array;
  }[];

  try {
    const segments = segmentTextBySentence(text);
    const responseArray: response = [];

    if (segments) {
      for (const segment of segments) {
        try {
          const audioData = await synthesizeAudio(segment);
          responseArray.push({ word: segment, buffer: audioData });
        } catch (error) {
          logger.error(
            `Something went wrong while trying to synthesize audio: ${error}`
          );
          throw new Error(
            `Something went wrong while trying to synthesize audio: ${error}`
          );
        }
      }
    }
    return responseArray;
  } catch (error) {
    logger.error(error);
    throw new Error(`Some error occured while processing request: ${error}`);
  }
};

export function synthesizeAudio(text: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ text });
    const options = {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(DEEPGRAM_URL, options, (res) => {
      const data: any = [];

      res.on("data", (chunk) => {
        data.push(chunk);
      });

      res.on("end", () => {
        const buffer = Buffer.concat(data);
        resolve(new Uint8Array(buffer));
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

// NEW AND UPCOMIGN CODE:

// const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

// export const getTTS = async (text: string) => {
//   const response = await deepgram.speak.request(
//     { text },
//     {
//       model: "aura-asteria-en",
//       encoding: "linear16",
//       container: "wav",
//     }
//   );

//   const stream = await response.getStream();
//   if (stream) {
//     const buffer = await getAudioBuffer(stream);
//     return buffer;
//   } else {
//     throw new Error("Error generating audio:");
//   }
// };

// helper function to convert stream to audio buffer
// const getAudioBuffer = async (response: ReadableStream<Uint8Array>) => {
//   const reader = response.getReader();
//   const chunks = [];

//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;

//     chunks.push(value);
//   }

//   const dataArray = chunks.reduce(
//     (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
//     new Uint8Array(0)
//   );

//   return Buffer.from(dataArray.buffer);
// };
