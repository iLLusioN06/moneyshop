"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ADMIN_ROUTES } from "@/lib/permissions";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
    const isAdmin = session?.user?.role === "ADMIN";

    if (isAdminRoute && !isAdmin && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/dashboard");
    }
  }, [status, session, pathname, router]);

  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <div className="flex-1 min-h-0 flex flex-col">{children}</div>;
}
