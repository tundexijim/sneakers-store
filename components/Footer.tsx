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
    <footer className="bg-green-600 flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col items-center">
        <img
          src="/paystack.png"
          alt="Paystack"
          className="w-[300px] md:w-[400px]"
        />
        <p className="text-center mt-4 text-sm text-gray-400">
          &copy; {year} DTwears. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
