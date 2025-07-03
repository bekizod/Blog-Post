import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";
import type { RootState } from "~/store";

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
