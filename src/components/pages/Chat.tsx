import { prompt } from "@/services/gemini/base";
import { InterviewBot } from "@/services/gemini/JobDParserBot";
import { ChatMessage, fetchAudioBuffer, getAPIKey, initVoiceWebSocket, initMediaRecorder, playbackGeminiResponse } from "@/services/voice/TTS";
import { useRef, useState, useEffect } from "react";
import Chats from "../Chats";

function Chat() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [showMic, setShowMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [apiKey, setApiKey] = useState<string | undefined>()
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const socketIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const gemini = new InterviewBot();

  useEffect(() => {
    async function fetchKey() {
      setApiKey(await getAPIKey())
    }

    void fetchKey()
  }, []);

  useEffect(() => {
    if (!apiKey)
      return

    const initWebSocket = async () => {
      socketRef.current = await initVoiceWebSocket(apiKey, socketIntervalRef.current, setTranscript, setChat);
      mediaRecorderRef.current = await initMediaRecorder(socketRef.current);
    }

    void initWebSocket()
  }, [apiKey])

  useEffect(() => {
    if (isRecording) {
      mediaRecorderRef.current?.resume();
    } else {
      mediaRecorderRef.current?.pause();
    }
  }, [isRecording])

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
    await playbackGeminiResponse(data, setChat, audioCtx);
    await audioCtx.close();
    startRecording();
  }

  const startRecording = () => {
    try {
      setShowMic(true);
      setTranscript("");
      setChat((history) => [...history, { sender: "user", content: "" }]);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setShowMic(false);
    await handleResponse(await prompt(transcript));
  };

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
