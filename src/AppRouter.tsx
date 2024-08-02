import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import Login from "./components/pages/Login.tsx";
import Home from "./components/pages/Home.tsx";
import Voice from "./components/pages/Voice.tsx";
import Test from "./components/pages/Test.tsx";
import Chat from "./components/pages/Chat.tsx";
import Interview from "./components/pages/Interview.tsx";
import ResumeForm from "./components/ResumeForm.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import { RootLayout } from "./components/layout/RootLayout.tsx";
import useAuthContext from "./hooks/useAuthContext.tsx";
import PageNotFound from "./components/pages/PageNotFound.tsx";

const AppRouter = () => {
  const { user } = useAuthContext();
  const router = createBrowserRouter(

    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          {!user ?
            <Route index element={<Login />} /> :
            <Route
              index
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
          }
          <Route
            path="/voice"
            element={
              <ProtectedRoute>
                <Voice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <Test />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
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
            path="/resume-form"
            element={
              <ProtectedRoute>
                <ResumeForm />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<PageNotFound/>}/>
        </Route>
      </>
    )
  )

  return (
    <RouterProvider router={router} />
  );
};

export default AppRouter;
