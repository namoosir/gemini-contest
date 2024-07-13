import admin from "firebase-admin";
import express from "express";
import { https } from "firebase-functions/v2";
import { getTTS } from "./deepgram";
import { resumeTrigger } from "./triggers";
import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "northamerica-northeast1" });

export const firebaseApp = admin.initializeApp();
const app = express();

app.post("/audio/tts", async (req, res) => {
  try {
    const { text } = JSON.parse(req.body);
    res.status(200).send(await getTTS(text));
  } catch (error) {
    res.status(500).send("Cudnt get tts rip");
  }
});

// TODO: add endpoint for STT

exports.api = https.onRequest(app);
exports.trigger = resumeTrigger;
