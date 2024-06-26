import AppRouter from "./AppRouter";
import { FirebaseProvider } from "./context/FirebaseContext";

function App(): JSX.Element {
  return (
    <FirebaseProvider>
      <AppRouter />
    </FirebaseProvider>
  )
}

export default App