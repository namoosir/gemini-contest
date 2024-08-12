import admin from "firebase-admin";
import express from "express";
import { https, logger } from "firebase-functions/v2";
import { resumeTrigger } from "./triggers";
import { setGlobalOptions } from "firebase-functions/v2";
import { getDeepgramKey, getTTS } from "./deepgram";
import cors from 'cors'

setGlobalOptions({ region: "northamerica-northeast1" });

admin.initializeApp();
const app = express();

app.use(cors({
  origin: 'https://66b68d7dfdff587e8e3d4354--chimerical-liger-1f1422.netlify.app',
}))

app.post("/audio/stt/key", async (req, res) => {
  try {
    const { uid } = req.body;
    const key = await getDeepgramKey(uid);
    res.status(200).send(key);
  } catch (error) {
    logger.error("Error fetching API key:", error);
    res.status(500).send("Server error");
  }
});

app.post("/audio/tts", async (req, res) => {
  try {
    let { text } = req.body

    text = text
      .replaceAll("¡", "")
      .replaceAll("https://", "")
      .replaceAll("http://", "")
      .replaceAll(".com", " dot com")
      .replaceAll(".org", " dot org")
      .replaceAll(".co.uk", " dot co dot UK")
      .replaceAll(/```[\s\S]*?```/g, "\nAs shown on the app.\n")
      .replaceAll(
        /([a-zA-Z0-9])\/([a-zA-Z0-9])/g,
        (_: any, precedingText: string, followingText: string) => {
          return precedingText + " forward slash " + followingText;
        }
      );

    const responseBody = await getTTS(text)
    res.setHeader('Content-Type', 'audio/mp3')

    responseBody.pipe(res);
  } catch (error) {
    res.status(500).send((error as Error).message)
  }

})

exports.api = https.onRequest(app);

// Triggers
exports.resumeTrigger = resumeTrigger;

// Callables
// exports.tts = tts;
