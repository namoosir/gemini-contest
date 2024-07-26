import { useQueue } from "@uidotdev/usehooks";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

interface MicrophoneContext {
  microphone: MediaRecorder | undefined;
  setMicrophone: Dispatch<SetStateAction<MediaRecorder | undefined>>;
  startMicrophone: () => void;
  stopMicrophone: () => void;
  microphoneOpen: boolean;
  enqueueBlob: (element: Blob) => void;
  removeBlob: () => Blob | undefined;
  firstBlob: Blob | undefined;
  queueSize: number;
  queue: Blob[];
  stream: MediaStream | undefined;
  analyser: AnalyserNode | undefined;
}

interface MicrophoneContextInterface {
  children: React.ReactNode;
}

export const MicrophoneContext = createContext({} as MicrophoneContext);

const MicrophoneContextProvider = ({
  children,
}: MicrophoneContextInterface) => {
  const [microphone, setMicrophone] = useState<MediaRecorder>();
  const [stream, setStream] = useState<MediaStream>();
  const [microphoneOpen, setMicrophoneOpen] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode>();

  const {
    add: enqueueBlob, // addMicrophoneBlob,
    remove: removeBlob, // removeMicrophoneBlob,
    first: firstBlob, // firstMicrophoneBlob,
    size: queueSize, // countBlobs,
    queue, // : microphoneBlobs,
  } = useQueue<Blob>([]);

  useEffect(() => {
    async function setupMicrophone() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });

      setStream(stream);

      const microphone = new MediaRecorder(stream);

      setMicrophone(microphone);

      const audioContext = new AudioContext();
      const analyserTemp = audioContext.createAnalyser();
      const connectedSource = audioContext.createMediaStreamSource(stream);
      connectedSource.connect(analyserTemp);
      setAnalyser(analyserTemp);
    }

    if (!microphone) {
      void setupMicrophone();
    }
  }, [enqueueBlob, microphone, microphoneOpen]);

  useEffect(() => {
    if (!microphone) return;

    microphone.ondataavailable = (e) => {
      if (microphoneOpen) enqueueBlob(e.data);
    };

    return () => {
      microphone.ondataavailable = null;
    };
  }, [enqueueBlob, microphone, microphoneOpen]);

  const stopMicrophone = useCallback(() => {
    if (microphone?.state === "recording") microphone?.pause();

    setMicrophoneOpen(false);
  }, [microphone]);

  const startMicrophone = useCallback(() => {
    if (microphone?.state === "paused") {
      microphone?.resume();
    } else {
      microphone?.start(250);
    }

    setMicrophoneOpen(true);
  }, [microphone]);

  useEffect(() => {
    const eventer = () =>
      document.visibilityState !== "visible" && stopMicrophone();

    window.addEventListener("visibilitychange", eventer);

    return () => {
      window.removeEventListener("visibilitychange", eventer);
    };
  }, [stopMicrophone]);

  return (
    <MicrophoneContext.Provider
      value={{
        microphone,
        setMicrophone,
        startMicrophone,
        stopMicrophone,
        microphoneOpen,
        enqueueBlob,
        removeBlob,
        firstBlob,
        queueSize,
        queue,
        stream,
        analyser,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

export { MicrophoneContextProvider };
