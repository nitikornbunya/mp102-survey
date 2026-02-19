"use client";

import { useSearchParams } from "next/navigation";
import HomeClient from "./HomeClient";

function getEditProfile(value: string | string[] | null): boolean {
  if (value == null) return false;
  const v = Array.isArray(value) ? value[0] : value;
  return v === "1";
}

export default function HomeWithParams() {
  const searchParams = useSearchParams();
  const editProfile = getEditProfile(searchParams.get("editProfile"));
  return <HomeClient editProfile={editProfile} />;
}
