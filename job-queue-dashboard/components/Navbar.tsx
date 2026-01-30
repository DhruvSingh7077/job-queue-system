"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:text-white"
    }`;

  return (
    <nav className="flex gap-4 border-b border-gray-700 p-4 mb-6">
      <Link href="/" className={linkClass("/")}>
        Dashboard
      </Link>

      <Link href="/dlq" className={linkClass("/dlq")}>
        Dead Letter Queue
      </Link>
    </nav>
  );
}
