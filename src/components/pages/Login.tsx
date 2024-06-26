import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Logo from '@/components/icons/Logo'
import Google from "../icons/Google"
import { useFirebaseContext } from "../../context/FirebaseContext";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

function App() {
  const navigate = useNavigate();
  const { auth } = useFirebaseContext();

  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential ? credential.accessToken : null;
      const user = result.user;
      
      console.log(user.displayName);
      navigate("/voice"); //CHANGE BACK TO HOME
    } catch (error: unknown) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-8">
          <Logo />
          <Button
            variant='secondary'
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <Google className="mr-2 h-5 w-5"/>
            <span>Continue with Google</span>
          </Button>
        </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
