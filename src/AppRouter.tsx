import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Login from "./components/pages/Login.tsx";
import Home from "./components/pages/Home.tsx";
import Chat from "./components/pages/Chat.tsx";
import Interview from "./components/pages/Interview.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import { RootLayout } from "./components/layout/RootLayout.tsx";
import useAuthContext from "./hooks/useAuthContext.ts";
import PageNotFound from "./components/pages/PageNotFound.tsx";
import { AudioStoreContextProvider } from "./context/AudioStore.tsx";
import { DeepgramContextProvider } from "./context/Deepgram.tsx";
import { MicrophoneContextProvider } from "./context/Microphone.tsx";
import { NowPlayingContextProvider } from "react-nowplaying";

const AppRouter = () => {
  const { user } = useAuthContext();
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          {!user ? (
            <Route index element={<Login />} />
          ) : (
            <Route
              index
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
          )}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <MicrophoneContextProvider>
                  <AudioStoreContextProvider>
                    <NowPlayingContextProvider>
                        <DeepgramContextProvider>
                          <Chat />
                        </DeepgramContextProvider>
                    </NowPlayingContextProvider>
                  </AudioStoreContextProvider>
                </MicrophoneContextProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </>
    )
  );

  return <RouterProvider router={router} />;
};

export default AppRouter;
