// global.d.ts
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

export {};
