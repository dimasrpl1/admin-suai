"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="text-xl text-black font-bold">Admin Panel</div>

      {/* Hamburger Button (Mobile) */}
      <button
        className="md:hidden text-gray-700"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menu Items */}
      <div
        className={`${
          menuOpen ? "block" : "hidden"
        } absolute top-16 left-0 w-full bg-white shadow-md md:shadow-none md:bg-transparent md:static md:flex md:gap-6`}
      >
        <Link
          href="/admin"
          className="block px-4 py-2 text-gray-700 hover:text-blue-600 md:p-0"
        >
          Berita
        </Link>
        <button
          onClick={handleLogout}
          className="block px-4 py-2 text-red-600 hover:text-red-700 md:p-0"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
