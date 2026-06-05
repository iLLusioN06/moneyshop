// =============================================
// MoneyShop - NextAuth v5 Tip Genişletmeleri
// =============================================

import { type UserRole } from "./index";

declare module "@auth/core/types" {
  interface User {
    role?: UserRole | null;
  }
}

export {};
