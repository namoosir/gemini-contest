import "./App.css";
import { app } from "./FirebaseConfig";
import { User, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useFirebaseContext } from "./context/FirebaseContext";
import signoutlogo from "../src/assets/signoutlogopic.png";
import useSpeechRecognition from "./hooks/useSpeechRecognitionHook";
import { Card } from "./components/ui/card";

function Voice() {
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

  const {
    text,
    startListening,
    stopListening,
    isListening,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  useEffect(() => {
    console.log("Firebase app:", app);
  }, []);

  return (
    <>
      <div className="voice">
        {user && (
          <>
            <div className="flex items-center justify-center min-h-screen bg-black">
              {/* <Card className="p-8 rounded shadow-lg bg-cardbackground">
                <h1> Voice-To-Text</h1>
                <button
                  className="mic-button"
                  onClick={handleGoogleSignIn}
                  title="Sign In With Google"
                >
                  <img className="w-80" src={signingooglelogo} alt="" />
                </button>
              </Card> */}
              {hasRecognitionSupport ? (
                <>
                  <div>
                    <button
                      onClick={isListening ? stopListening : startListening}
                    >
                      {isListening ? "Stop Listening" : "Start Listening"}
                    </button>
                  </div>

                  {isListening ? (
                    <div>Your browser is currently listening</div>
                  ) : null}
                  <div>{text}</div>
                </>
              ) : (
                <h1>No Speech Reco Support</h1>
              )}

              {/* <button
                className="signoutbutton"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <img className="w-10" src={signoutlogo} alt="" />
              </button> */}
            </div>
          </>
        )}
        {!user && (
          <p>Unsuccessful Login Attempt, but you somehow made it through...</p>
        )}
      </div>
    </>
  );
}

export default Voice;
