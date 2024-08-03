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
  overallScore: number;
}

export interface Interview {
  uid: string;
  chat: ChatMessage[];
  overallScore: Score;
  feedback: {
    score: Score;
    text: string
  }[];
  recommendation: string;
  dateCreated?: string;
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
  endMonth?: String
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
      currDate.getMonth() + 1,
      currDate.getDay() - 7
    ).toLocaleDateString();
    const weekEnd = currDate.toLocaleDateString();

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
