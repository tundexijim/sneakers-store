import { useState, useEffect } from "react";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(price);
};

export default function DTwears() {
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
    <div className="w-full h-12 bg-amber-400 items-center justify-center flex px-4 md:px-16 text-gray-800">
      <p className="text-center text-[12px] transition-opacity duration-300">
        {text[index]}
      </p>
    </div>
  );
}
