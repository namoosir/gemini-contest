import { ReactNode, createContext } from "react";
import { analytics, db, auth, provider, storage, functions } from "@/FirebaseConfig";
import { Firestore } from "firebase/firestore";
import { Analytics } from "firebase/analytics";
import { FirebaseStorage } from "firebase/storage";
import { Auth, GoogleAuthProvider } from "firebase/auth";
import { Functions } from "firebase/functions";

// A struct for the context
interface FirebaseContextType {
  db: Firestore;
  analytics: Analytics;
  auth: Auth;
  provider: GoogleAuthProvider;
  storage: FirebaseStorage;
  functions: Functions
}

// Initialize the firebase context
export const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

// This is a provider that wraps around the main app and allows us to access the firebase context
export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FirebaseContext.Provider value={{ db, analytics, auth, provider, storage, functions }}>
      {children}
    </FirebaseContext.Provider>
  );
};
