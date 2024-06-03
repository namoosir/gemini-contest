import { getFirestore, setDoc, doc, Timestamp } from "firebase/firestore";

interface resume {
  description: string,
  url: string,
  jobId: string | null
}

export const createResume = async (info: resume, uid: string) => {  
  const db = getFirestore();
  await setDoc(doc(db, "resumes", uid), {
    ...info, 
    "dateCreated": Timestamp.fromDate(new Date())
  })
}