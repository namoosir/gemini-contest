import { DeepgramContext } from "@/context/Deepgram";
import { useContext } from "react";

export default function useDeepgram() {
  return useContext(DeepgramContext);
}
