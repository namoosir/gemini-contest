import {
  getDocs,
  addDoc,
  collection,
  query,
  where,
  Firestore,
} from "firebase/firestore";

import { ChatMessage } from "../voice/TTS";
import { User } from "firebase/auth";

export interface Score {
  technicalScore: number;
  behavioralScore: number;
  jobFitScore: number;
  overallScore?: number;
}

export interface Interview {
  uid: string;
  chat: ChatMessage[];
  overallScore: Score;
  feedback: {
    score: Score;
    text: string;
  }[];
  recommendation: string;
  duration: number;
  dateCreated?: number | string;
}

export const addInterview = async (db: Firestore, data: Interview) => {
  try {
    await addDoc(collection(db, "interviews"), {
      ...data,
      dateCreated: Date.now(),
    });

    return true;
  } catch (error) {
    console.error("Error adding interview history:", error);
    return false;
  }
};

export const getUserInterviewHistory = async (
  db: Firestore,
  user: User,
  currMonth?: number,
  endMonth?: number
) => {
  try {
    let q = query(collection(db, "interviews"), where("uid", "==", user.uid));

    if (currMonth && endMonth) {
      q = query(
        collection(db, "interviews"),
        where("uid", "==", user.uid),
        where("dateCreated", ">=", currMonth),
        where("dateCreated", "<", endMonth)
      );
    }

    const docSnap = await getDocs(q);

    const userInterviewHistory: Interview[] = [];

    docSnap.forEach((doc) => {
      const data = doc.data() as Interview;
      const tempDate = new Date(data.dateCreated as number).toLocaleDateString("en-US");
      data.dateCreated = tempDate;
      userInterviewHistory.push(data);
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
    const weekStart = Number(
      new Date(
        currDate.getFullYear(),
        currDate.getMonth(),
        currDate.getDay() - 7
      )
    );
    const weekEnd = Number(currDate);

    const q = query(
      collection(db, "interviews"),
      where("uid", "==", user.uid),
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
