"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type TransitionPhase = "idle" | "exiting" | "entering";

/**
 * PageTransition
 *
 * Dashboard sayfaları arasında yumuşak geçiş animasyonu.
 * Route değiştiğinde:
 *   1. Eski içerik kısa bir exit animasyonu (0.15s) ile solar
 *   2. Yeni içerik route-enter animasyonu (0.3s) ile gelir
 *
 * key={pathname} yaklaşımından farkı: exit animasyonu da vardır.
 * children dependency array'de KULLANILMAZ — sadece pathname tetikler.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // İlk render: pathname değişmedi, displayChildren zaten doğru
    if (prevPathname.current === pathname) {
      return;
    }

    // Route değişti:
    // 1. Exit animasyonunu başlat (eski içerik kaybolurken)
    setPhase("exiting");

    const exitTimer = setTimeout(() => {
      // 2. Yeni içeriği yerleştir
      setDisplayChildren(children);
      setPhase("entering");

      const enterTimer = setTimeout(() => {
        // 3. Animasyon bitti, idle'a geç
        setPhase("idle");
        prevPathname.current = pathname;
      }, 300); // route-enter süresi

      return () => clearTimeout(enterTimer);
    }, 150); // route-exit süresi

    return () => clearTimeout(exitTimer);
    // SADECE pathname — children ASLA buraya eklenmez
    // children'ın güncel değeri her zaman closure'dan gelir
    // çünkü pathname değiştiğinde component re-render olur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const animationClass =
    phase === "exiting" ? "route-exit" :
    phase === "entering" ? "route-enter" :
    "";

  return (
    <div className={cn("flex-1 min-h-0 flex flex-col", animationClass)} style={animationClass ? undefined : { opacity: 1 }}>
      {displayChildren}
    </div>
  );
}
