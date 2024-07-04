import { segmentTextBySentence, synthesizeAudio } from "./utils.js"

export const getTTS = async (text, client) => {
  try {
    const segments = segmentTextBySentence(text)
    
    if (segments) {
      for (const segment of segments) {
        try {
          const audioData = await synthesizeAudio(segment)
          client.send(JSON.stringify({ word: segment, buffer: audioData }))
        } catch (error) {
          throw new Error(`Something went wrong while trying to synthesize audio: ${error}`)
        }
      }
    }
    console.log("Done!.\n")
  } catch (error) {
    throw new Error(`Some error occured while processing TTS request: ${error}`)
  }
}

export const getSTT = async (buffer, client) => {
  try {
    
  } catch (error) {
    throw new Error(`Some error occured while processing STT request: ${error}`)
  }
}
