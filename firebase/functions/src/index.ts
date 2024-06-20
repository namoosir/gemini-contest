/* eslint-disable @typescript-eslint/no-explicit-any */
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
import { logger } from "firebase-functions";
import { onCall } from "firebase-functions/v2/https";

// The Firebase Admin SDK to access Firestore.
import { onRequest } from "firebase-functions/v1/https";
import https = require("https");
import 'dotenv/config'

import admin = require("firebase-admin")
import * as serviceAccount from './serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)}
);

const DEEPGRAM_URL = "https://api.deepgram.com/v1/speak?model=aura-athena-en&encoding=linear16&container=wav";
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

// gets the TTS audio buffer form Deepgram
exports.getTTS = onRequest(async (req, res) => { 
  res.set('Access-Control-Allow-Origin', '*') // temporary
  res.set('Access-Control-Allow-Methods','POST')
  res.set('Access-Control-Allow-Headers','Content-Type')
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

function segmentTextBySentence(text: string) {
  return text.match(/[^.!?]+[.!?]/g)?.map((sentence) => sentence.trim());
}

function synthesizeAudio(text: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ text });
    const options = {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json"
      }
    }

    const req = https.request(DEEPGRAM_URL, options, (res) => {
      const data: any = [];

      res.on("data", (chunk) => {
        data.push(chunk);
      });

      res.on("end", () => {
        const buffer = Buffer.concat(data)
        resolve(new Uint8Array(buffer));
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}


exports.getTestMessage = onRequest(async (req, res) => { 
  res.set('Access-Control-Allow-Origin', '*') // temporary
  logger.log(req.body)
  res.status(200).send("Test message")
})

// onCall useful when user auth or user context stuff is useful
exports.addmessage = onCall(data => {
  const original = data.data
  logger.log(original)
  return `Hello from server, message recieved, was this ur message: ${data.data}`
});
