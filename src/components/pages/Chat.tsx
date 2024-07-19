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
import AnimatedMic from "../AnimatedMic";
import { Button } from "../ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alertDialog";

function Chat() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  // const [jobDescription, setJobDescription] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [apiKey, setApiKey] = useState<string | undefined>();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [amplitude, setAmplitude] = useState<number>(2.3);
  const [hasInterviewEnded, setHasInterviewEnded] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isRecordingRef = useRef<boolean>(isRecording);
  const audioContextRef = useRef<AudioContext | undefined>();
  const micAudioContextRef = useRef<AudioContext | undefined>();
  const streamRef = useRef<MediaStream | undefined>();
  const sourceRef = useRef<MediaStreamAudioSourceNode | undefined>();

  const navigate = useNavigate();
  const location = useLocation();
  const renderRef = useRef<boolean>(false);

  const gemini = new InterviewBot();

  const updateAmplitude = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;

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

    const smoothingFactor = 0.1;
    setAmplitude((prevAmplitude) => {
      const smoothedAmplitude =
        prevAmplitude + smoothingFactor * (scaledAmplitude - prevAmplitude);
      return Math.max(Math.min(smoothedAmplitude, 3.8), 2.3);
    });

    if (isRecordingRef.current) {
      requestAnimationFrame(updateAmplitude);
    }
  }, []);

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
        socketIntervalRef,
        setTranscript,
        setChat
      );

      const { mediaRecorder, stream: mediaStream } = await initMediaRecorder(
        socketRef.current
      );

      mediaRecorderRef.current = mediaRecorder;

      const audioContext = new AudioContext();

      micAudioContextRef.current = audioContext;

      streamRef.current = mediaStream;

      const analyser = audioContext.createAnalyser();
      sourceRef.current = audioContext.createMediaStreamSource(mediaStream);
      sourceRef.current.connect(analyser);

      analyserRef.current = analyser;

      if (renderRef.current) {
        await handleResponse(
          await gemini.initInterviewForJobD(location.state.jobDescription)
        );
      }
      renderRef.current = true;
    };

    void initWebSocket();
    return () => stopListening();
  }, [apiKey]);

  useEffect(() => {
    isRecordingRef.current = isRecording;

    if (isRecording) {
      mediaRecorderRef.current?.resume();
      requestAnimationFrame(updateAmplitude);
    } else {
      mediaRecorderRef.current?.pause();
    }
  }, [isRecording, updateAmplitude]);

  // async function jobSubmitHandler(event: React.FormEvent<HTMLFormElement>) {
  //   event.preventDefault();
  //   if (jobDescription === "") {
  //     alert("Provide job desc");
  //     return;
  //   }
  // }

  async function handleResponse(text: string) {
    const data = await fetchAudioBuffer(text);
    const audioCtx = new AudioContext();

    audioContextRef.current = audioCtx;

    setChat((history) => [...history, { sender: "gemini", content: "" }]);
    await playbackGeminiResponse(data, setChat, audioContextRef.current);
    await audioContextRef.current.close();
    startRecording();
  }

  const startRecording = () => {
    try {
      setTranscript("");
      setChat((history) => [...history, { sender: "user", content: "" }]);
      setIsRecording(true);
      updateAmplitude();
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await handleResponse(await prompt(transcript));
  };

  const stopListening = async () => {
    setIsRecording(false);

    if (socketIntervalRef.current) {
      clearInterval(socketIntervalRef.current);
      socketIntervalRef.current = null;
    }

    if (socketRef.current) {
      if (socketRef.current.readyState === 1) {
        const closeMessage = JSON.stringify({ type: "CloseStream" });
        socketRef.current.send(closeMessage);
      }

      socketRef.current.close();
      socketRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      console.log(audioContextRef.current.state);
      audioContextRef.current = undefined;
    }

    if (micAudioContextRef.current) {
      micAudioContextRef.current.close();
      console.log(micAudioContextRef.current.state);
      micAudioContextRef.current = undefined;
    }

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      streamRef.current = undefined;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = undefined;
    }

    if (renderRef.current) {
      setHasInterviewEnded(true);
    }
    // navigate("/interview");
  };

  const handleAlertContinue = () => {
    navigate("/interview");
  };

  const handleAlertCancel = () => {
    setHasInterviewEnded(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* <form onSubmit={jobSubmitHandler} className="p-4">
        <label>
          Provide the Job description to Start the interview process:
          <textarea
            style={{ color: "black" }}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </label>
        <button type="submit">Submit</button>
      </form> */}

      <div className="overflow-hidden flex-1">
        <Chats chats={chat} />
      </div>

      <div className="w-full bg-background flex flex-row items-center justify-center sticky bottom-0 m-auto">
        <Button
          variant={"secondary"}
          className="items-center self-center h-16 w-16 rounded-full hover:bg-destructive hover:text-destructive-foreground"
          onClick={stopListening}
        >
          <Icon path={mdiClose} className="h-6 w-6" />
        </Button>

        <div className="w-40 h-40 flex items-center justify-center">
          <AnimatedMic
            isRecording={isRecording}
            amplitude={amplitude}
            stopRecording={stopRecording}
          />
        </div>

        <Button
          variant={"destructive"}
          className="items-center self-center h-16 w-16 rounded-full invisible"
          onClick={stopListening}
        >
          <Icon path={mdiClose} className="h-6 w-6" />
        </Button>
      </div>
      <AlertDialog
        open={hasInterviewEnded}
        onOpenChange={() => setHasInterviewEnded(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant={"destructive"} onClick={handleAlertCancel}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant={"default"} onClick={handleAlertContinue}>
                Continue
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Chat;
