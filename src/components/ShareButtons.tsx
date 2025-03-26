"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, X, Copy, Phone, Check } from "lucide-react";
import { format } from "date-fns";

interface ShareButtonsProps {
  caseDetail: {
    title: string;
    caseType: string;
    registrationNum: string;
    registrationYear: string;
    currentHearing?: Date | null;
    currentPurpose?: string | null; // Purpose of current hearing
    currentNotes?: string | null; // Notes from current hearing
    nextHearing: Date | null;
    nextPurpose: string | null; // Purpose of next hearing
  };
}

export default function ShareButtons({ caseDetail }: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"right" | "left">(
    "right"
  );
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate dropdown position based on viewport
  useEffect(() => {
    function calculatePosition() {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceOnRight = window.innerWidth - rect.right;
        // If there's less than 300px on right side, show dropdown on the left
        setDropdownPosition(spaceOnRight > 300 ? "left" : "right");
      }
    }

    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [isOpen]); // Also recalculate when menu opens

  // Handle clicking outside to close the menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format court number properly
  const courtNumber = `${caseDetail.registrationYear}/${caseDetail.registrationNum}`;

  // Format case info for sharing - with proper grouping and clear labels
  const caseInfo = `Case: ${caseDetail.title}
Type: ${caseDetail.caseType}
Court Number: ${courtNumber}
${
  caseDetail.currentHearing
    ? `\n--- CURRENT HEARING ---
Date: ${format(caseDetail.currentHearing, "PPP")}${
        caseDetail.currentPurpose
          ? `\nPurpose: ${caseDetail.currentPurpose}`
          : ""
      }${caseDetail.currentNotes ? `\nNotes: ${caseDetail.currentNotes}` : ""}`
    : ""
}
${
  caseDetail.nextHearing
    ? `\n--- NEXT HEARING ---
Date: ${format(caseDetail.nextHearing, "PPP")}${
        caseDetail.nextPurpose ? `\nPurpose: ${caseDetail.nextPurpose}` : ""
      }`
    : ""
}`;

  // Function to handle sharing via WhatsApp
  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(caseInfo)}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  };

  // Function to copy text to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(caseInfo);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative" ref={shareMenuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-white hover:bg-green-700 transition-colors whitespace-nowrap shadow-sm"
        aria-label="Share case"
      >
        <Share2 className="w-4 h-6 mr-1 xs:mr-2" />
        <span className="hidden xs:inline">Share</span>
      </button>

      {/* Share options dropdown with responsive positioning */}
      {isOpen && (
        <div
          className={`fixed sm:absolute mt-2 w-full max-w-xs sm:w-80 rounded-lg shadow-lg bg-white border border-gray-200 z-40 
          ${dropdownPosition === "right" ? "right-0" : "left-0"}
          ${window.innerWidth < 640 ? "inset-x-0 mx-auto top-20" : ""}`}
          style={{
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div className="py-1">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">
                  Share Case Details
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="bg-gray-50 p-3 rounded-md mb-3">
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  <p className="mb-2 font-medium text-gray-900">
                    {caseDetail.title}
                  </p>
                  <p className="mb-1">
                    Type:{" "}
                    <span className="font-medium">{caseDetail.caseType}</span>
                  </p>
                  <p className="mb-3">
                    Court Number:{" "}
                    <span className="font-medium">{courtNumber}</span>
                  </p>

                  {caseDetail.currentHearing && (
                    <div className="mb-3 border-t border-gray-200 pt-2">
                      <p className="font-semibold text-blue-800 mb-1">
                        Current Hearing:
                      </p>
                      <p>
                        Date:{" "}
                        <span className="font-medium">
                          {format(caseDetail.currentHearing, "PPP")}
                        </span>
                      </p>
                      {caseDetail.currentPurpose && (
                        <p>
                          Purpose:{" "}
                          <span className="font-medium">
                            {caseDetail.currentPurpose}
                          </span>
                        </p>
                      )}
                      {caseDetail.currentNotes && (
                        <p>
                          Notes:{" "}
                          <span className="italic text-gray-600">
                            {caseDetail.currentNotes}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {caseDetail.nextHearing && (
                    <div className="border-t border-gray-200 pt-2">
                      <p className="font-semibold text-green-700 mb-1">
                        Next Hearing:
                      </p>
                      <p>
                        Date:{" "}
                        <span className="font-medium">
                          {format(caseDetail.nextHearing, "PPP")}
                        </span>
                      </p>
                      {caseDetail.nextPurpose && (
                        <p>
                          Purpose:{" "}
                          <span className="font-medium">
                            {caseDetail.nextPurpose}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm bg-[#25D366] text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mr-2"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Share on WhatsApp
                </button>

                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {copySuccess ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Copied to clipboard!
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy to clipboard
                    </>
                  )}
                </button>

                <a
                  href={`sms:?body=${encodeURIComponent(caseInfo)}`}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Phone size={16} className="mr-2" />
                  Share via SMS
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && window.innerWidth < 640 && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
