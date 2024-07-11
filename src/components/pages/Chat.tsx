import { prompt } from "@/services/gemini/base";
import { InterviewBot } from "@/services/gemini/JobDParserBot";
import { fetchAudioBuffer } from "@/services/voice/TTS";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MessageData {
  channel?: {
    alternatives?: {
      transcript?: string;
    }[];
  };
}

interface ChatMessage {
  sender: "User" | "Gemini";
  content: string;
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
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

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
    setChat((history) => [...history, { sender: "Gemini", content: "\n" }]);

    for (const chunk of data) {
      setChat((history) => [
        ...history,
        { sender: "Gemini", content: chunk.word },
      ]);
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
      setChat((history) => [...history, { sender: "User", content: "\n" }]);

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
            setChat((history) => [
              ...history,
              { sender: "User", content: transcriptText },
            ]);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  function renderMessages(messages: ChatMessage[]) {
    const cards = [];
    let currentCardMessages: ChatMessage[] = [];
    let currentSender = "";

    messages.forEach((message, index) => {
      if (message.content === "\n") {
        if (currentCardMessages.length > 0) {
          cards.push(
            <Card
              className={
                currentSender === "User" ? "self-end w-3/4" : "self-start w-3/4"
              }
              key={cards.length}
              variant={currentSender === "User" ? "primary" : "default"}
            >
              <CardContent className="p-8">
                <p className="font-black">
                  {currentCardMessages.map((msg) => msg.content).join(" ")}
                </p>
              </CardContent>
            </Card>
          );
          currentCardMessages = [];
        }
      } else {
        if (currentCardMessages.length === 0) {
          currentSender = message.sender;
        }
        currentCardMessages.push(message);
      }
    });

    if (currentCardMessages.length > 0) {
      cards.push(
        <Card
          className={
            currentSender === "User" ? "self-end w-3/4" : "self-start w-3/4"
          }
          key={cards.length}
          variant={currentSender === "User" ? "primary" : "default"}
        >
          <CardContent className="p-8">
            <p className="font-black">
              {currentCardMessages.map((msg) => msg.content).join(" ")}
            </p>
          </CardContent>
        </Card>
      );
    }

    return cards;
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
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

      <h1 className="p-4 ">Chat</h1>
      <div
        className="relative h-screen flex flex-col space-y-4 overflow-y-auto"
        style={{ maxHeight: "55vh" }}
      >
        {renderMessages(chat)}
        <div ref={messagesEndRef} />
      </div>

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
