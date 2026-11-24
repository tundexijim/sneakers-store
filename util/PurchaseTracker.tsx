import { CartItem } from "@/types";
export function PurchaseTracker(
  cart: CartItem[],
  value: number | null,
  currency = "NGN",
) {
  const eventId = "purchase_" + Date.now();
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
      { eventID: eventId },
    );
  }
}
