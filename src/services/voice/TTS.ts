export const fetchAudioBuffer = async (sentence: string) => {
  const response = await fetch(
    "http://127.0.0.1:5001/gemini-contest/us-central1/api/audio/tts",
    {
      method: "POST",
      body: JSON.stringify({ text: sentence, model: "" }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error: ${response.status} ${errorText}`);
  }
  return await response.blob();
};
