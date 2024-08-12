import { Readable } from 'stream';
import https from "https";
import "dotenv/config";
import axios from 'axios'

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_BASE_URL = 'https://api.deepgram.com'

export const getTTS = async (text: string) => {
  const model = "aura-asteria-en";

  try {
    const response = await axios({
      method: 'POST',
      url: `${DEEPGRAM_BASE_URL}/v1/speak?model=${model}`,
      data: JSON.stringify({ text }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${DEEPGRAM_API_KEY}`,
      },
      responseType: 'stream', // Stream response
    });

    if (!response.data) {
      throw new Error('Unable to get response from API.');
    }

    return response.data as Readable;
  } catch (error) {
    throw new Error((error as Error).message || 'An error occurred.');
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
