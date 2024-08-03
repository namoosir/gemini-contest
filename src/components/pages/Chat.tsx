import { InterviewBot } from "@/services/gemini/JobDParserBot";
import {
  ChatMessage,
  getAPIKey,
  initVoiceWebSocket,
  initMediaRecorder,
  playbackGeminiResponse,
  fetchAudio,
} from "@/services/voice/TTS";
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
import {
  addInterview,
  Interview,
  Score,
} from "@/services/firebase/interviewService";

import useFirebaseContext from "@/hooks/useFirebaseContext";
import useAuthContext from "@/hooks/useAuthContext";
import { getUserResumes, Resume } from "@/services/firebase/resumeService";
import {
  calculateAmplitudeFromAnalyser,
  FINAL_INTERVIEW_RESPONSE,
  formatTime,
} from "@/utils";
import { isInterviewProps, InterviewProps } from "./types";
import { ChatSession, Part } from "firebase/vertexai-preview";
import { Badge } from "@/components/ui/badge";
import Scene from "../3D/scene";
import UnfocusedInterviewDemo from "@/assets/media/UnfocusedInterviewDemo.gif";
import FocusedInterviewDemo from "@/assets/media/FocusedInterviewDemo.gif";
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Loader2 } from "lucide-react"

function Chat() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [amplitude, setAmplitude] = useState<number>(2.3);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [resume, setResume] = useState<Resume | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSocketSetupLoading, setIsSocketSetupLoading] =
    useState<boolean>(true);
  const [confirmedNavigation, setConfirmedNavigation] =
    useState<boolean>(false);
  const [hasInterviewStarted, setHasInterviewStarted] =
    useState<boolean>(false);
  const [seconds, setSeconds] = useState(0);
  const [interviewEnded, setInterviewEnded] = useState<boolean>(false);
  const [isDoneDialogOpen, setIsDoneDialogOpen] = useState<boolean>(false);
  const [geminiAnalyser, setGeminiAnalyser] = useState<AnalyserNode>()
  const [geminiAudioContext, setGeminiAudioContext] = useState<AudioContext>()
  const [resultsLoading, setResultsLoading] = useState<boolean>(true)

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
  const locationStateRef = useRef<InterviewProps | undefined>();
  const interviewResultRef = useRef<Interview>();

  const { db } = useFirebaseContext();
  const { user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInterviewProps(location.state)) {
      locationStateRef.current = location.state;
    } else {
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
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;

    const newAmplitude = calculateAmplitudeFromAnalyser(analyser);
    const smoothingFactor = 0.1;

    setAmplitude((prevAmplitude) => {
      const smoothedAmplitude =
        prevAmplitude + smoothingFactor * (newAmplitude - prevAmplitude);
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
      setIsSocketSetupLoading(false);
    }

    async function initWebSocket(apiKey?: string) {
      socketRef.current = initVoiceWebSocket(
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
    const fetchResume = async () => {
      if (!user) return;
      const resumes = await getUserResumes(db, user.uid);

      if (!resumes || resumes.length === 0) return;

      return setResume(resumes[0]);
    };

    void fetchResume();
  }, [user, db]);

  useEffect(() => {
    if (resume && !isSocketSetupLoading) {
      setIsLoading(false);
    }
  }, [resume, isSocketSetupLoading]);

  useEffect(() => {
    isRecordingRef.current = isRecording;

    if (isRecording) {
      mediaRecorderRef.current?.resume();
      requestAnimationFrame(updateAmplitude);
    } else {
      mediaRecorderRef.current?.pause();
    }
  }, [isRecording, updateAmplitude]);

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

  async function handleResponse(text: string, done?: boolean) {
    const buffer = await fetchAudio(text);
    const audioCtx = new AudioContext();

    audioContextRef.current = audioCtx;

    setChat((history) => [...history, { sender: "gemini", content: "" }]);

    const { source, analyser } = await playbackGeminiResponse(
      { word: text, buffer: await buffer.arrayBuffer() },
      setChat,
      audioContextRef.current
    );

    setGeminiAudioContext(audioCtx)
    setGeminiAnalyser(analyser)

    await new Promise<void>((resolve) => {
      source.onended = () => {
        resolve()
      }
    })

    await audioContextRef.current.close();

    if (!done) startRecording();
  };

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
    if (seconds === 0) {
      await geminiRef.current.handleInterviewFinish(transcript);
      await handleResponse(FINAL_INTERVIEW_RESPONSE, true);

      setInterviewEnded(true);
      await geminiRef.current.evaluateInterview();
      await handleAddChat();
      setResultsLoading(false);
    } else {
      await handleResponse(await geminiRef.current.prompt(transcript));
    }
  };

  const handleAlertContinue = () => {
    confirmNavigation();
  };

  const handleAlertCancel = async () => {
    cancelNavigation();
    await resumeInterview();
    setIsDialogOpen(false);
  };

  const pauseInterview = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.pause();
      await micAudioContextRef.current?.suspend();
    } else {
      await audioContextRef.current?.suspend();
    }
  }, [isRecording]);

  useEffect(() => {
    if (isDialogOpen) {
      void pauseInterview();
    }
  }, [isDialogOpen, pauseInterview]);

  const resumeInterview = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.resume();
      await micAudioContextRef.current?.resume();
    } else {
      await audioContextRef.current?.resume();
    }
  };

  const onXClicked = () => {
    setIsDialogOpen(true);
  };

  const evaluateScore = (feedback: { score: Score, text: string }[]): Score => {
    const initialResult: Score = {
      technicalScore: 0,
      behavioralScore: 0,
      jobFitScore: 0,
      overallScore: 0,
    };
  
    if (feedback.length === 0) return initialResult;
  
    const totalScores = feedback.reduce((acc, fb) => {
      acc.technicalScore += fb.score.technicalScore;
      acc.behavioralScore += fb.score.behavioralScore;
      acc.jobFitScore += fb.score.jobFitScore;
      acc.overallScore += fb.score.overallScore;
      return acc;
    }, initialResult);

    const result: Score = {
      technicalScore: totalScores.technicalScore / feedback.length,
      behavioralScore: totalScores.behavioralScore / feedback.length,
      jobFitScore: totalScores.jobFitScore / feedback.length,
      overallScore: totalScores.overallScore / feedback.length,
    };
  
    return result;
  };

  const processFeedback = (text: string): { score: Score, text: string }[] => {
    const result: { score: Score, text: string }[] = [];
  
    const scoreRegex = /(\d+)\/100/g;
    const feedbackRegex = /\*\*Question \d+:\*\* "([^"]+)"|\*\*Overall Interview Performance:\*\*/g;
    const scores = [];
    let match;
  
    while ((match = scoreRegex.exec(text)) !== null) {
      scores.push(parseInt(match[1], 10));
    }
  
    const feedbackTexts: string[] = [];
    while ((match = feedbackRegex.exec(text)) !== null) {
      feedbackTexts.push(match[1] || "Overall Interview Performance");
    }
  
    const numScoresPerFeedback = 4;
  
    for (let i = 0; i < feedbackTexts.length; i++) {
      const feedback = {
        score: {
          technicalScore: scores[i * numScoresPerFeedback],
          behavioralScore: scores[i * numScoresPerFeedback + 1],
          jobFitScore: scores[i * numScoresPerFeedback + 2],
          overallScore: scores[i * numScoresPerFeedback + 3],
        },
        text: feedbackTexts[i],
      };
  
      result.push(feedback);
    }
  
    return result;
  };

  const getRecommendation = (text: string): string => {
    const recommendationRegex = /\*\*Recommendation:\*\* ([^]*)$/;
    const match = recommendationRegex.exec(text);
    return match ? match[1].trim() : '';
  };

  //TODO: In Chat.tsx Line 267-275, make sure you update the right score

  const prepareData = async () => {
    if (user) {
      const chatSession = geminiRef.current.chat as ChatSession;
      const history = await chatSession.getHistory();
      const feedback = history[history.length - 1].parts.map((f) => f.text).join(' ')
      const processedFeedback = processFeedback(feedback)
      const recommendation = getRecommendation(feedback)
      const overallScore = evaluateScore(processedFeedback)

      const interviewData: Interview = {
        uid: user.uid,
        chat: chat,
        feedback: processedFeedback,
        recommendation,
        overallScore,
        dateCreated: Date.now().toString(),
      };

      return interviewData;
    } else {
      console.error("User is not authenticated");
    }
  };

  const handleAddChat = async () => {
    const data = await prepareData();
    console.log("This is the data", data);

    if (!data) {
      console.error("Data is not set");
      return;
    }

    interviewResultRef.current = data;
    
    try {
      const result = await addInterview(db, data);
      if (result) {
        console.log("Interview history added successfully");
      } else {
        console.error("Failed to add interview history");
      }
    } catch (error) {
      console.error("Error adding interview history:", error);
    }
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

    console.log("This interview has concluded. Here is your chat history: ");
    console.log(chat);
  };

  const startInterview = async () => {
    setHasInterviewStarted(true);
    // setSeconds(Number(locationStateRef.current!.interviewDuration) * 60);
    setSeconds(30)
    await handleResponse(
      await geminiRef.current.initInterviewForJobD(
        locationStateRef.current!.jobDescription ??
        "No job description provided",
        locationStateRef.current!.interviewType,
        resume?.data ?? "No resume provided"
      )
    );
  };

  const loader = (
    <div className="flex h-full w-full justify-center items-center gap-8 flex-col text-2xl leading-none tracking-tight">
      <h1>Please wait while we set up your interview</h1>
      <Icon className="h-12 w-12 animate-spin" path={mdiLoading} />
    </div>
  );

  const handleResultsClick = async () => {
    navigate("/results", { state: { result: interviewResultRef.current } });
  };

  return (
    <div className="flex flex-col h-full">
      {isLoading && loader}
      {hasInterviewStarted && (
        <div className="mt-10 text-center">
          <Badge className=" text-md cursor-default font-bold">
            {formatTime(seconds)}
          </Badge>
        </div>
      )}
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
            <CardContent>
              <div className="w-full">
                <AspectRatio ratio={16 / 9}>
                  {locationStateRef.current?.interviewMode === 'normal' ?
                    <img src={FocusedInterviewDemo} alt="Image" className="rounded-md object-cover" />
                    :
                    <img src={UnfocusedInterviewDemo} alt="Image" className="rounded-md object-cover" />
                  }
                </AspectRatio>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={startInterview} className="w-full">
                Start Interview
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {locationStateRef.current?.interviewMode === 'normal' ?
        <div className="overflow-hidden flex-1">
          <Chats chats={chat} scroll />
        </div>
        :
        <div className="overflow-hidden flex-1">
          <Scene audioContext={geminiAudioContext} analyser={geminiAnalyser} />
        </div>
      }


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

      <AlertDialog open={isDoneDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your interview is done!</AlertDialogTitle>
            <AlertDialogDescription>
              {
                resultsLoading ? 
                'Please wait while we calculate your results.'
                  : 
                'Proceed to view your results or go back home.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          {
            resultsLoading ? 
            <AlertDialogFooter>
              <Loader2 className="h-8 w-8 animate-spin" />
            </AlertDialogFooter>
              :
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button disabled={resultsLoading} variant="secondary" asChild>
                  <Link to="/">Home</Link>
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button disabled={resultsLoading} variant="default" onClick={handleResultsClick}>
                  Results
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          }
          
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Chat;
