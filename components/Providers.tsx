"use client";

import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/authContext";
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <AuthProvider>{children}</AuthProvider>
    </CartProvider>
  );
}
