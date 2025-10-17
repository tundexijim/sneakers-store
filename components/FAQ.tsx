// ...existing code...
import React, { useState, useRef } from "react";

interface FAQProps {
  header: string;
  body: string;
}

/**
 * FAQ accordion - TypeScript version
 * Props:
 *  - header: string - visible title
 *  - body: string   - panel content shown when open
 */
export default function FAQ({ header, body }: FAQProps) {
  const [open, setOpen] = useState<boolean>(false);
  const idRef = useRef<string>(`faq-${Math.random().toString(36).slice(2, 9)}`);

  // If the incoming string contains the literal sequence "\n" (backslash + n)
  // convert that to an actual newline character so CSS pre-line can render it.
  const normalizedBody = body.replace(/\\n/g, "\n");

  return (
    <div
      className="faq-accordion"
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <button
        id={`${idRef.current}-button`}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`${idRef.current}-panel`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontWeight: 600 }}>{header}</span>
        <span
          aria-hidden
          style={{ marginLeft: 12, fontSize: 18, lineHeight: 1 }}
        >
          {open ? "−" : "+"}
        </span>
      </button>

      <div
        id={`${idRef.current}-panel`}
        role="region"
        aria-labelledby={`${idRef.current}-button`}
        style={{
          padding: open ? "12px 16px" : "0 16px",
          height: open ? "auto" : 0,
          overflow: "hidden",
          transition: "padding 160ms ease, height 160ms ease",
        }}
      >
        {open && (
          <div style={{ color: "#374151", whiteSpace: "pre-line" }}>
            {normalizedBody}
          </div>
        )}
      </div>
    </div>
  );
}
// ...existing code...
