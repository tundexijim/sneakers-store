import { useEffect, useState } from "react";
import { useIsClient } from "@/hooks/useIsClient";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);
  const isClient = useIsClient();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (!isClient) return null;

  return (
    <footer className="bg-black mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
        &copy; {year ?? ""} DTwears. All rights reserved.
      </div>
    </footer>
  );
}
