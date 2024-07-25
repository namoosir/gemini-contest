import { AudioStoreContext } from "@/context/AudioStore";
import { useContext } from "react";

export default function useAudioStore() {
  return useContext(AudioStoreContext);
}
