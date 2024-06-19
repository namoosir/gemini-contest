import "./App.css";
import { app } from "./FirebaseConfig";
import { User, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useFirebaseContext } from "./context/FirebaseContext";
import signoutlogo from "../src/assets/signoutlogopic2.png";

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

  console.log(app);

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
              <img className="w-7" src={signoutlogo} alt="" />
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
