"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/vrgame", label: "VR Game" },
  { href: "/retail", label: "Merchandise" },
  { href: "/about", label: "About us" },
];

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHome = pathname === "/";

  const go = (href: string) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      className={`fixed top-4 z-50 right-4 left-4 lg:left-14 mx-auto
        flex items-center px-4 lg:px-6 py-3
        text-white rounded-2xl shadow-lg w-[95%] lg:w-[90%] max-w-5xl ${
          isHome ? "bg-black/60 backdrop-blur-md" : "bg-[#99160B]"
        }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => router.push("/")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Aankhin Dekha Logo.png"
          alt="Aankhon Dekha Logo"
          className="h-8 lg:h-10 w-auto drop-shadow-[0_0_10px_#00ffcc]"
        />
      </div>

      <div className="flex-1" />

      {/* Desktop links */}
      <div className="hidden lg:flex gap-8 text-sm font-semibold">
        {links.map((link) => (
          <button
            key={link.href}
            onClick={() => router.push(link.href)}
            className="hover:text-[#96FF00]"
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Hamburger (mobile) */}
      <button
        onClick={() => setIsMenuOpen((o) => !o)}
        className="lg:hidden p-2 rounded-full hover:bg-white/10"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Profile */}
      <button
        onClick={() => router.push("/login")}
        className="p-2 rounded-full hover:bg-white/10 ml-2"
        aria-label="Profile"
      >
        <User size={22} />
      </button>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute top-full mt-2 right-0 left-0 bg-black/80 backdrop-blur-md rounded-2xl shadow-lg p-4 lg:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex flex-col gap-4 text-sm font-semibold">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => go(link.href)}
                  className="hover:text-[#96FF00] text-left"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
