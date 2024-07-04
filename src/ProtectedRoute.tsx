import { Navigate } from "react-router-dom";
import React, { ReactNode } from "react";
import { User } from "firebase/auth";

interface Props {
  user?: User | null;
  children?: ReactNode;
  // any props that come into the component
}

const ProtectedRoute = ({ user, children }: Props) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
