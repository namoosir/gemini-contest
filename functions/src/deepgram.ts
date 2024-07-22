import { createClient } from "@deepgram/sdk";
import https from "https";
import "dotenv/config";

import { getAudioBuffer } from "./utils";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const deepgram = createClient(DEEPGRAM_API_KEY);

export const getTTS = async (text: string) => {
  const response = await deepgram.speak.request(
    { text },
    {
      model: "aura-helios-en",
      encoding: "linear16",
      container: "wav",
    }
  );

  const stream = await response.getStream();
  if (stream) {
    return await getAudioBuffer(stream);
  } else {
    throw new Error("Error generating audio:");
  }
};

export function getDeepgramKey(uid: string) {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      hostname: "api.deepgram.com",
      port: null,
      path: "/v1/projects/45b47ea9-1093-4586-b289-6ca18b43edf8/keys",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
      },
    };

    const req = https.request(options, function (res) {
      const chunks: Buffer[] = [];

      res.on("data", function (chunk: Buffer) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(body.toString());
      });
    });

    req.on("error", function (error: any) {
      reject(error);
    });

    req.write(
      JSON.stringify({
        time_to_live_in_seconds: 60,
        comment: uid,
        scopes: ["usage:write"],
      })
    );
    req.end();
  });
}
