import { ReactNode, createContext, useContext } from "react"
import { analytics, db} from "@/FirebaseConfig"
import { Firestore } from "firebase/firestore"
import { Analytics } from "firebase/analytics"

// A struct for the context
interface FirebaseContextType {
    db: Firestore
    analytics: Analytics
    // Add auth here
}

// Initialize the firebase context
export const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined)

// This is a provider that wraps around the main app and allows us to access the firebase context
export const FirebaseProvider = ({children}:{children:ReactNode}) => {
    return (
        <FirebaseContext.Provider value={{db, analytics}}>{children}</FirebaseContext.Provider>
    )
}

// This is a react hook that is used to get the context for the app
export const useFirebaseContext = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebaseContext must be used within a FirebaseProvider');
    }
    return context;
}