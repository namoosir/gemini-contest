import { useState } from "react";
import { fetchAudioBuffer } from "../services/voice/TTS";
import { Button } from "@/components/ui/button"

const Test = () => {
  const audioCtx = new AudioContext()
  const [text, setText] = useState<string>("")
  
  async function getAudio() {
    setText("")
    const data = await fetchAudioBuffer("hello. hi. How are you?. Whats up dude.")

    for (const chunk of data) {
      setText(prevText => prevText + " " + chunk.word)

      const typedArray = new Uint8Array(Object.values(chunk.buffer));
      const arrayBuffer = typedArray.buffer;

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Create a buffer source and play the audio
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();

      // Wait for the current chunk to finish playing
      await new Promise(resolve => {
        source.onended = resolve;
      });
    }
  }

  return (
    <>
      <Button variant="outline" onClick={getAudio}>Button</Button>
      <p>{text}</p>
    </>
  )
    
}

export default Test