import "./App.css";
import { app } from "./FirebaseConfig";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import signingooglelogo from "../src/assets/continueGoogleNoBg.png";
import logo from "../src/assets/CompanyTestLogo.png";
import { useFirebaseContext } from "./context/FirebaseContext";
import { Card } from "./components/ui/card";

function App() {
  // const history = useHistory();
  const { auth } = useFirebaseContext();
  // const { updateUser } = useAuth();

  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential ? credential.accessToken : null;
      const user = result.user;
      console.log(user.displayName);
      window.location.href = "/voice"; //CHANGE BACK TO HOME
    } catch (error) {
      const authError = error as any;

      const errorCode = authError.code;
      const errorMessage = authError.message;
      const email = authError.customData?.email;
      const credential = GoogleAuthProvider.credentialFromError(authError);

      console.error(errorMessage);
    }
  };

  console.log(app);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Card className="p-8 rounded shadow-lg bg-cardbackground">
          <img className="w-80 mb-7" src={logo} alt="" />
          <button
            className="signinbutton bg-secondary rounded-lg hover:bg-hovercolour focus:outline-none focus:ring focus:ring-primary"
            onClick={handleGoogleSignIn}
            title="Sign In With Google"
          >
            <img className="w-80" src={signingooglelogo} alt="" />
          </button>
        </Card>
      </div>
    </>
  );
}

export default App;
