import AppRouter from "./AppRouter";
import { FirebaseProvider } from "./context/FirebaseContext";
import { AuthProvider } from "./context/AuthContext"

function App(): JSX.Element {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;
