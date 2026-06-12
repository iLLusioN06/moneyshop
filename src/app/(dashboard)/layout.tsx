import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/components/auth-provider";
import { RouteGuard } from "@/components/route-guard";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageTransition } from "./page-transition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ErrorBoundary>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <RouteGuard>
              <PageTransition>
                {children}
              </PageTransition>
            </RouteGuard>
          </main>
        </div>
      </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}
