import UserSidebar from "@/components/UserSidebar";

export default function UserLayout({ children }) {
  return (
    <main className="grid grid-cols-12">
      <div className="col-span-3">
        <UserSidebar />
      </div>
      <div className="col-span-9">{children}</div>
    </main>
  );
}
