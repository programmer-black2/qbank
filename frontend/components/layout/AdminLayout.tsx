import RoleGuard from "@/components/guards/RoleGuard";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RoleGuard allowedRoles={["Admin"]} loginPath="/admin/login">
      {children}
    </RoleGuard>
  );
}
