import { useState, useEffect } from "react";

export const useScrollDirection = (threshold: number = 10) => {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null
  );
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if we're at the top
      setIsAtTop(currentScrollY < 10);

      // Only update direction if scroll difference is greater than threshold
      if (Math.abs(currentScrollY - prevScrollY) < threshold) {
        return;
      }

      if (currentScrollY > prevScrollY && currentScrollY > 80) {
        // Scrolling down and past a certain point
        setScrollDirection("down");
      } else if (currentScrollY < prevScrollY) {
        // Scrolling up
        setScrollDirection("up");
      }

      setPrevScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [prevScrollY, threshold]);

  return { scrollDirection, isAtTop };
};
