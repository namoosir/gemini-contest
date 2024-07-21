import admin from "firebase-admin";
import express from "express";
import { https } from "firebase-functions/v2";
import { getTTS } from "./deepgram";
import { resumeTrigger } from "./triggers";
import { setGlobalOptions } from "firebase-functions/v2";
import { tts } from "./callable";
import { getDeepgramKey } from "./utils";


setGlobalOptions({ region: "northamerica-northeast1" });

admin.initializeApp();
const app = express();

app.post("/audio/tts", async (req, res) => {
  try {
    const { text } = JSON.parse(req.body);
    res.status(200).send(await getTTS(text));
  } catch (error) {
    res.status(500).send("Cudnt get tts rip");
  }
});

app.post("/audio/stt/key", async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { uid } = req.body;
    const key = await getDeepgramKey(uid);
    res.status(200).send(key);
  } catch (error) {
    console.error("Error fetching API key:", error);
    res.status(500).send("Server error");
  }
});

// TODO: add endpoint for STT

exports.api = https.onRequest(app);
exports.resumeTrigger = resumeTrigger;
exports.tts = tts;
