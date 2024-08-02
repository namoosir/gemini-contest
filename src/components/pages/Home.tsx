import { User, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import Icon from '@mdi/react'
import { mdiLogout } from '@mdi/js'

function Home() {
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
      <div className="signinpage">
        {user && (
          <>
            <p>{user.displayName} is logged in...</p>
            <button
              className="signoutbutton"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <Icon
                className="w-8 ml-1"
                path={mdiLogout}
              />
            </button>
          </>
        )}
        {!user && (
          <p>Unsuccessful Login Attempt, but you somehow made it through...</p>
        )}
      </div>
    </>
  );
}

export default Home;
