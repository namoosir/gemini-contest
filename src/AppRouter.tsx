import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import Home from "./Home.tsx";
import Voice from "./Voice.tsx";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
        <Route path="/voice" element={<Voice />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
