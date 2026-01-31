"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-md text-sm font-medium transition ${
      pathname === path
        ? "bg-blue-600 text-white shadow"
        : "text-blue-600 hover:bg-blue-100"
    }`;

  return (
    <nav className="flex gap-4 border-b border-blue-200 bg-white p-4 mb-6 shadow-sm">
      <Link href="/" className={linkClass("/")}>
        Dashboard
      </Link>

      <Link href="/dlq" className={linkClass("/dlq")}>
        Dead Letter Queue
      </Link>
    </nav>
  );
}
