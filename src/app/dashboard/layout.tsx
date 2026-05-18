import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <main className="dashboard-shell flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
