import { MicrophoneContext } from "@/context/Microphone";
import { useContext } from "react";

export default function useMicrophone() {
  return useContext(MicrophoneContext);
}
