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
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/test" element={<Test />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/test2" element={<Interviewer />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
