import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Header from "~/Layout/header";
import { useAppDispatch } from "~/store/hooks";
import { useEffect } from "react";
import { initializeAuth } from "~/store/features/auth/authSlice";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);
  return (
    <>
      <Welcome />
    </>
  );
}
