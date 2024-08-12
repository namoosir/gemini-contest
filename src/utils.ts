import { Interview } from "./services/firebase/interviewService";
import { ChatMessage as OriginalChatMessage, cleanGeminiChat } from "./services/voice/TTS";

type ChatMessage = OriginalChatMessage & {
  score?: number;
  feedback?: string;
};

export const FINAL_INTERVIEW_RESPONSE = "The interview is now over. Thank you for your time and have a great day."

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = secs.toString().padStart(2, "0");

  return `${minutesStr}:${secondsStr}`;
}

export function calculateAmplitudeFromAnalyser(analyser: AnalyserNode) {
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += Math.abs(dataArray[i] - 125);
  }
  const average = sum / bufferLength;
  const normalizedAmplitude = average / 128; // Assuming 128 is the maximum average value
  const scaledAmplitude = 1.5 + normalizedAmplitude * 35; // 5 + (0-1) * (13 - 5)

  return scaledAmplitude;
}

export const calculateAverageFrequency = (analyser: AnalyserNode): number => {
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);

  const total = frequencyData.reduce((sum, value) => sum + value, 0);
  return total / frequencyData.length;
};


export const getConversation = (result: Interview) => {
  const conversation: ChatMessage[] = [];

  for (let i = 0; i < result.chat.length; i++) {
    const message = result.chat[i].content;
    if (result.chat[i].sender === "gemini") {
      conversation.push({
        sender: "gemini",
        content: cleanGeminiChat(message ?? "No Question"),
      });
    } else if (result.chat[i].sender === "user") {
      const feedbackIndex = Math.floor(i / 2);
      conversation.push({
        sender: "user",
        content: message ?? "No Response",
        score: result.feedback[feedbackIndex]?.score?.overallScore ?? 0,
        feedback: result.feedback[feedbackIndex]?.text ?? "No feedback",
      });
    }
  }

  return conversation;
};
