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
      const data: Buffer[] = [];
      res.on("data", (chunk) => {
        data.push(chunk);
      });

      res.on("end", () => {
        const buffer = Buffer.concat(data);
        resolve(buffer);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}
