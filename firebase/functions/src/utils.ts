/* eslint-disable @typescript-eslint/no-explicit-any */
import https = require("https");
import "dotenv/config";

const DEEPGRAM_URL =
  "https://api.deepgram.com/v1/speak?model=aura-athena-en&encoding=linear16&container=wav";
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export function segmentTextBySentence(text: string) {
  return text.match(/[^.!?]+[.!?]/g)?.map((sentence) => sentence.trim());
}

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
