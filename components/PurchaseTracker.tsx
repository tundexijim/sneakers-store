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

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq !== "undefined") {
      window.fbq(
        "track",
        "Purchase",
        {
          value,
          currency,
        },
        { eventID: eventId }
      );
    }
  }, [value, currency]);

  return null; // nothing to render
}
