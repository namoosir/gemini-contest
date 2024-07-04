import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/pages/Login.tsx";
import Home from "./components/pages/Home.tsx";
import Voice from "./components/pages/Voice.tsx";
import Test from "./components/pages/Test.tsx";
import Chat from "./components/pages/Chat.tsx";
import Interviewer from "./components/InterviewBot.tsx";
import Header from "./components/Header.tsx";

const AppRouter = () => {
  return (
    <Router>
      <div className="min-h-screen flex justify-center">
        <Header />
        <div className="min-h-full w-[1120px] lg:mt-[65px] mt-[72px]">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/voice" element={<Voice />} />
            <Route path="/test" element={<Test />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/test2" element={<Interviewer />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default AppRouter;
