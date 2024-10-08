import { logger } from "firebase-functions/v2";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import pdf from "pdf-parse";

export const resumeTrigger = onObjectFinalized(
  {
    region: "northamerica-northeast1", // specify the region of your storage bucket
    bucket: "gemini-contest.appspot.com", // replace with your bucket name
  },
  async (event) => {
    try {
      logger.log("Resume Trigger Activated!");
      const firestore = getFirestore();
      const fileBucket = event.data.bucket; // Storage bucket containing the file.
      const filePath = event.data.name; // File path in the bucket.
      const contentType = event.data.contentType; // File content type.
      const [_, uid, fileName] = filePath.split(/[/]/g);

      const [files] = await getStorage()
        .bucket(fileBucket)
        .getFiles({
          prefix: `resume/${uid}/`,
        });

      if (files.length > 1) {
        const filesToDelete = files.filter(
          (file) => !file.name.includes(fileName)
        );
        await Promise.all(filesToDelete.map((file) => file.delete()));
      }

      if (!contentType?.startsWith("application/pdf")) {
        logger.warn("This is not a pdf.");
      }

      // Creating a temp buffer in memory to store pdf file
      const bucket = getStorage().bucket(fileBucket);
      const [downloadResponse] = await bucket.file(filePath).download();
      const pdfObj = await pdf(downloadResponse);

      // Adding the document to firestore
      const gsUrl = `gs://${fileBucket}/${filePath}`;

      const docRef = firestore.doc(`resumes/${uid}`);
      await docRef.set({
        uid: uid,
        url: gsUrl,
        filename: fileName,
        dateCreated: new Date().toUTCString(),
        data: pdfObj.text,
      });
    } catch (error) {
      logger.error("Something went wrong in pdf trigger:", error);
    }
  }
);
