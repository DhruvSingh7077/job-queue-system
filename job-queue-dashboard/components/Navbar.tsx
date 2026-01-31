// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// export default function Navbar() {
//   const pathname = usePathname();

//   const linkClass = (path: string) =>
//     `relative px-4 py-2 rounded-lg text-sm font-medium transition-all
//      ${
//        pathname === path
//          ? "text-blue-600"
//          : "text-slate-600 hover:text-blue-600"
//      }`;

//   return (
//     <nav className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-slate-200 shadow-sm">
//       <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
//         <h1 className="font-bold text-lg text-slate-800">
//           Job Queue
//         </h1>

//         <div className="flex gap-6">
//           <Link href="/" className={linkClass("/")}>
//             Dashboard
//           </Link>
//           <Link href="/dlq" className={linkClass("/dlq")}>
//             Dead Letter
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition
   ${
     pathname === path
       ? "bg-indigo-600/20 text-indigo-400"
       : "text-slate-300 hover:text-white hover:bg-slate-800"
   }`;

  return (
   <nav className="sticky top-0 z-50 backdrop-blur bg-slate-950/80 border-b border-slate-800 shadow">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-white">

          Job Queue
        </h1>

        <div className="flex gap-6">
          <Link href="/" className={linkClass("/")}>
            Dashboard
          </Link>
          <Link href="/dlq" className={linkClass("/dlq")}>
            Dead Letter
          </Link>
        </div>
      </div>
    </nav>
  );
}
