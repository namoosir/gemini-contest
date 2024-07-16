export const fetchAudioBuffer = async (
  sentence: string
): Promise<{ word: string; buffer: Uint8Array }[]> => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5001/gemini-contest/us-central1/api/audio/tts",
      {
        method: "POST",
        body: JSON.stringify({ text: sentence, model: "" }),
      }
    );
    return (await response.json()) as Promise<
      { word: string; buffer: Uint8Array }[]
    >;
  } catch (error) {
    alert(
      "Something went wrong while trying to fetch, maybe turn on cloud function or fix backend"
    );
    throw new Error(`${error as string}`);
  }
};

export const getAPIKey = async () => {
  const response = await fetch(
    "http://127.0.0.1:5001/gemini-contest/us-central1/api/audio/stt/key",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid: "test" }),
    }
  );

  if (response.ok) {
    const data = await response.text();
    return JSON.parse(data).key as string;
  }
};

// export const playAudio = (arrayBuffer: ArrayBuffer, audioCtx: AudioContext) => {
//   return new Promise<void>(resolve => {
//     audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
//       const source = audioCtx.createBufferSource()
//       source.buffer = buffer
//       source.connect(audioCtx.destination)
//       source.start(0)
//       source.onended = () => {
//         resolve()
//       }
//     }, error => {
//       console.error('Error decoding audio data:', error)
//       throw new Error(`Something went wrong while trying to play audio ${error}`)
//     })
//   })
// }
