import { useEffect, useState } from "react"

function TestVoice() {
  type submitEvent = React.FormEvent<HTMLFormElement>
  const [userText, setUserText] = useState<string>("")
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const model = "aura-asteria-en"
  const url = "https://api.deepgram.com/v1/speak?model=" + model
  const apiKey = import.meta.env.VITE_APP_VOICE_API_KEY
  const chars = [".", " ", "!", "?"] // Helps with semantics

  useEffect(() => {
    const context = new window.AudioContext()
    setAudioContext(context)

    return () => {
      if (context) {
        context.close()
      }
    }
  }, [])

  const fetchAndPlayAudio = async (text: string) => {
    const textToSend: string = text.concat(".")
    const body = JSON.stringify({ text: textToSend })
    const headers = {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    }
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    }

    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`Failed to make request: ${response.statusText}`)
      }
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()

      if (audioContext) {
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
          const source = audioContext.createBufferSource()
          source.buffer = buffer
          source.connect(audioContext.destination)
          source.start(0)
        }, (error) => {
          console.error('Error decoding audio data:', error)
        })
      }
    } catch (error) {
      console.error('Error fetching audio data:', error)
    }
  }

  const handleSubmit = (event: submitEvent) => {
    event.preventDefault()

    if (userText !== "") {
      const text: string = userText
      if (!chars.includes(text[text.length - 1])) {
        setUserText(prevText => prevText + ".")
      }
      fetchAndPlayAudio(userText)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="voice">Enter text:</label>
        <input
          type="text"
          placeholder="Enter text"
          onChange={e => setUserText(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </>
  )
}

export default TestVoice
