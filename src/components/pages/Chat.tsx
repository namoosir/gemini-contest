import { InterviewBot } from "@/services/gemini/JobDParserBot";
import { ChatMessage, fetchAudio } from "@/services/voice/TTS";
import { useRef, useState, useEffect, useCallback } from "react";
import Chats from "../Chats";
import AnimatedMic from "../AnimatedMic";
import { Button } from "../ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { mdiClose, mdiLoading } from "@mdi/js";
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
import { useBlocker } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import useAuthContext from "@/hooks/useAuthContext";
import { getUserResumes, Resume } from "@/services/firebase/resumeService";
import {
  calculateAmplitudeFromAnalyser,
  FINAL_INTERVIEW_RESPONSE,
  formatTime,
} from "@/utils";
import { isInterviewProps, InterviewProps } from "./types";
import { ChatSession } from "firebase/vertexai-preview";
import useAudioStore from "@/hooks/useAudioStore";
import useDeepgram from "@/hooks/useDeepgram";
import useMicrophone from "@/hooks/useMicrophone";
import { useNowPlaying } from "react-nowplaying";
import { useQueue } from "@uidotdev/usehooks";
import {
  LiveClient,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";

function Chat() {
  const { connection, connectionReady } = useDeepgram();
  const { addAudio } = useAudioStore();
  const { player, play: startAudio, pause: pauseAudio } = useNowPlaying();
  const {
    microphoneOpen,
    queue: microphoneQueue,
    queueSize: microphoneQueueSize,
    firstBlob,
    removeBlob,
    stream,
    startMicrophone,
    stopMicrophone,
    analyser,
  } = useMicrophone();
  const { db } = useFirebaseContext();
  const { user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    add: addTranscriptPart,
    queue: transcriptParts,
    clear: clearTranscriptParts,
  } = useQueue<{ is_final: boolean; speech_final: boolean; text: string }>([]);

  const [initialLoad, setInitialLoad] = useState(true);
  const [isProcessing, setProcessing] = useState(false);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [amplitude, setAmplitude] = useState<number>(2.3);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [resume, setResume] = useState<Resume | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [confirmedNavigation, setConfirmedNavigation] =
    useState<boolean>(false);
  const [hasInterviewStarted, setHasInterviewStarted] =
    useState<boolean>(false);
  const [seconds, setSeconds] = useState(0);
  const [interviewEnded, setInterviewEnded] = useState<boolean>(false);
  const [isDoneDialogOpen, setIsDoneDialogOpen] = useState<boolean>(false);

  const geminiRef = useRef<InterviewBot>(new InterviewBot());
  const locationStateRef = useRef<InterviewProps | undefined>();

  const utteranceText = (event: LiveTranscriptionEvent) => {
    const words = event.channel.alternatives[0].words;
    return words
      .map((word: any) => word.punctuated_word ?? word.word)
      .join(" ");
  };

  useEffect(() => {
    if (isInterviewProps(location.state)) {
      locationStateRef.current = location.state;
    } else {
      // navigate out
      navigate("/404");
    }
  }, [location, navigate]);

  const handleBlockedNavigation = () => {
    if (!confirmedNavigation) {
      setIsDialogOpen(true);
      return true;
    }
    return false;
  };

  const blocker = useBlocker(() => handleBlockedNavigation());

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

  const updateAmplitude = useCallback(() => {
    if (!analyser) return;

    const newAmplitude = calculateAmplitudeFromAnalyser(analyser);
    const smoothingFactor = 0.1;

    setAmplitude((prevAmplitude) => {
      const smoothedAmplitude =
        prevAmplitude + smoothingFactor * (newAmplitude - prevAmplitude);
      return Math.max(Math.min(smoothedAmplitude, 3.8), 2.3);
    });

    if (microphoneOpen) {
      requestAnimationFrame(updateAmplitude);
    }
  }, [microphoneOpen, analyser]);

  useEffect(() => {
    const fetchResume = async () => {
      if (!user) return;
      const resumes = await getUserResumes(db, user.uid);

      if (!resumes || resumes.length === 0) return;

      return setResume(resumes[0]);
    };

    void fetchResume();
  }, [user, db]);

  useEffect(() => {
    if (resume) {
      setIsLoading(false);
    }
  }, [resume]);

  useEffect(() => {
    if (seconds > 0) {
      const interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [seconds]);

  useEffect(() => {
    if (!interviewEnded) return;

    setIsDoneDialogOpen(true);
    setConfirmedNavigation(true);
  }, [interviewEnded]);

  const startRecording = useCallback(() => {
    startMicrophone();

    setChat((history) => [...history, { sender: "user", content: "" }]);

    updateAmplitude();
  }, [startMicrophone, updateAmplitude]);

  const [currentUtterance, setCurrentUtterance] = useState<string>();

  const requestTtsAudio = useCallback(
    async (message: string) => {
      const blob = await fetchAudio(message);
      await startAudio(blob, "audio/mp3", message).then(() => {
        addAudio({
          id: "asd",
          blob,
        });
      });
    },
    [addAudio, startAudio]
  );

  const stopRecording = useCallback(async () => {
    if (!microphoneOpen) return;

    stopMicrophone();

    clearTranscriptParts();
    setCurrentUtterance(undefined);

    const geminiResponse = await geminiRef.current.prompt(
      chat[chat.length - 1].content
    );

    setChat((history) => [
      ...history,
      { content: geminiResponse, sender: "gemini" },
    ]);

    await requestTtsAudio(geminiResponse);

    if (player) player.onended = () => startRecording();
    else console.log("wtf");
  }, [
    requestTtsAudio,
    chat,
    clearTranscriptParts,
    microphoneOpen,
    player,
    startRecording,
    stopMicrophone,
  ]);

  const handleAlertContinue = () => {
    confirmNavigation();
  };

  const handleAlertCancel = () => {
    cancelNavigation();

    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (isDialogOpen) {
      pauseAudio && pauseAudio();
      void stopRecording();
    }
  }, [isDialogOpen, pauseAudio, stopRecording]);

  const onXClicked = () => {
    setIsDialogOpen(true);
  };

  const startInterview = useCallback(async () => {
    if (!initialLoad) return;

    setInitialLoad(false);
    setHasInterviewStarted(true);
    setSeconds(Number(locationStateRef.current!.interviewDuration) * 60);

    const greetingMessage = await geminiRef.current.initInterviewForJobD(
      locationStateRef.current!.jobDescription ?? "No job description provided",
      locationStateRef.current!.interviewType,
      resume?.data ?? "No resume provided"
    );

    setChat((history) => [
      ...history,
      { content: greetingMessage, sender: "gemini" },
    ]);
    await requestTtsAudio(greetingMessage);

    if (player) player.onended = () => startRecording();
  }, [player, requestTtsAudio, resume?.data, initialLoad, startRecording]);

  useEffect(() => {
    const onTranscript = (data: LiveTranscriptionEvent) => {
      const content = utteranceText(data);

      // i only want an empty transcript part if it is speech_final
      if (content !== "" || data.speech_final) {
        /**
         * use an outbound message queue to build up the unsent utterance
         */
        addTranscriptPart({
          is_final: data.is_final!,
          speech_final: data.speech_final!,
          text: content,
        });
      }
    };
    const onOpen = (connection: LiveClient) => {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
    };

    if (connection) {
      connection.addListener(LiveTranscriptionEvents.Open, onOpen);
    }

    return () => {
      connection?.removeListener(LiveTranscriptionEvents.Open, onOpen);
      connection?.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript
      );
    };
  }, [addTranscriptPart, connection]);

  const getCurrentUtterance = useCallback(() => {
    return transcriptParts.filter(({ is_final, speech_final }, i, arr) => {
      return is_final || speech_final || (!is_final && i === arr.length - 1);
    });
  }, [transcriptParts]);

  useEffect(() => {
    const parts = getCurrentUtterance();
    const content = parts
      .map(({ text }) => text)
      .join(" ")
      .trim();

    if (!content) return;

    setCurrentUtterance(content);
  }, [getCurrentUtterance, clearTranscriptParts]);

  useEffect(() => {
    if (!currentUtterance) return;

    setChat((history) => {
      const newHistory = [...history];
      const lastItem = newHistory[newHistory.length - 1];

      newHistory[newHistory.length - 1] = {
        ...lastItem,
        content: currentUtterance,
      };

      return newHistory;
    });
  }, [currentUtterance]);

  useEffect(() => {
    const processQueue = () => {
      if (microphoneQueueSize > 0 && !isProcessing) {
        setProcessing(true);

        if (connectionReady) {
          const nextBlob = firstBlob;

          if (nextBlob && nextBlob?.size > 0) {
            connection?.send(nextBlob);
          }

          removeBlob();
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting);
          setProcessing(false);
        }, 200);
      }
    };

    processQueue();
  }, [
    connection,
    microphoneQueue,
    removeBlob,
    firstBlob,
    microphoneQueueSize,
    isProcessing,
    connectionReady,
  ]);

  const loader = (
    <div className="flex h-full w-full justify-center items-center gap-8 flex-col text-2xl leading-none tracking-tight">
      <h1>Please wait while we set up your interview</h1>
      <Icon className="h-12 w-12 animate-spin" path={mdiLoading} />
    </div>
  );

  const handleResultsClick = async () => {
    const chat = geminiRef.current.chat as ChatSession;
    const history = await chat.getHistory();

    navigate("/results", { state: { history } });
  };

  return (
    <div className="flex flex-col h-full">
      {isLoading && loader}
      <p>{formatTime(seconds)} seconds remaining</p>
      {!isLoading && !hasInterviewStarted && (
        <div className="h-full flex flex-col items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Your Interview</CardTitle>
              <CardDescription>
                Your {locationStateRef.current!.interviewDuration} minute{" "}
                {locationStateRef.current!.interviewType} Interview is about to
                start in {locationStateRef.current!.interviewMode} mode
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
            asChild
          >
            <Link to="/">
              <Icon path={mdiClose} className="h-6 w-6" />
            </Link>
          </Button>

          <div className="w-40 h-40 flex items-center justify-center">
            <AnimatedMic
              isRecording={microphoneOpen}
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

      <AlertDialog open={isDoneDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your interview is done!</AlertDialogTitle>
            <AlertDialogDescription>
              Proceed to view your results or go back home.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="secondary" asChild>
                <Link to="/">Home</Link>
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="default" onClick={handleResultsClick}>
                Results
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Chat;
