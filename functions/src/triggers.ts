import { logger } from "firebase-functions/v1";
import { onObjectFinalized } from "firebase-functions/v2/storage";
// import { firebaseApp } from ".";
// import { readFileSync } from "fs";
// import pdf = require("pdf-parse");

export const resumeTrigger = onObjectFinalized(
  {
    region: "northamerica-northeast1", // specify the region of your storage bucket
    bucket: "gemini-contest.appspot.com", // replace with your bucket name
  },
  async (event) => {
    try {
      logger.log("Message from Trigger")
      // logger.log(event.data)
    } catch (error) {
      logger.error("Something went wrong in pdf trigger:", error)
    }
  }
);
