import { getFirestore, Timestamp, getDocs, addDoc, collection, query, where } from "firebase/firestore";

interface resume {
  description: string | null,
  url: string,
  uid: string,
  jobId: string | null,
  filename: string
}

export const addResume = async (data: resume) => {  
  try {
    const db = getFirestore();
    await addDoc(collection(db, "resumes"), {
      ...data, 
      "dateCreated": Timestamp.fromDate(new Date())
    })
  } catch (error) {
    console.error(`Something went wrong while trying to add resume for user(${data.uid}): ${error}`)
    throw new Error(`${error}`)
  }
}

export const getUserResume = async (uid: string, filename: string) => {
  try {
    const db = getFirestore();
    const q = query(collection(db, "resumes"), 
      where("uid", "==", uid),
      where("filename", "==", filename))
    const docSnap = await getDocs(q);
    docSnap.forEach(doc => console.log(doc.id, " => ", doc.data()))
    return docSnap;
  } catch (error) {
    console.error(`Something went wrong while trying to fetch user(${uid}) resumes: ${error}`)
    throw new Error(`${error}`)
  }
}

export const getUserResumes = async(uid: string) => {
  try {
    const db = getFirestore();
    const q = query(collection(db, "resumes"), where("uid", "==", uid))
    const docSnap = await getDocs(q);
    docSnap.forEach(doc => console.log(doc.id, " => ", doc.data()))
    return docSnap;
  } catch (error) {
    console.error(`Something went wrong while trying to fetch user(${uid}) resumes: ${error}`)
    throw new Error(`${error}`)
  }
}
