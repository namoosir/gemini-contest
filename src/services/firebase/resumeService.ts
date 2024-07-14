import {
  getDocs,
  collection,
  query,
  where,
  Firestore,
} from "firebase/firestore";
import { FirebaseStorage, ref, uploadBytes } from "firebase/storage";

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
    throw new Error(
      `Something went wrong while trying to fetch all user resumes: ${
        error as string
      }`
    );
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
    return resumeRef.toString();
  } catch (error) {
    throw new Error(
      `Some error happened while uploading resume: ${error as string}`
    );
  }
};
