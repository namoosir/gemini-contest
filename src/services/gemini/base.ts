import {
  getVertexAI,
  getGenerativeModel,
  Content,
  ChatSession,
} from "firebase/vertexai-preview";
import { app } from "../../FirebaseConfig";

const vertexAI = getVertexAI(app);

const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash-001" });
function initalizeChat(setStr: string): ChatSession {
  const history = [
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

async function prompt(chat: ChatSession, msg: string): Promise<string> {
  try {
    const result = await chat.sendMessage(msg);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

async function* promptStream(
  chat: ChatSession,
  msg: string
): AsyncIterable<string> {
  const result = await chat.sendMessageStream(msg);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    yield chunkText;
  }
}

export { initalizeChat, prompt, promptStream };
