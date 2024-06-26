import { FirebaseContext } from "@/context/FirebaseContext";
import { useContext } from "react";

// This is a react hook that is used to get the context for the app
export default function useFirebaseContext() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error(
      "useFirebaseContext must be used within a FirebaseProvider"
    );
  }
  return context;
}