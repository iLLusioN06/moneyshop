import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/components/auth-provider";
import { RouteGuard } from "@/components/route-guard";
import { ErrorBoundary } from "@/components/error-boundary";
import { WebSocketProvider } from "@/components/websocket-provider";
import { PageTransition } from "./page-transition";
import AIChatbot from "@/components/ai-chatbot";
import CommandPalette from "@/components/command-palette";

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
          <main className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 md:p-6">
            <RouteGuard>
              <WebSocketProvider>
                <PageTransition>
                  {children}
                </PageTransition>
              </WebSocketProvider>
            </RouteGuard>
          </main>
        </div>

        {/* AI Chatbot */}
        <AIChatbot />

        {/* Command Palette */}
        <CommandPalette />
      </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}
