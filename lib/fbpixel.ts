// lib/fbpixel.js
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export const pageview = () => {
  if (typeof window.fbq !== "undefined") {
    window.fbq("track", "PageView");
  }
};
