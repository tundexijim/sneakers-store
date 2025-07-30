"use client";

import { ReactNode } from "react";
import { CartProvider } from "./CartContext";
import { AuthProvider } from "./authContext";
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <AuthProvider>{children}</AuthProvider>
    </CartProvider>
  );
}
