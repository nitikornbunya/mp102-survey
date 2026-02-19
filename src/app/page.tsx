import { Suspense } from "react";
import HomeWithParams from "./HomeWithParams";

export const dynamic = "force-static";

function HomeFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff6a13] border-t-transparent" />
      <p className="text-zinc-500">กำลังโหลด...</p>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeWithParams />
    </Suspense>
  );
}
