import admin from "firebase-admin";
import express from "express";
import { https } from "firebase-functions/v2";
import { resumeTrigger } from "./triggers";
import { setGlobalOptions } from "firebase-functions/v2";
import { tts } from "./callable";
import { getDeepgramKey } from "./deepgram";

setGlobalOptions({ region: "northamerica-northeast1" });

admin.initializeApp();
const app = express();

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

exports.api = https.onRequest(app);

// Triggers
exports.resumeTrigger = resumeTrigger;

// Callables
exports.tts = tts;
