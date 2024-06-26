import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/pages/Login.tsx";
import Home from "./components/pages/Home.tsx";
import Voice from "./components/pages/Voice.tsx";
import Test from './components/pages/Test.tsx'
import Chat from "./components/pages/Chat.tsx";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/test" element={<Test />} />
        <Route path="/chat" element={<Chat />} />

      </Routes>
    </Router>
  );
};

export default AppRouter;
