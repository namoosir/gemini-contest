export interface InterviewProps {
  jobDescription: string | undefined;
  interviewDuration: string;
  interviewType: string;
  interviewMode: string;
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
