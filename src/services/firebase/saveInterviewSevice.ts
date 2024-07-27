import {
  Timestamp,
  getDocs,
  addDoc,
  collection,
  query,
  where,
  Firestore,
  doc,
  getDoc,
  setDoc,
  DocumentData,
  or,
  and,
} from "firebase/firestore";
import {
  FirebaseStorage,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { ChatMessage } from "../voice/TTS";
import { User } from "firebase/auth";

export interface Interview {
  user: string;
  chat: ChatMessage[];
  score: number;
  dateCreated?: String;
}

//TODO: In Chat.tsx Line 267-275, make sure you update the right score

export const addInterview = async (db: Firestore, data: Interview) => {
  try {
    await addDoc(collection(db, "interviews"), {
      ...data,
      dateCreated: new Date().toLocaleDateString(),
    });
    console.log("Interview history added successfully");
    return true;
  } catch (error) {
    console.error("Error adding interview history:", error);
    return false;
  }
};

export const getUserInterviewHistory = async (
  db: Firestore,
  user: User,
  currMonth?: String,
  endMonth?: String,
  weekStart?: String,
  weekEnd?: String
) => {
  try {
    let q = query(collection(db, "interviews"), where("user", "==", user.uid));

    if (currMonth && endMonth) {
      q = query(
        collection(db, "interviews"),
        where("user", "==", user.uid),
        where("dateCreated", ">=", currMonth),
        where("dateCreated", "<", endMonth)
      );
    } else if (weekStart && weekEnd) {
      q = query(
        collection(db, "interviews"),
        where("user", "==", user.uid),
        where("dateCreated", ">=", weekStart),
        where("dateCreated", "<=", weekEnd)
      );
    }

    const docSnap = await getDocs(q);

    const userInterviewHistory: Interview[] = [];

    docSnap.forEach((doc) => {
      let data = doc.data();
      userInterviewHistory.push(data as Interview);
    });

    return userInterviewHistory;
  } catch (error) {
    console.error(
      `Something went wrong while trying to fetch user(${user.uid}) interview: `,
      error
    );
    return null;
  }
};

export const getUserInterviewHistoryWithinWeek = async (
  db: Firestore,
  user: User
) => {
  try {
    const currDate = new Date();
    const weekStart = new Date(
      currDate.getFullYear(),
      currDate.getMonth(),
      currDate.getDay() - 7
    ).toLocaleDateString();
    const weekEnd = new Date(
      currDate.getFullYear(),
      currDate.getMonth(),
      currDate.getDay()
    ).toLocaleDateString();

    // let currentDate = new Date();
    // let currentDateTimestamp = Timestamp.fromDate(currentDate);

    // const weekAgo = new Date();
    // weekAgo.setDate(currentDate.getDate() - 7);
    // let weekAgoDateTimestamp = Timestamp.fromDate(currentDate);

    const q = query(
      collection(db, "interviews"),
      where("user", "==", user.uid),
      where("dateCreated", ">=", weekStart),
      where("dateCreated", "<=", weekEnd)
    );

    const docSnap = await getDocs(q);

    const userInterviewHistory: Interview[] = [];

    docSnap.forEach((doc) => {
      userInterviewHistory.push(doc.data() as Interview);
    });

    return userInterviewHistory;
  } catch (error) {
    console.error(
      `Something went wrong while trying to fetch user(${user.uid}) interview: `,
      error
    );
    return null;
  }
};
