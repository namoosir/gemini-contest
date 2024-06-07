import { Timestamp, getDocs, addDoc, collection, query, where, Firestore } from "firebase/firestore";

interface resume {
  description: string | null,
  url: string,
  uid: string,
  jobId: string | null,
  filename: string
}

export const addResume = async (db: Firestore, data: resume) => {  
  try {
    await addDoc(collection(db, "resumes"), {
      ...data, 
      "dateCreated": Timestamp.fromDate(new Date())
    })
  } catch (error) {
    console.error(`Something went wrong while trying to add resume for user(${data.uid}): ${error}`)
    throw new Error(`${error}`)
  }
}

export const getUserResume = async (db: Firestore, uid: string, filename: string) => {
  try {
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

export const getUserResumes = async(db: Firestore, uid: string) => {
  try {
    const q = query(collection(db, "resumes"), where("uid", "==", uid))
    const docSnap = await getDocs(q);
    docSnap.forEach(doc => console.log(doc.id, " => ", doc.data()))
    return docSnap;
  } catch (error) {
    console.error(`Something went wrong while trying to fetch user(${uid}) resumes: ${error}`)
    throw new Error(`${error}`)
  }
}


import { FirebaseStorage, ref, uploadBytes } from "firebase/storage"

export const uploadResume = (storage: FirebaseStorage, file: File, uid: string) => {
	const resumeRef = ref(storage, `resume/${uid}/${file.name}`);

	// This uploads it to firebase Storage
	uploadBytes(resumeRef, file).then(() => {
		console.log('Successfully uploaded file!')
	}).catch(err => console.error(`Some error happened while uploading resume: ${err}`))

	return resumeRef.toString();
}