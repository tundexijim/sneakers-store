import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

interface PurchaseTrackerProps {
  value: number | null; // order amount
  currency?: string; // default to NGN
}

export default function PurchaseTracker({
  value,
  currency = "NGN",
}: PurchaseTrackerProps) {
  const eventId = "purchase_" + Date.now();
  const { cart, clearCart } = useCart();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq !== "undefined") {
      window.fbq(
        "track",
        "Purchase",
        {
          content_ids: cart.map((item) => item.slug),
          content_type: "product_group",
          value,
          currency,
        },
        { eventID: eventId }
      );
    }
    clearCart();
  }, [value, currency]);

  return null; // nothing to render
}
