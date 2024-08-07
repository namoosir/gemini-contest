import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Login from "./components/pages/Login.tsx";
import Chat from "./components/pages/Chat.tsx";
import Dashboard from "./components/pages/Dashboard.tsx";
import Interview from "./components/pages/Interview.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import { RootLayout } from "./components/layout/RootLayout.tsx";
import useAuthContext from "./hooks/useAuthContext.ts";
import PageNotFound from "./components/pages/PageNotFound.tsx";
import { NowPlayingContextProvider } from "react-nowplaying";
import Result from "./components/pages/Result.tsx";

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
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          )}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <NowPlayingContextProvider>
                  <Chat />
                </NowPlayingContextProvider>
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
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Result />
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
