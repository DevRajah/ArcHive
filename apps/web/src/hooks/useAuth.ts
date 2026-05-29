"use client";

import { useEffect, useState } from "react";
import {
  ArcHiveSession,
  clearSession,
  getSession,
  saveSession,
} from "@/lib/auth";

export function useAuth() {
  const [session, setSession] = useState<ArcHiveSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setIsLoaded(true);
  }, []);

  function login(nextSession: ArcHiveSession) {
    saveSession(nextSession);
    setSession(nextSession);
  }

  function logout() {
    clearSession();
    setSession(null);
  }

  return {
    session,
    isLoaded,
    isAuthenticated: Boolean(session?.userId),
    login,
    logout,
  };
}