"use client";
import Link from "next/link";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

const Navbar = () => {
  const [isAuth, setIsAuth] = useState(null);

  return (
    <nav className="bg-gray-800">
      <div className="flex items-center justify-end gap-5 py-4 text-white mx-5">
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>
    </nav>
  );
};

export default Navbar;
