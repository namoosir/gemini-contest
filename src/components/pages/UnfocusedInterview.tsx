import { User, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import Icon from "@mdi/react";
import { mdiLogout, mdiMicrophone } from "@mdi/js";
import // GeminiCard,
// GeminiCardContent,
// UserCard,
// UserCardContent,
"@/components/ui/card";

function UnfocusedInterview() {
  const { auth } = useFirebaseContext();

  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const signin = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(undefined);
      }
    });
    return () => signin();
  }, [auth]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <Icon path={mdiMicrophone} />
    </>
  );
}

export default UnfocusedInterview;
