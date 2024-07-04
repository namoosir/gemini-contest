import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/pages/Login.tsx";
import Home from "./components/pages/Home.tsx";
import Voice from "./components/pages/Voice.tsx";
import Test from "./components/pages/Test.tsx";
import Chat from "./components/pages/Chat.tsx";
import Interviewer from "./components/InterviewBot.tsx";
import Header from "./components/Header.tsx";
import useFirebaseContext from "./hooks/useFirebaseContext.ts";
import ProtectedRoute from "./ProtectedRoute.tsx";

const AppRouter = () => {
  const { auth } = useFirebaseContext();

  return (
    <Router>
      <div className="min-h-screen flex justify-center">
        <Header />
        <div className="min-h-full w-[1120px] lg:mt-[65px] mt-[72px]">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute user={auth.currentUser}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voice"
              element={
                <ProtectedRoute user={auth.currentUser}>
                  <Voice />
                </ProtectedRoute>
              }
            />

            <Route
              path="/test"
              element={
                <ProtectedRoute user={auth.currentUser}>
                  <Test />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute user={auth.currentUser}>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test2"
              element={
                <ProtectedRoute user={auth.currentUser}>
                  <Interviewer />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default AppRouter;
