import {getVertexAI, getGenerativeModel, Content } from "firebase/vertexai-preview";
import {app} from "../../FirebaseConfig";

const vertexAI = getVertexAI(app);

const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });
async function initalizeChat(setStr: string) : Promise<any> {

  let history = [
    {
      role: "user",
      parts: [{ text: setStr }],
    },
    {
      role: "model",
      parts: [{ text: "OK" }],
    },
  ] as Content[];
  
  return model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 100,
    },
  });
}

async function prompt(chat: any, msg: string): Promise<string> {
  try {
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}


async function* promptStream(chat: any, msg: string): AsyncIterable<string> {
  const result = await chat.sendMessageStream(msg);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    yield chunkText;
  }
}

export { initalizeChat, prompt, promptStream }
