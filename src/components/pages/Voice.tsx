import { User, signOut } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import Icon from "@mdi/react";
import { mdiLogout } from "@mdi/js";
import { Card } from "../ui/card";
import SiriWave from "react-siriwave";

function Voice() {
  const { auth } = useFirebaseContext();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [transcript, setTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [amplitude, setAmplitude] = useState<number>(0);

  useEffect(() => {
    const signin = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(undefined);
      }
    });
    return () => signin();
  }, [auth]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const startRecording = async () => {
    try {
      setTranscript("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;

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
        const received = JSON.parse(message.data);
        const transcriptText = received.channel.alternatives[0].transcript;

        setTranscript(
          (prevTranscript) => prevTranscript + " " + transcriptText
        );
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket closed.");
      };

      setIsRecording(true);

      updateAmplitude();
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
    setAmplitude(0);
  };

  const updateAmplitude = () => {
    const analyser = analyserRef.current;

    if (!analyser) {
      return;
    } else {
      analyser.fftSize = 2048;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += Math.abs(dataArray[i] - 125);
    }
    const average = sum / bufferLength;

    const amplifiedAmplitude = average * 5;

    setAmplitude(amplifiedAmplitude);
    requestAnimationFrame(updateAmplitude);
  };

  return (
    <>
      <div className="voice">
        {user && (
          <>
            <div className="flex items-center justify-center min-h-screen bg-black">
              <div>
                <Card className="p-8 rounded shadow-lg bg-cardbackground flex flex-col items-center max-w-4xl">
                  <h1 className="my-8 text-4xl font-bold">Voice-To-Text</h1>
                  <button
                    className="bg-primary p-4 rounded my-2"
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </button>
                  <div>
                    {isRecording ? (
                      <div className="ml-1">
                        <SiriWave
                          amplitude={amplitude}
                          theme="ios9"
                          speed={0.02}
                          pixelDepth={0.1}
                          max-width={5}
                        />
                      </div>
                    ) : (
                      <div className="ml-1">
                        <SiriWave
                          amplitude={0}
                          theme="ios9"
                          speed={0.02}
                          pixelDepth={0.5}
                          max-width={5}
                        />
                      </div>
                    )}
                  </div>

                  <div className="my-2 w-full flex items-center justify-center">
                    <form className="bg-secondary p-4 rounded my-2 w-full max-w-md max-h-36 overflow-y-auto">
                      <label htmlFor="transcript">{transcript}</label>
                    </form>
                  </div>
                  <button
                    className="bg-primary p-4 rounded my-2 flex items-center"
                    onClick={handleSignOut}
                    title="Sign Out"
                  >
                    Sign Out
                    <Icon className="w-8 ml-1" path={mdiLogout} />
                  </button>
                </Card>
              </div>
            </div>
          </>
        )}
        {!user && (
          <p>Unsuccessful Login Attempt, but you somehow made it through...</p>
        )}
      </div>
    </>
  );
}

export default Voice;
