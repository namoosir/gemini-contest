import { prompt } from "@/services/gemini/base";
import { InterviewBot } from "@/services/gemini/JobDParserBot";
import { fetchAudioBuffer } from "@/services/voice/TTS";
import { useRef, useState } from "react";
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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [transcript, setTranscript] = useState<string>("");

  const gemini = new InterviewBot();

  async function jobSubmitHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (jobDescription === "") {
      alert("Provide job desc");
      return;
    }
    await handleReponse(await gemini.initInterviewForJobD(jobDescription));
  }

  async function handleReponse(text: string) {
    const data = await fetchAudioBuffer(text);
    const audioCtx = new AudioContext();
    setChat((history) => [...history, { sender: "gemini", content: "" }]);

    for (const chunk of data) {
      setChat((history) => {
        const newHistory = [...history]
        const lastItem = newHistory[newHistory.length - 1]

        newHistory[newHistory.length - 1] = {
          ...lastItem,
          content: lastItem.content + " " + chunk.word
        }
        
        return newHistory
      });

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

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const socket = new WebSocket(
        "wss://api.deepgram.com/v1/listen?punctuate=true",
        ["token", import.meta.env.VITE_DEEPGRAM_API_KEY || ""]
      );
      socketRef.current = socket;

      socket.onopen = () => {
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data && event.data.size > 0) {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(event.data);
            }
          }
        });

        mediaRecorder.start(250);
      };

      socket.onmessage = (message) => {
        if (message?.data) {
          const received = JSON.parse(message.data as string) as MessageData;
          const transcriptText =
            received?.channel?.alternatives?.[0].transcript;

          if (transcriptText) {
            setChat((history) => {
              const newHistory = [...history]
              const lastItem = newHistory[newHistory.length - 1]

              newHistory[newHistory.length - 1] = {
                ...lastItem,
                content: lastItem.content + " " + transcriptText
              }
              
              return newHistory
            });
            setTranscript((history) => (history += transcriptText));
          }
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket closed.");
      };

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
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
    setShowMic(false);
    await handleReponse(await prompt(transcript));
  };

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [chat]);

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
        <div
          className="flex justify-center items-center p-4"
          style={{ height: "10vh" }}
        >
          <button
            className="bg-primary p-4 rounded"
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>
      )}

      <div
        id="mic-activity"
        className="flex justify-center items-center"
        style={{ height: "15vh" }}
      >
        <p>Put Mic Div Here</p>
      </div>
    </div>
  );
}

export default Chat;
