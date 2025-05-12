"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-100 mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
        &copy; {year ?? ""} SneakerStore. All rights reserved.
      </div>
    </footer>
  );
}
