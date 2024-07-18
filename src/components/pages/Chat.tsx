import { prompt } from "@/services/gemini/base";
import { InterviewBot } from "@/services/gemini/JobDParserBot";
import {
  ChatMessage,
  fetchAudioBuffer,
  getAPIKey,
  initVoiceWebSocket,
  initMediaRecorder,
  playbackGeminiResponse,
} from "@/services/voice/TTS";
import { useRef, useState, useEffect, useCallback } from "react";
import Chats from "../Chats";
import { mdiMicrophone, mdiMicrophoneOff } from "@mdi/js";
import { Icon } from "@mdi/react";

function Chat() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [showMic, setShowMic] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [apiKey, setApiKey] = useState<string | undefined>();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [amplitude, setAmplitude] = useState<number>(0);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const gemini = new InterviewBot();

  const updateAmplitude = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += Math.abs(dataArray[i] - 125);
    }
    const average = sum / bufferLength;

    // Normalize the amplitude to a range between 0 and 1
    const normalizedAmplitude = average / 128; // Assuming 128 is the maximum average value

    // Scale the normalized amplitude to a range between 5 and 13
    const scaledAmplitude = 1.5 + normalizedAmplitude * 35; // 5 + (0-1) * (13 - 5)

    console.log("Scaled Amplitude:", scaledAmplitude); // Log to verify values

    const boundedAmplitude = Math.min(scaledAmplitude, 3.8);
    setAmplitude(boundedAmplitude);

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAmplitude);
    }
  };

  useEffect(() => {
    async function fetchKey() {
      setApiKey(await getAPIKey());
    }

    void fetchKey();
  }, []);

  useEffect(() => {
    if (!apiKey) return;

    const initWebSocket = async () => {
      socketRef.current = await initVoiceWebSocket(
        apiKey,
        socketIntervalRef.current,
        setTranscript,
        setChat
      );

      const { mediaRecorder, stream: mediaStream } = await initMediaRecorder(
        socketRef.current
      );

      mediaRecorderRef.current = mediaRecorder;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      analyserRef.current = analyser;
    };

    void initWebSocket();
  }, [apiKey]);

  useEffect(() => {
    if (isRecording) {
      mediaRecorderRef.current?.resume();
      animationFrameRef.current = requestAnimationFrame(updateAmplitude);
    } else {
      mediaRecorderRef.current?.pause();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isRecording, updateAmplitude]);

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
      updateAmplitude()
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
        <div
          id="mic-activity"
          className="h-[4rem] flex items-center justify-center"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {showMic ? (
            <div
              id="ampCircle"
              className="rounded-full bg-primary flex items-center justify-center"
              style={{
                width: `${amplitude}rem`,
                height: `${amplitude}rem`,
              }}
            >
              <Icon className="w-7 h-7" path={mdiMicrophone} />
            </div>
          ) : (
            <div
              id="ampCircle"
              className="rounded-full bg-primary w-[2.5rem] h-[2.5rem] flex items-center justify-center"
            >
              <Icon className="w-7 h-7" path={mdiMicrophoneOff} />
            </div>
          )}
        </div>
      )}
      {/* <Button onClick={() => clearInterval(socketInterval)}>stop</Button> */}
    </div>
  );
}

export default Chat;
