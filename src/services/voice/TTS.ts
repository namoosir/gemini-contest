export const getTTSAudioBuffer = async (text: string, model: string | null) => {
  const chars = [".", " ", "!", "?"] // Helps with semantics
  let textToSend: string = text
  if (!(text[text.length - 1] in chars))
    textToSend = text.concat(".")

  const body = JSON.stringify({ text: textToSend })
  const url = model ? `https://api.deepgram.com/v1/speak?model=${model}` : "https://api.deepgram.com/v1/speak"
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


export const fetchAudioBuffer = async (sentence: string): Promise<{word: string, buffer: Uint8Array}> => {
  try {
    const response = await fetch('http://127.0.0.1:5001/gemini-contest/us-central1/api/audio/tts', {
      method: "POST",
      body: JSON.stringify({ "text": sentence, "model": "" })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    alert('Something went wrong while trying to fetch, maybe turn on cloud function or fix backend')
    throw new Error(`${error}`)
  }
};



export const getTestMessage = async () => {
  const response = await fetch('http://127.0.0.1:5001/gemini-contest/us-central1/getTestMessage', {
    method: "POST",
    body: JSON.stringify({ "text": "hello test message hello from client.", "model": "" })
  });

  const data = await response.json();
  return data;
}


export const fetchAudioBufferV2 = async (sentence: string) => {
  const response = await fetch('http://127.0.0.1:5001/gemini-contest/us-central1/getAudioBuffer', {
    method: "POST",
    body: JSON.stringify({ "text": sentence, "model": "" })
  });

  const data = await response.json();
  return data;
};
