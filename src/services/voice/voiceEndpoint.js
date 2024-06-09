// import { createClient } from "@deepgram/sdk";
// import express from "express";
// import http from "http";
// import fs from "fs";
// import path from "path";
// import cors from "cors";
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';

// const app = express();
// const server = http.createServer(app);
// app.use(cors());
// app.use(express.json());

// const deepgram = createClient(""); // put api key


// app.post("/api", async (req, res) => {
//   const { body } = req;
//   const { text, model } = body;

//   console.log(body)

//   try {
//     const filePath = await getAudio(text, model);
//     res.json({ audioUrl: filePath });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });

// const getAudio = async (text, model) => {
//   const response = await deepgram.speak.request({ text }, { model });
//   const stream = await response.getStream();

//   if (stream) {
//     const buffer = await getAudioBuffer(stream);
    
//     // Ensure 'audio' directory exists
//     const __filename = fileURLToPath(import.meta.url);
//     const __dirname = dirname(__filename);
//     const audioDirectory = path.join(__dirname, "audio");
//     if (!fs.existsSync(audioDirectory)) {
//       fs.mkdirSync(audioDirectory);
//     }

//     // Write audio file to 'audio' directory
//     await new Promise((resolve, reject) => {
//       fs.writeFile(path.join(audioDirectory, "audio.wav"), buffer, (err) => {
//         if (err) {
//           console.error("Error writing audio to file:", err);
//           reject(err);
//         } else {
//           console.log("Audio file written to audio.wav");
//           resolve();
//         }
//       });
//     });

//     return "/audio/audio.wav";
//   } else {
//     console.error("Error generating audio:", stream);
//     throw new Error("Error generating audio: Stream is empty");
//   }
// };

// // Helper function to convert stream to audio buffer
// const getAudioBuffer = async (response) => {
//   const reader = response.getReader();
//   const chunks = [];
//   const done = false;

//   while (!done) {
//     const { done, value } = await reader.read();
//     if (done) break;

//     chunks.push(value);
//   }

//   const dataArray = chunks.reduce(
//     (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
//     new Uint8Array(0)
//   );


//   // eslint-disable-next-line no-undef
//   return Buffer.from(dataArray.buffer);
// };


// // Start the server
// const PORT = 3000;
// server.listen(PORT, () => {
//   console.log(`Server is listening on port ${PORT}`);
// });