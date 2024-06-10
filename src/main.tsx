import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { FirebaseProvider } from "./context/FirebaseContext.tsx";
import AppRouter from "./AppRouter.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FirebaseProvider>
      <AppRouter />
    </FirebaseProvider>
  </React.StrictMode>
);
