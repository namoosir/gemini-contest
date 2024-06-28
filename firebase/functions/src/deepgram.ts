import { logger } from "firebase-functions";
import { segmentTextBySentence, synthesizeAudio } from "./utils"

export const getTTS = async (text: string) => {
  type response = {
    word: string,
    buffer: Uint8Array
  }[];

  try {
    const segments = segmentTextBySentence(text);
    const responseArray: response = [];

    if (segments) {
      for (const segment of segments) {
        try {
          const audioData = await synthesizeAudio(segment);
          responseArray.push({ word: segment, buffer: audioData });
        } catch (error) {
          logger.error(`Something went wrong while trying to synthesize audio: ${error}`);
          throw new Error(`Something went wrong while trying to synthesize audio: ${error}`)
        }
      }
    }
    return responseArray;
  } catch (error) {
    logger.error(error)
    throw new Error(`Some error occured while processing request: ${error}`)
  }
}
