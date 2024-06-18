import "./App.css";
import { app } from "./FirebaseConfig";
import { User, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useFirebaseContext } from "./context/FirebaseContext";
import signoutlogo from "../src/assets/signoutlogopic.png";
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import { Card } from "./components/ui/card";
import Siriwave from "react-siriwave";

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
              <Siriwave theme="ios9" speed={0.04} pixelDepth={0.5} />
              {hasRecognitionSupport ? (
                <>
                  <div>
                    <Card className="p-8 rounded shadow-lg bg-cardbackground">
                      <h1 className="">Voice-To-Text</h1>
                      <button
                        className="bg-primary p-4 rounded"
                        onClick={isListening ? stopListening : startListening}
                      >
                        {isListening ? "Stop Listening" : "Start Listening"}
                      </button>

                      {isListening ? (
                        <div>Your browser is currently listening</div>
                      ) : null}

                      <form className="bg-secondary p-4 rounded">
                        <label form="fname">{text}</label>
                      </form>
                    </Card>
                  </div>
                </>
              ) : (
                <h1>No Speech Reco Support</h1>
              )}
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
