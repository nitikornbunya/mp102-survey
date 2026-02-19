"use client";

import AppHeader from "@/app/components/AppHeader";
import BaseForm from "@/app/components/BaseForm";
import LineLoginGate from "@/app/components/LineLoginGate";

export default function Base4Page() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <AppHeader backLink={{ href: "/main", label: "← หน้าหลัก" }} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <LineLoginGate>
          <BaseForm baseId="base4" />
        </LineLoginGate>
      </main>
    </div>
  );
}
