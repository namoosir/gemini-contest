import {
  getDocs,
  collection,
  query,
  where,
  Firestore,
} from "firebase/firestore";
import {
  FirebaseStorage,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

export interface Resume {
  data: string;
  dateCreated: string;
  filename: string;
  url: string;
  uid: string;
}

export const getUserResumes = async (
  db: Firestore,
  uid: string
): Promise<Resume[] | false> => {
  try {
    const result: Resume[] = [];

    const q = query(collection(db, "resumes"), where("uid", "==", uid));
    const docSnap = await getDocs(q);

    docSnap.forEach((doc) => result.push(doc.data() as Resume));

    return result;
  } catch (error) {
    throw new Error(
      `Error trying to fetch user Resume. ${(error as Error).message}`
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
      `Some error happened while uploading resume: ${(error as Error).message}`
    );
  }
};

export const getResumeObject = async (
  storage: FirebaseStorage,
  url: string
) => {
  try {
    const result = await getDownloadURL(ref(storage, url));

    return result;
  } catch (error) {
    console.error("Error fetching file from GCS:", error);
    throw error;
  }
};
