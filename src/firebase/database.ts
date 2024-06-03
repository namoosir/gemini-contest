import { getFirestore, setDoc, doc, Timestamp } from "firebase/firestore";

interface resume {
  description: string,
  url: string,
  uid: string
}

export const createResume = async (info: resume) => {  
  const db = getFirestore();
  await setDoc(doc(db, "resumes", info.uid), {
    info, 
    "dateCreated": Timestamp.fromDate(new Date())
  })
}