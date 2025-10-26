import { X } from "lucide-react";
import { useState, useEffect } from "react";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(price);
};

type Props = {
  topbanner: boolean;
  settopbanner: (topbanner: boolean) => void;
};

export default function DTwears({ topbanner, settopbanner }: Props) {
  const text = [
    `Free shipping for orders above ${formatPrice(100000)}.`,
    "Welcome to DTwears",
    "Payment on delivery available nationwide.",
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
      {topbanner && (
        <div className="w-full h-10 bg-[#00C8C8] items-center justify-center flex px-4 md:px-16 text-white relative">
          <p className="text-[12px] md:text-[16px] transition-opacity duration-300">
            {text[index]}
          </p>
          <div
            onClick={() => settopbanner(false)}
            className="absolute right-4 cursor-pointer"
          >
            <X />
          </div>
        </div>
      )}
    </>
  );
}
