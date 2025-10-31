import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface WhatsAppFloatingButtonProps {
  phoneNumber: string; // Phone number in international format (e.g., "2348123456789")
  message?: string; // Default message
  position?: "bottom-right" | "bottom-left";
  showTooltip?: boolean;
}

export default function WhatsAppFloatingButton({
  phoneNumber,
  message = "Hello! I am interested in your products.",
  position = "bottom-right",
  showTooltip = true,
}: WhatsAppFloatingButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const eventId = "whatsappclick_" + Date.now();

  // Show button after page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (showTooltip) {
        setTimeout(() => setShowTooltipState(true), 1000);
        setTimeout(() => setShowTooltipState(false), 5000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [showTooltip]);

  const handleWhatsAppClick = () => {
    if (typeof window !== "undefined" && typeof window.fbq !== "undefined") {
      window.fbq(
        "trackCustom",
        "WhatsAppClick",
        {
          location: "floating_button",
          timestamp: new Date().toISOString(),
        },
        { eventID: eventId }
      );
    }
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  return (
    <>
      {/* WhatsApp Floating Button */}
      <div
        className={`fixed ${
          positionClasses[position]
        } z-50 transition-all duration-500 ease-in-out ${
          isVisible
            ? "transform translate-y-0 opacity-100"
            : "transform translate-y-20 opacity-0"
        }`}
      >
        {/* Tooltip */}
        {showTooltipState && (
          <div
            className={`absolute bottom-full mb-3 ${
              position === "bottom-right" ? "right-0" : "left-0"
            } bg-white shadow-lg rounded-lg p-3 min-w-[200px] max-w-[280px] border animate-bounce`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Need help? Chat with us!
                </p>
                <p className="text-xs text-gray-600">
                  We typically reply within minutes
                </p>
              </div>
              <button
                onClick={() => setShowTooltipState(false)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
            {/* Tooltip Arrow */}
            <div
              className={`absolute top-full ${
                position === "bottom-right" ? "right-4" : "left-4"
              } w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white`}
            />
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={handleWhatsAppClick}
          className="group relative w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95"
          aria-label="Chat on WhatsApp"
        >
          {/* Ripple Effect */}
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>

          {/* WhatsApp Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="#ffffff"
            className="bi bi-whatsapp"
            viewBox="0 0 16 16"
          >
            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
          </svg>
          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </button>
      </div>

      {/* Backdrop for mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          .whatsapp-button {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </>
  );
}
