import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { CyberBackground } from "@/components/ui/cyber-background";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="dashboard-shell relative flex-1 overflow-y-auto">
        <CyberBackground intensity="low" />
        <div className="relative container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
