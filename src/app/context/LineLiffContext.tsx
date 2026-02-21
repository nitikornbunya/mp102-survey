"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import liff from "@line/liff";

export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};

type LineLiffState = {
  isReady: boolean;
  isLoggedIn: boolean;
  profile: LineProfile | null;
  error: string | null;
  login: () => void;
  logout: () => void;
};

const LineLiffContext = createContext<LineLiffState | null>(null);

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? "";

export function LineLiffProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<LineProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(() => {
    try {
      liff.login();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เรียก login ไม่สำเร็จ";
      if (typeof window !== "undefined") console.error("[LIFF login error]", err);
      setError(msg);
    }
  }, []);

  const logout = useCallback(() => {
    liff.logout();
    setProfile(null);
    setIsLoggedIn(false);
  }, []);

  useEffect(() => {
    if (!LIFF_ID) {
      setError("ไม่ได้ตั้งค่า NEXT_PUBLIC_LIFF_ID");
      setIsReady(true);
      return;
    }

    liff
      .init({ liffId: LIFF_ID })
      .then(() => {
        setIsLoggedIn(liff.isLoggedIn());
        if (liff.isLoggedIn()) {
          return liff.getProfile().then((p) => {
            setProfile({
              userId: p.userId,
              displayName: p.displayName ?? "",
              pictureUrl: p.pictureUrl,
            });
          });
        }
      })
      .catch((err) => {
        const msg = err?.message ?? err?.toString?.() ?? "LIFF init ไม่สำเร็จ";
        if (typeof window !== "undefined") console.error("[LIFF init error]", err);
        setError(msg);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  const value: LineLiffState = {
    isReady,
    isLoggedIn,
    profile,
    error,
    login,
    logout,
  };

  return (
    <LineLiffContext.Provider value={value}>
      {children}
    </LineLiffContext.Provider>
  );
}

export function useLineLiff() {
  const ctx = useContext(LineLiffContext);
  if (!ctx) throw new Error("useLineLiff ต้องใช้ภายใน LineLiffProvider");
  return ctx;
}
