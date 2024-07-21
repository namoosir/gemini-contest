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

export const fetchAudioBuffer = async (
  sentence: string
): Promise<{ word: string; buffer: Uint8Array }[]> => {
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
    alert(
      "Something went wrong while trying to fetch, maybe turn on cloud function or fix backend"
    );
    throw new Error(`${error as string}`);
  }
};

export const getAPIKey = async () => {
  const response = await fetch(
    "http://127.0.0.1:5001/gemini-contest/us-central1/api/audio/stt/key",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid: "test" }),
    }
  );

  if (response.ok) {
    const data = await response.text();
    return JSON.parse(data).key as string;
  }
};

export const initVoiceWebSocket = async (
  apiKey: string | undefined,
  interval: React.MutableRefObject<NodeJS.Timeout | null>,
  setTranscript: React.Dispatch<React.SetStateAction<string>>,
  setChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  const socket = new WebSocket(
    "wss://api.deepgram.com/v1/listen?punctuate=true",
    ["token", apiKey || ""]
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

  mediaRecorder.start(250); // Start recording, gather data every second
  mediaRecorder.pause();
  return { mediaRecorder, stream };
};

export const playbackGeminiResponse = async (
  data: { word: string; buffer: Uint8Array }[],
  setChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  audioCtx: AudioContext
) => {
  for (const chunk of data) {
    updateLatestChat(chunk.word, setChat);

    // const typedArray = new Uint8Array(Object.values(chunk.buffer)).buffer;
    const arrayBuffer = new Uint8Array(Object.values(chunk.buffer)).buffer;
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Create a buffer source and play the audio
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();

    // Wait for the current chunk to finish playing
    await new Promise<void>((resolve) => {
      source.onended = () => {
        resolve();
      };
    });
  }
};

const updateLatestChat = (
  text: string,
  setChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  setChat((history) => {
    const newHistory = [...history];
    const lastItem = newHistory[newHistory.length - 1];

    newHistory[newHistory.length - 1] = {
      ...lastItem,
      content: lastItem.content + " " + text,
    };

    return newHistory;
  });
};

// export const playAudio = (arrayBuffer: ArrayBuffer, audioCtx: AudioContext) => {
//   return new Promise<void>(resolve => {
//     audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
//       const source = audioCtx.createBufferSource()
//       source.buffer = buffer
//       source.connect(audioCtx.destination)
//       source.start(0)
//       source.onended = () => {
//         resolve()
//       }
//     }, error => {
//       console.error('Error decoding audio data:', error)
//       throw new Error(`Something went wrong while trying to play audio ${error}`)
//     })
//   })
// }


// export const fetchAudioBuffer = async (sentence: string) => {
//   const response = await fetch(
//     "http://127.0.0.1:5001/gemini-contest/us-central1/api/audio/tts",
//     {
//       method: "POST",
//       body: JSON.stringify({ text: sentence, model: "" }),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`Backend error: ${response.status} ${errorText}`);
//   }
//   return await response.blob();
// };
