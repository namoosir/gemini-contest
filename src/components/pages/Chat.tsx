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
} from "../ui/alert-dialog";
import { useBeforeUnload, useBlocker } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

function Chat() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [amplitude, setAmplitude] = useState<number>(2.3);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [lastLocation, setLastLocation] = useState<null | string>(null);
  const [confirmedNavigation, setConfirmedNavigation] =
    useState<boolean>(false);
  const [hasInterviewStarted, setHasInterviewStarted] =
    useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isRecordingRef = useRef<boolean>(isRecording);
  const audioContextRef = useRef<AudioContext | undefined>();
  const micAudioContextRef = useRef<AudioContext | undefined>();
  const streamRef = useRef<MediaStream | undefined>();
  const sourceRef = useRef<MediaStreamAudioSourceNode | undefined>();
  const geminiRef = useRef<InterviewBot>(new InterviewBot());

  const navigate = useNavigate();
  const location = useLocation();

  const handleBlockedNavigation = async (_: any, nextLocation: any) => {
    console.log("OLA")
    if (!confirmedNavigation) {
      await pauseInterview();
      setIsDialogOpen(true);
      setLastLocation(nextLocation);
      return true;
    }
    console.log("OLA 2.0")
    return false;
  };

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    handleBlockedNavigation(currentLocation, nextLocation)
  );

  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      navigate(lastLocation);
    }
  }, [confirmedNavigation, lastLocation, navigate]);

  const confirmNavigation = () => {
    setIsDialogOpen(false);
    setConfirmedNavigation(true);

    if (blocker?.state === "blocked") {
      blocker.proceed();
    }
  };

  const cancelNavigation = () => {
    setIsDialogOpen(false);
    setConfirmedNavigation(false);

    if (blocker?.state === "blocked") {
      blocker.reset();
    }
  };

  useBeforeUnload((event: Event) => {
    if (!confirmedNavigation) {
      event.preventDefault();
      return "";
    }
  });

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
    const normalizedAmplitude = average / 128; // Assuming 128 is the maximum average value
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
      const apiKey = await getAPIKey();
      await initWebSocket(apiKey);
    }

    async function initWebSocket(apiKey?: string) {
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
    }

    void fetchKey();

    return () => {
      void cleanup();
    };
  }, []);

  useEffect(() => {
    isRecordingRef.current = isRecording;

    if (isRecording) {
      mediaRecorderRef.current?.resume();
      requestAnimationFrame(updateAmplitude);
    } else {
      mediaRecorderRef.current?.pause();
    }
  }, [isRecording, updateAmplitude]);

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
    await handleResponse(await geminiRef.current.prompt(transcript));
  };

  const handleAlertContinue = async () => {
    // await cleanup();
    confirmNavigation();
    console.log(blocker.state);
    if (blocker.state !== "blocked") {
      navigate("/");
    }
  };

  const handleAlertCancel = async () => {
    cancelNavigation();
    await resumeInterview();
    setIsDialogOpen(false);
  };

  const pauseInterview = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.pause();
      await micAudioContextRef.current?.suspend();
    } else {
      await audioContextRef.current?.suspend();
    }
  };

  const resumeInterview = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.resume();
      await micAudioContextRef.current?.resume();
    } else {
      await audioContextRef.current?.resume();
    }
  };

  const onXClicked = async () => {
    await pauseInterview();
    setIsDialogOpen(true);
  };

  const cleanup = async () => {
    setIsRecording(false);

    if (socketIntervalRef.current) {
      clearInterval(socketIntervalRef.current);
      socketIntervalRef.current = null;
    }

    if (socketRef.current?.readyState === 1) {
      const closeMessage = JSON.stringify({ type: "CloseStream" });
      socketRef.current.send(closeMessage);
    }

    socketRef.current?.close();
    socketRef.current = null;

    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;

    analyserRef.current?.disconnect();
    analyserRef.current = null;

    if (audioContextRef.current?.state !== "closed") {
      await audioContextRef.current?.close();
      audioContextRef.current = undefined;
    }

    if (micAudioContextRef.current?.state !== "closed") {
      await micAudioContextRef.current?.close();
      micAudioContextRef.current = undefined;
    }

    const tracks = streamRef.current?.getTracks();
    tracks?.forEach((track) => {
      track.stop();
    });
    streamRef.current = undefined;

    sourceRef.current?.disconnect();
    sourceRef.current = undefined;
  };

  const startInterview = async () => {
    setHasInterviewStarted(true);
    await handleResponse(
      await geminiRef.current.initInterviewForJobD(
        location.state.jobDescription
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {!hasInterviewStarted && (
        <div className="h-full flex flex-col items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Your Interview</CardTitle>
              <CardDescription>
                Your {location.state.interviewDuration} minute{" "}
                {location.state.interviewType} Interview is about to start in{" "}
                {location.state.interviewMode} mode
              </CardDescription>
            </CardHeader>
            <CardContent>{/* TODO: ADD A VIDEO PREVIEW OF THE  */}</CardContent>
            <CardFooter>
              <Button onClick={startInterview} className="w-full">
                Start Interview
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <div className="overflow-hidden flex-1">
        <Chats chats={chat} />
      </div>

      {hasInterviewStarted && (
        <div className="w-full bg-background flex flex-row items-center justify-center sticky bottom-0 m-auto">
          <Button
            variant={"secondary"}
            className="items-center self-center h-16 w-16 rounded-full hover:bg-destructive hover:text-destructive-foreground"
            onClick={onXClicked}
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
          >
            <Icon path={mdiClose} className="h-6 w-6" />
          </Button>
        </div>
      )}

      <AlertDialog open={isDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to quit this interview? None of your answers
              will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant={"secondary"} onClick={handleAlertCancel}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleAlertContinue}>
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
