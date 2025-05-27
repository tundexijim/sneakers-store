import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useIsClient } from "@/hooks/useIsClient";

export default function DTwears() {
  const text = ["Welcome to DTwears", "You are Welcome"];
  const [index, setIndex] = useState(0);
  const isClient = useIsClient();

  if (!isClient) return null;
  return (
    <div className="w-screen h-10 bg-purple-600 items-center justify-between flex px-4 md:px-16">
      <button
        onClick={() =>
          setIndex((prev) => (prev === 0 ? text.length - 1 : prev - 1))
        }
      >
        <ChevronLeft className="text-white" />
      </button>
      <p className="text-amber-50">{text[index]}</p>
      <button
        onClick={() =>
          setIndex((prev) => (prev === text.length - 1 ? 0 : prev + 1))
        }
      >
        {" "}
        <ChevronRight className="text-white" />
      </button>
    </div>
  );
}
