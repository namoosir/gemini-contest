import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import Home from "./Home.tsx";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
