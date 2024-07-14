import { Functions, httpsCallable } from "firebase/functions";

export const fetchAudioBuffer = async (sentence: string) => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5001/gemini-contest/us-central1/api/audio/tts",
      {
        method: "POST",
        body: JSON.stringify({ text: sentence, model: "" }),
      }
    );
    return (await response.json()) as Promise<
      { word: string; buffer: Uint8Array }[]
    >;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const fetchAudioBufferV2 = async (
  sentence: string,
  functions: Functions
) => {
  try {
    const getTTS = httpsCallable(functions, "tts");
    const result = await getTTS({ text: sentence, model: "" });
    return result.data as Promise<{ word: string; buffer: Uint8Array }[]>;
  } catch (error) {
    throw new Error(error as string);
  }
};
