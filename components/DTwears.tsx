import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useIsClient } from "@/hooks/useIsClient";

export default function DTwears() {
  const text = ["Welcome to DTwears", "You are Welcome"];
  const [index, setIndex] = useState(0);
  const isClient = useIsClient();

  if (!isClient) return null;
  return (
    <div className="w-screen h-12 bg-white items-center justify-between flex px-4 md:px-16 text-black">
      <button
        onClick={() =>
          setIndex((prev) => (prev === 0 ? text.length - 1 : prev - 1))
        }
      >
        <ChevronLeft className="" />
      </button>
      <p className="">{text[index]}</p>
      <button
        onClick={() =>
          setIndex((prev) => (prev === text.length - 1 ? 0 : prev + 1))
        }
      >
        {" "}
        <ChevronRight className="" />
      </button>
    </div>
  );
}
