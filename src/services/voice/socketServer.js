// /**
//  * 
//  * DOESNT WORK BTW XD
//  */

// import { WebSocketServer } from 'ws'
// import { createClient } from "@deepgram/sdk"
// import https from "https"
// import { type } from 'os';


// const server = new WebSocketServer({ port: 8080 })
// const DEEPGRAM_API_KEY = createClient(""); // put api key


// server.on('connection', socket => {
//   socket.on('message', async message => {
//     try {
//       const { protocol, ...data } = JSON.parse(message);
//       if (protocol === "init") {
//         const text = data["text"]
//         const model = data["model"]

//         console.log(text)

//         const segments = segmentTextBySentence(text)

//         for (const segment of segments) {
//           try {
//             const url = `https://api.deepgram.com/v1/speak?model=${model}`
//             const audioData = await synthesizeAudio(segment, url);
//             socket.send(audioData)
//             console.log("Audio stream finished for segment:", segment);
//           } catch (error) {
//             console.error("Error synthesizing audio:", error);
//           }
//         }
//       }
//     } catch (error) {
//       console.error(error)
//     }
//   })
// })

// function segmentTextBySentence(text) {
//   return text.match(/[^.!? ]+[.!? ]/g).map((sentence) => sentence.trim());
// }

// async function synthesizeAudio(text, DEEPGRAM_URL) {
//   return new Promise((resolve, reject) => {
//     const payload = JSON.stringify({ text });
//     const options = {
//       method: "POST",
//       headers: {
//         Authorization: `Token ${DEEPGRAM_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//     };

//     const req = https.request(DEEPGRAM_URL, options, (res) => {
//       let data = [];

//       res.on("data", (chunk) => {
//         console.log(chunk, type(chunk))
//         data.push(chunk);
//       });

//       res.on("end", () => {
//         // eslint-disable-next-line no-undef
//         resolve(Buffer.concat(data));
//       });
//     });

//     req.on("error", (error) => {
//       reject(error);
//     });

//     req.write(payload);
//     req.end();
//   });
// }


