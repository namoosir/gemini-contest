import { createContext, useCallback, useState } from "react";

interface AudioStoreContext {
  audioStore: AudioPacket[];
  addAudio: (queueItem: AudioPacket) => void;
}

export interface AudioPacket {
  id: string;
  blob: Blob;
}

interface AudioStoreItemContextInterface {
  children: React.ReactNode;
}

export const AudioStoreContext = createContext({} as AudioStoreContext);

export const AudioStoreContextProvider = ({
  children,
}: AudioStoreItemContextInterface) => {
  const [audioStore, setAudioStore] = useState<AudioPacket[]>([]);

  const addAudio = useCallback((queueItem: AudioPacket): void => {
    setAudioStore((q) => [...q, queueItem]);
  }, []);

  return (
    <AudioStoreContext.Provider
      value={{
        audioStore,
        addAudio,
      }}
    >
      {children}
    </AudioStoreContext.Provider>
  );
};
