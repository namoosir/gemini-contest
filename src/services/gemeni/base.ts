import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_APP_GEMENI_API_KEY ?? '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


async function prompt(promptText: string): Promise<string> {
    try {
      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  }


export { prompt }
