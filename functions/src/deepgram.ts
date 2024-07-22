import { createClient } from "@deepgram/sdk";
import "dotenv/config";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export const getTTS = async (text: string) => {
  const response = await deepgram.speak.request(
    { text },
    {
      model: "aura-asteria-en",
      encoding: "linear16",
      container: "wav",
    }
  );

  const stream = await response.getStream();
  if (stream) {
    const buffer = await getAudioBuffer(stream);
    const payload = [{ word: text, buffer: buffer }];
    return payload;
  } else {
    throw new Error("Error generating audio:");
  }
};

// helper function to convert stream to audio buffer
const getAudioBuffer = async (response: ReadableStream<Uint8Array>) => {
  const reader = response.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
  }

  const dataArray = chunks.reduce(
    (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
    new Uint8Array(0)
  );

  return Buffer.from(dataArray.buffer);
};
