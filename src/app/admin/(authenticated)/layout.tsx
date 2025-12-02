import { AdminNav } from "@/components/layout/AdminNav";

export default function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
