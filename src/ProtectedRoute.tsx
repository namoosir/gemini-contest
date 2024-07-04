import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import useAuthContext from "./hooks/useAuthContext";

interface Props {
  children?: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
