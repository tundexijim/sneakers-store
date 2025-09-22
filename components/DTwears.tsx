import { X } from "lucide-react";
import { useState, useEffect } from "react";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(price);
};

type Props = {
  icon: boolean;
  setIcon: (icon: boolean) => void;
};

export default function DTwears({ icon, setIcon }: Props) {
  const text = [
    `Free shipping for orders above ${formatPrice(100000)}.`,
    "Welcome to DTwears",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev === text.length - 1 ? 0 : prev + 1));
    }, 7000);

    return () => clearInterval(interval);
  }, [text.length]);

  return (
    <>
      {icon && (
        <div className="w-full h-12 bg-blue-900 items-center justify-center flex px-4 md:px-16 text-white relative">
          <p className="text-[12px] md:text-[16px] transition-opacity duration-300">
            {text[index]}
          </p>
          <div
            onClick={() => setIcon(false)}
            className="absolute right-4 cursor-pointer"
          >
            <X />
          </div>
        </div>
      )}
    </>
  );
}
