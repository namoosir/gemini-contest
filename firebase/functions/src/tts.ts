import { logger } from "firebase-functions";

import { onRequest } from "firebase-functions/v2/https"
import { segmentTextBySentence, synthesizeAudio } from "./utils"

// gets the TTS audio buffer form Deepgram
exports.getTTS = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*') // temporary
  res.set('Access-Control-Allow-Methods', 'POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  res.set('Accept', 'application/json')

  type payload = {
    text: string,
    model: string
  }

  type response = {
    word: string,
    buffer: Uint8Array
  }[];


  try {
    const incomingText: payload = JSON.parse(req.body);
    const segments = segmentTextBySentence(incomingText.text);
    const responseArray: response = [];

    if (segments) {
      for (const segment of segments) {
        try {
          const audioData = await synthesizeAudio(segment);
          responseArray.push({ word: segment, buffer: audioData });
        } catch (error) {
          logger.error(`Something went wrong while trying to synthesize audio: ${error}`);
          res.status(404).send('Something went wrong');
        }
      }
    }
    res.status(200).send(responseArray);
  } catch (error) {
    logger.error(error)
    res.status(404).send(`Some error occured while processing request: ${error}`)
  }

})