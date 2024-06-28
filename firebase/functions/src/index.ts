import admin = require("firebase-admin")
import express = require("express")
import { https } from "firebase-functions/v2"
import { getTTS } from "./deepgram"

admin.initializeApp()
const app = express()

app.post("/audio/tts", async (req, res) => {
  try {
    const { text } = JSON.parse(req.body)
    res.status(200).send(await getTTS(text))
  } catch (error) {
    res.status(500).send("Cudnt get tts rip")
  }
})

// TODO: add endpoint for STT

exports.api = https.onRequest(app)
