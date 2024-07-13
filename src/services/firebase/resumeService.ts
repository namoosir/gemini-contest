import {
  Timestamp,
  getDocs,
  addDoc,
  collection,
  query,
  where,
  Firestore,
} from "firebase/firestore";
import { FirebaseStorage, ref, uploadBytes } from "firebase/storage";

interface resume {
  description: string | null;
  url: string;
  uid: string;
  jobId: string | null;
  filename: string;
}

export const addResume = async (db: Firestore, data: resume) => {
  try {
    await addDoc(collection(db, "resumes"), {
      ...data,
      dateCreated: Timestamp.fromDate(new Date()),
    });
    return true;
  } catch (error) {
    console.error(
      `Something went wrong while trying to add resume for user(${data.uid}): `,
      error
    );
    throw new Error(
      `Something went wrong while trying to add resume for user(${data.uid}): ${
        error as string
      }`
    );
  }
};

export const getUserResume = async (
  db: Firestore,
  uid: string,
  filename: string
) => {
  try {
    const q = query(
      collection(db, "resumes"),
      where("uid", "==", uid),
      where("filename", "==", filename)
    );
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => console.log(doc.id, " => ", doc.data()));
    return docSnap;
  } catch (error) {
    console.error(
      `Something went wrong while trying to fetch user(${uid}) resumes: `,
      error
    );
    throw new Error(
      `Something went wrong while trying to fetch user(${uid}) resumes: ${
        error as string
      }`
    );
  }
};

export const getUserResumes = async (db: Firestore, uid: string) => {
  try {
    const q = query(collection(db, "resumes"), where("uid", "==", uid));
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => console.log(doc.id, " => ", doc.data()));
    return docSnap;
  } catch (error) {
    console.error(
      `Something went wrong while trying to fetch user(${uid}) resumes: `,
      error
    );
    return false;
  }
};

export const uploadResume = async (
  storage: FirebaseStorage,
  file: File,
  uid: string
) => {
  try {
    const resumeRef = ref(storage, `resume/${uid}/${file.name}`);

    await uploadBytes(resumeRef, file);
    console.log("Successfully uploaded file!");
    return resumeRef.toString();
  } catch (error) {
    console.error("Some error happened while uploading resume: ", error);
    throw new Error(
      `Some error happened while uploading resume: ${error as string}`
    );
  }
};
