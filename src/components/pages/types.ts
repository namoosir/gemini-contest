import { Content } from "firebase/vertexai-preview";

export interface InterviewProps {
  jobDescription: string | undefined;
  interviewDuration: string;
  interviewType: string;
  interviewMode: string;
}

export interface ResultProps {
  history: Content[]
}

export function isInterviewProps(obj: unknown): obj is InterviewProps {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "jobDescription" in obj &&
    typeof (obj as InterviewProps).jobDescription === "string" &&
    "interviewDuration" in obj &&
    typeof (obj as InterviewProps).interviewDuration === "string" &&
    "interviewType" in obj &&
    typeof (obj as InterviewProps).interviewType === "string" &&
    "interviewMode" in obj &&
    typeof (obj as InterviewProps).interviewMode === "string"
  );
}


export function isResultProps(obj: unknown): obj is ResultProps {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "history" in obj &&
    typeof (obj as ResultProps).history === "object"
  )
}
