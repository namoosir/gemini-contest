import { prompt } from "@/services/gemini/base";
import { InterviewBot } from "@/services/gemini/JobDParserBot";
import { fetchAudioBuffer } from "@/services/voice/TTS";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@mdi/react";
import { mdiLogout, mdiMicrophone, mdiMicrophoneOff } from "@mdi/js";

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
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [amplitude, setAmplitude] = useState<number>(0);

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

      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

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
      requestAnimationFrame(updateAmplitude);
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
    setAmplitude(0);
    await handleReponse(await prompt(transcript));
  };

  // const updateAmplitude = () => {
  //   const analyser = analyserRef.current;

  //   if (!analyser) {
  //     return;
  //   }

  //   analyser.fftSize = 2048;
  //   const bufferLength = analyser.frequencyBinCount;
  //   const dataArray = new Uint8Array(bufferLength);
  //   analyser.getByteTimeDomainData(dataArray);

  //   let sum = 0;
  //   for (let i = 0; i < bufferLength; i++) {
  //     sum += Math.abs(dataArray[i] - 125);
  //   }
  //   const average = sum / bufferLength;

  //   const normalizedAmplitude = average / 128; // Assuming 128 is the maximum average value

  //   // Scale the normalized amplitude to a range between 0 and 5
  //   const scaledAmplitude = 5 + normalizedAmplitude * 8; // 5 + (0-1) * (13 - 5)

  //   const boundedAmplitude = Math.min(scaledAmplitude, 5);
  //   const boundedAmplitude2 = Math.max(boundedAmplitude, 0);

  //   setAmplitude(boundedAmplitude2);
  //   requestAnimationFrame(updateAmplitude);

  //   // // const amplifiedAmplitude = average * 5;

  //   // setAmplitude(sum);
  //   // requestAnimationFrame(updateAmplitude);
  // };

  const updateAmplitude = () => {
    const analyser = analyserRef.current;

    if (!analyser) {
      return;
    }

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
    requestAnimationFrame(updateAmplitude);
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

  useEffect(() => {
    if (isRecording) {
      requestAnimationFrame(updateAmplitude);
    }
  }, [isRecording]);

  return (
  <div className="flex flex-col h-[80vh]">
    <form onSubmit={jobSubmitHandler} className="p-4 max-h-[15vh] flex-shrink-0">
      <label>
        Provide the Job description to Start the interview process:
        <textarea
          className="block mb-2 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </label>
      <Button variant="outline" type="submit">
        Submit
      </Button>
    </form>

    <h1 className="p-4 flex-shrink-0">Chat</h1>
    <div className="relative flex-grow flex flex-col space-y-4 overflow-y-auto max-h-[45vh]">
      {renderMessages(chat)}
      <div ref={messagesEndRef} />
    </div>

    {showMic && (
      <div className="flex justify-center items-center p-4 max-h-[10vh] flex-shrink-0">
        <button
          className="bg-primary p-4 rounded"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>
    )}

    <div className="flex justify-center items-center flex-shrink-0">
      <div
        id="mic-wrapper"
        className="bg-secondary rounded-2xl w-[10rem] min-h-[4rem] flex justify-center items-center"
      >
        <div
          id="mic-activity"
          className="h-[4rem] flex items-center justify-center"
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
      </div>
    </div>
  </div>
);

}

export default Chat;
