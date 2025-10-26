// ...existing code...
import React, { useState, useRef } from "react";

interface FAQProps {
  header: string;
  body: string;
}

export default function FAQ({ header, body }: FAQProps) {
  const [open, setOpen] = useState<boolean>(false);
  const idRef = useRef<string>(`faq-${Math.random().toString(36).slice(2, 9)}`);

  // convert literal "\n" sequences to actual newlines
  const normalizedBody = body.replace(/\\n/g, "\n");

  return (
    <div className="faq-accordion border-b border-gray-200">
      <button
        id={`${idRef.current}-button`}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${idRef.current}-panel`}
        className="w-full flex items-center justify-between py-3 text-left cursor-pointer"
      >
        <span className="font-semibold text-gray-900 uppercase">{header}</span>
        <span aria-hidden className="ml-3 text-lg leading-none text-gray-700">
          {open ? "−" : "+"}
        </span>
      </button>

      <div
        id={`${idRef.current}-panel`}
        role="region"
        aria-labelledby={`${idRef.current}-button`}
        className={`overflow-hidden transition-all duration-150 ease-in-out ${
          open ? "p-2 h-auto" : "p-0 h-0"
        }`}
      >
        {open && (
          <div className="text-gray-700 whitespace-pre-line">
            {normalizedBody}
          </div>
        )}
      </div>
    </div>
  );
}
