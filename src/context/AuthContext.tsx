import { ReactNode, createContext, useEffect, useState } from "react";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import { signInWithPopup, User, GoogleAuthProvider, signOut } from "firebase/auth";

interface AuthContextType {
  user: User | null
  login: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth } = useFirebaseContext();
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const loadUser = auth.onAuthStateChanged((newUser) => {
      setUser(newUser)
      setLoading(false)
    })

    return () => loadUser();
  }, [auth])

  const logout = async () => {
    await signOut(auth);
  }

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      console.error(error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}