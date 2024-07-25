import {
  LiveClient,
  LiveSchema,
  LiveTranscriptionEvents,
  SpeakSchema,
} from "@deepgram/sdk";
import { useLocalStorage } from "@uidotdev/usehooks";
import { createContext, useCallback, useEffect, useState } from "react";

interface DeepgramContext {
  ttsOptions: SpeakSchema | undefined;
  setTtsOptions: (value: SpeakSchema) => void;
  sttOptions: LiveSchema | undefined;
  setSttOptions: (value: LiveSchema) => void;
  connection: LiveClient | undefined;
  connectionReady: boolean;
}

interface DeepgramContextInterface {
  children: React.ReactNode;
}

export const DeepgramContext = createContext({} as DeepgramContext);

const DEFAULT_TTS_MODEL = "aura-asteria-en";
const DEFAULT_STT_MODEL = "nova-2";
const BASE_URL =
  "http://127.0.0.1:5001/gemini-contest/northamerica-northeast1/api";

const defaultTtsOptions = {
  model: DEFAULT_TTS_MODEL,
};

const defaultSttsOptions = {
  model: DEFAULT_STT_MODEL,
  interim_results: true,
  smart_format: true,
  endpointing: 550,
  utterance_end_ms: 1500,
  filler_words: true,
};

/**
 * TTS Voice Options
 */
const voices: Record<
  string,
  {
    name: string;
    avatar: string;
    language: string;
    accent: string;
  }
> = {
  [DEFAULT_TTS_MODEL]: {
    name: "Asteria",
    avatar: "/aura-asteria-en.svg",
    language: "English",
    accent: "US",
  },
};

const voiceMap = (model: string) => {
  return voices[model];
};

const getApiKey = async (): Promise<string> => {
  const response = await fetch(`${BASE_URL}/audio/stt/key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid: "test" }),
  });

  if (response.ok) {
    const data = await response.text();
    const jsonData = JSON.parse(data) as object;

    if ("key" in jsonData) return jsonData.key as string;
  }

  return "";
};

const DeepgramContextProvider = ({ children }: DeepgramContextInterface) => {
  const [ttsOptions, setTtsOptions] = useLocalStorage<SpeakSchema | undefined>(
    "ttsModel"
  );
  const [sttOptions, setSttOptions] = useLocalStorage<LiveSchema | undefined>(
    "sttModel"
  );
  const [connection, setConnection] = useState<LiveClient>();
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectionReady, setConnectionReady] = useState<boolean>(false);

  const connect = useCallback(
    async (defaultSttsOptions: SpeakSchema) => {
      if (!connection && !connecting) {
        setConnecting(true);

        const connection = new LiveClient(
          await getApiKey(),
          {},
          defaultSttsOptions
        );

        setConnection(connection);
        setConnecting(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [connecting, connection]
  );

  useEffect(() => {
    // it must be the first open of the page, let's set up the defaults

    // Why this is needed?, the requestTtsAudio of Conversation is wrapped in useCallback
    // which has a dependency of ttsOptions model
    // but the player inside the Nowplaying provider is set on mount, means
    // the when the startAudio is called the player is undefined.

    // This can be fixed in 3 ways:
    // 1. set player as a dependency inside the useCallback of requestTtsAudio
    // 2. change the code of react-nowplaying to use the ref mechanism
    // 3. follow the old code to avoid any risk i.e., first ttsOptions is undefined
    // and later when it gets set, it also update the requestTtsAudio callback.
    if (ttsOptions === undefined) {
      setTtsOptions(defaultTtsOptions);
    }

    if (!sttOptions === undefined) {
      setSttOptions(defaultSttsOptions);
    }
    if (connection === undefined) {
      void connect(defaultSttsOptions);
    }
  }, [
    connect,
    connection,
    setSttOptions,
    setTtsOptions,
    sttOptions,
    ttsOptions,
  ]);

  useEffect(() => {
    if (connection?.getReadyState() !== undefined) {
      connection.addListener(LiveTranscriptionEvents.Open, () => {
        setConnectionReady(true);
      });

      connection.addListener(LiveTranscriptionEvents.Close, () => {
        setConnectionReady(false);
        connection.removeAllListeners();
        setConnection(undefined);
      });

      connection.addListener(LiveTranscriptionEvents.Error, () => {
        setConnectionReady(false);
        connection.removeAllListeners();
        setConnection(undefined);
      });
    }

    return () => {
      setConnectionReady(false);
      connection?.removeAllListeners();
    };
  }, [connection]);

  return (
    <DeepgramContext.Provider
      value={{
        ttsOptions,
        setTtsOptions,
        sttOptions,
        setSttOptions,
        connection,
        connectionReady,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

export { DeepgramContextProvider, voiceMap, voices };
