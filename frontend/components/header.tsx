"use client";

import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white px-6 py-4">
      <Link href="/dashboard" className="cursor-pointer">
        <h1 className="text-xl font-bold text-emerald-700">ShawCare</h1>
        <p className="text-xs text-muted-foreground">Pharmacy System</p>
      </Link>
    </header>
  );
}
