"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import WriterManagementPanel from "@/components/writer/WriterManagementPanel";

export default function AdminWritersPage() {
  return (
    <AdminLayout>
      <WriterManagementPanel />
    </AdminLayout>
  );
}
