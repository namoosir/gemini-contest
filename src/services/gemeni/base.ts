import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAudioBuffer, playAudio } from "../voice/getAudioBuffer";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_APP_GEMENI_API_KEY ?? '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const chat = model.startChat({
  history: [],
  generationConfig: {
    maxOutputTokens: 100,
  },
});


async function prompt(msg: string, audioCtx: AudioContext): Promise<string> {
  try {
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    const arrayBuffer = await getAudioBuffer({
      text: text,
      model: "aura-asteria-en"
    })
    await playAudio(arrayBuffer, audioCtx)
    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}


export { prompt }
