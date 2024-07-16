import { prompt } from "@/services/gemini/base";
import { InterviewBot } from "@/services/gemini/JobDParserBot";
import { fetchAudioBuffer, getAPIKey } from "@/services/voice/TTS";
import { useRef, useState, useEffect } from "react";
import Chats, { ChatMessage } from "../Chats";

interface MessageData {
  channel?: {
    alternatives?: {
      transcript?: string;
    }[];
  };
}

function Chat() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [showMic, setShowMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [apiKey, setApiKey] = useState<string | undefined>()
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  
  const gemini = new InterviewBot();
  let socketInterval: NodeJS.Timeout;

  const updateLatestChat = (text: string) => {
    setChat((history) => {
      const newHistory = [...history];
      const lastItem = newHistory[newHistory.length - 1];

      newHistory[newHistory.length - 1] = {
        ...lastItem,
        content: lastItem.content + " " + text,
      };

      return newHistory;
    });
  }

  useEffect(() => {
    async function fetchKey() {
      setApiKey(await getAPIKey())
    }

    fetchKey()
  }, []);

  useEffect(() => {
    if (!apiKey)
      return

    const initWebSocket = async () => {
      const socket = new WebSocket(
        "wss://api.deepgram.com/v1/listen?punctuate=true",
        ["token", apiKey || ""]
      );
  
      socket.onopen = () => {
        const keepAliveMsg = JSON.stringify({ type: "KeepAlive" });

        socketInterval = setInterval(() => {
          socket.send(keepAliveMsg)
        }, 3000)
      };
  
      socket.onmessage = (message) => {
        if (message?.data) {
          const received = JSON.parse(message.data as string) as MessageData;
          const transcriptText =
            received?.channel?.alternatives?.[0].transcript;
  
          if (transcriptText) {
            updateLatestChat(transcriptText)
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
      
      socketRef.current = socket;
    }

    initWebSocket()
  }, [apiKey])

  async function jobSubmitHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (jobDescription === "") {
      alert("Provide job desc");
      return;
    }
    await handleResponse(await gemini.initInterviewForJobD(jobDescription));
  }

  async function handleResponse(text: string) {
    const data = await fetchAudioBuffer(text);
    const audioCtx = new AudioContext();
    setChat((history) => [...history, { sender: "gemini", content: "" }]);

    for (const chunk of data) {
      updateLatestChat(chunk.word)

      const typedArray = new Uint8Array(Object.values(chunk.buffer));
      const arrayBuffer = typedArray.buffer;
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
    await audioCtx.close();
    await startRecording();
  }

  const startRecording = async () => {
    try {
      setShowMic(true);
      setTranscript("");
      setChat((history) => [...history, { sender: "user", content: "" }]);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const socket = socketRef.current!

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        }
      });

      mediaRecorder.start(250);

      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
    setShowMic(false);
    await handleResponse(await prompt(transcript));
  };

  // TODO: Gotta clean up
  // async function cleanup() {
  //   stopRecording
  //   mediaRecorderRef.current?.stop()
  //   socketRef.current?.close()
  //   await audioContextRef.current?.close()

  //   mediaRecorderRef.current = null
  //   socketRef.current = null
  //   audioContextRef.current = null
  // }

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={jobSubmitHandler} className="p-4">
        <label>
          Provide the Job description to Start the interview process:
          <textarea
            style={{ color: "black" }}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </label>
        <button type="submit">Submit</button>
      </form>

      <Chats chats={chat} />

      {showMic && (
        <button
          className="bg-primary p-4 rounded my-2"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      )}
      <br></br>
      {/* <Button onClick={() => clearInterval(socketInterval)}>stop</Button> */}
    </div>
  );
}

export default Chat;
