import { useState } from "react"
import { getAudioBuffer, playAudio } from "@/services/voice/getAudioBuffer"

function TestVoice() {
  type submitEvent = React.FormEvent<HTMLFormElement>
  const [userText, setUserText] = useState<string>("")
  const audioContext = new window.AudioContext()

  const handleSubmit = async (event: submitEvent) => {
    event.preventDefault()
    if (userText !== "" && audioContext) {
      try {
        const arrayBuffer = await getAudioBuffer({
          text: userText,
          model: "aura-asteria-en"
        })
        playAudio(arrayBuffer, audioContext)
      } catch (error) {
        console.error(`Something went wrong with TTS ${error}`)
      }
    }    
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="voice">Enter text for TTS: </label>
        <input
          type="text"
          placeholder=""
          onChange={e => setUserText(e.target.value)}
          className="text-black"
        />
        <button type="submit"> Submit</button>
      </form>
    </>
  )
}

export default TestVoice
