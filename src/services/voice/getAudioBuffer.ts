interface data {
  text: string,
  model: string | null
}

export const getAudioBuffer = async (data: data) => {
  const chars = [".", " ", "!", "?"] // Helps with semantics
  let textToSend: string = data.text
  if (!(data.text[data.text.length - 1] in chars))
    textToSend = data.text.concat(".")

  const body = JSON.stringify({ text: textToSend })
  const url = data.model ? `https://api.deepgram.com/v1/speak?model=${data.model}` : "https://api.deepgram.com/v1/speak"
  const headers = {
    Authorization: `Token ${import.meta.env.VITE_APP_VOICE_API_KEY}`,
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
    return arrayBuffer
  } catch (error) {
    console.error("Error fetching audio data:", error)
    throw new Error(`Error fetching audio data: ${error}`)
  }
}

export const playAudio = (arrayBuffer: ArrayBuffer, audioCtx: AudioContext) => {
  return new Promise<void>(resolve => {
    audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
      const source = audioCtx.createBufferSource()
      source.buffer = buffer
      source.connect(audioCtx.destination)
      source.start(0)
      source.onended = () => {
        resolve()
      }
    }, error => {
      console.error('Error decoding audio data:', error)
      throw new Error(`Something went wrong while trying to play audio ${error}`)
    })
  })

}