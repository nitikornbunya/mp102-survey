import { Suspense } from "react";
import HomeClient from "./HomeClient";

export const runtime = "edge";

function getEditProfile(value: string | string[] | undefined): boolean {
  if (value === undefined) return false;
  const v = Array.isArray(value) ? value[0] : value;
  return v === "1";
}

type SearchParams = { [key: string]: string | string[] | undefined };
type PageProps = {
  searchParams: Promise<SearchParams> | SearchParams;
};

function HomeFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff6a13] border-t-transparent" />
      <p className="text-zinc-500">กำลังโหลด...</p>
    </div>
  );
}

export default async function Home({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const editProfile = getEditProfile(params.editProfile);
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeClient editProfile={editProfile} />
    </Suspense>
  );
}
