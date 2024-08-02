import { Functions, httpsCallable } from "firebase/functions";
export interface ChatMessage {
  sender: "user" | "gemini";
  content: string;
}

export interface MessageData {
  channel?: {
    alternatives?: {
      transcript?: string;
    }[];
  };
}

const BASE_URL =
  "http://127.0.0.1:5001/gemini-contest/northamerica-northeast1/api";

export const fetchAudioBuffer = async (
  sentence: string,
  functions: Functions
) => {
  try {
    const getTTS = httpsCallable(functions, "tts");
    const result = await getTTS({ text: sentence, model: "" });
    return result.data as { word: string; buffer: Uint8Array }[];
  } catch (error) {
    alert(
      "Something went wrong while trying to fetch, maybe turn on cloud function or fix backend"
    );
    throw new Error(error as string);
  }
};

export const fetchAudio = async (text: string) => {
  const response = await fetch(`${BASE_URL}/audio/tts`, {
    cache: "no-store",
    method: "POST",
    body: JSON.stringify({ text }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.blob();
};

export const getAPIKey = async () => {
  const response = await fetch(`${BASE_URL}/audio/stt/key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid: "test" }),
  });

  if (response.ok) {
    const data = await response.text();
    return JSON.parse(data).key as string;
  }
};

export const initVoiceWebSocket = (
  apiKey: string | undefined,
  interval: React.MutableRefObject<NodeJS.Timeout | null>,
  setTranscript: React.Dispatch<React.SetStateAction<string>>,
  setChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  const socket = new WebSocket(
    "wss://api.deepgram.com/v1/listen?smart_format=true",
    ["token", apiKey!]
  );

  socket.onopen = () => {
    console.log("WebSocket connected");
    const keepAliveMsg = JSON.stringify({ type: "KeepAlive" });

    interval.current = setInterval(() => {
      socket.send(keepAliveMsg);
    }, 3000);
  };

  socket.onmessage = (message) => {
    if (message?.data) {
      const received = JSON.parse(message.data as string) as MessageData;
      const transcriptText = received?.channel?.alternatives?.[0].transcript;

      if (transcriptText) {
        updateLatestChat(transcriptText, setChat);
        setTranscript((history) => (history += transcriptText));
      }
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket closed.", new Date());
  };

  return socket;
};

export const initMediaRecorder = async (socket: WebSocket | null) => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: "audio/webm",
  });

  mediaRecorder.addEventListener("dataavailable", (event) => {
    if (event.data && event.data.size > 0) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(event.data);
      }
    }
  });

  mediaRecorder.start(250); // Start recording, gather data every 250 ms
  mediaRecorder.pause();
  return { mediaRecorder, stream };
};

export const playbackGeminiResponse = async (
  data: { word: string; buffer: ArrayBuffer },
  setChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  audioCtx: AudioContext
) => {
  updateLatestChat(data.word, setChat);
  const audioBuffer = await audioCtx.decodeAudioData(data.buffer);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  // Create a buffer source and play the audio
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  analyser.connect(audioCtx.destination);
  source.start();

  return { source, analyser }
};

export const updateLatestChat = (
  text: string,
  setChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  setChat((history) => {
    const newHistory = [...history];
    const lastItem = newHistory[newHistory.length - 1];

    newHistory[newHistory.length - 1] = {
      ...lastItem,
      content: lastItem.content + " " + text.replace('......', '').replace('.....', ''),
    };

    return newHistory;
  });
};
