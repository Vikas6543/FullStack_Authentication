import Link from "next/link";
import React from "react";

const UserSidebar = () => {
  return (
    <main className="h-screen bg-gray-300 shadow">
      <p className="md:text-2xl text-center pt-4">Vikas Shambhu</p>
      <section className="flex flex-col items-center justify-center gap-6 mt-20">
        <Link href="/dashboard">Dashboard</Link>
        {/* <Link href="/change-password">Change Password</Link> */}
        <Link href="/login">Logout</Link>
      </section>
    </main>
  );
};

export default UserSidebar;
