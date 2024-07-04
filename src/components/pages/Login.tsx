import Logo from "@/components/icons/Logo";
import Google from "../icons/Google";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { app } from "../../FirebaseConfig";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  UserCredential,
  signInWithPopup,
  User,
} from "firebase/auth";
import useFirebaseContext from "@/hooks/useFirebaseContext";
import { useNavigate, BrowserRouter as Router } from "react-router-dom";
import { useEffect, useState } from "react";

function App() {
  const navigate = useNavigate();
  const { auth } = useFirebaseContext();
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState<User | null>(null);

  // const handleGoogleSignIn = async () => {
  //   try {
  //     console.log("Initiating Google Sign In...");
  //     await signInWithRedirect(auth, provider);
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       console.error("Error during sign in: ", error.message);
  //     } else {
  //       console.error("Unknown error during sign in");
  //     }
  //   }
  // };

  // useEffect(() => {
  //   getRedirectResult(auth)
  //     .then((result) => {
  //       console.log("Result...: ", result);
  //       if (result) {
  //         console.log("Result...", result);
  //         setUser(result.user);
  //         navigate("/voice");
  //       }
  //     })
  //     .catch((error) => {
  //       if (error instanceof Error) {
  //         console.error("Error during redirect result: ", error.message);
  //       } else {
  //         console.error("Unknown error during redirect result");
  //       }
  //     });
  // }, [auth, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential ? credential.accessToken : null;
      console.log(token);
      const user = result.user;

      console.log(user.displayName);
      navigate("/voice"); //CHANGE BACK TO HOME
    } catch (error: unknown) {
      console.error(error);
    }
  };

  console.log(app);

  return (
    <div className="flex items-center justify-center min-h-full">
      <Card>
        <CardHeader></CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-8">
          <Logo />
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <Google className="mr-2 h-5 w-5" />
            <span>Continue with Google</span>
          </Button>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}

export default App;
