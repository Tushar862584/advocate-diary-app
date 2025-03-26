"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import { Search, X } from "lucide-react";

const COURTS = [
  {
    name: "Metropolitan Magistrate Court, Andheri",
    location: "Andheri",
  },
  {
    name: "Metropolitan Magistrate Court, Bandra",
    location: "Bandra",
  },
  {
    name: "Metropolitan Magistrate Court, Borivali",
    location: "Borivali",
  },
  {
    name: "Metropolitan Magistrate Court, Kurla",
    location: "Kurla",
  },
  {
    name: "Metropolitan Magistrate Court, Vikhroli",
    location: "Vikhroli",
  },
  {
    name: "Metropolitan Magistrate Court, Vile Parle",
    location: "Vile Parle",
  },
  {
    name: "Metropolitan Magistrate Court, Mulund",
    location: "Mulund",
  },
  {
    name: "Metropolitan Magistrate Court, Dadar",
    location: "Dadar",
  },
  {
    name: "Metropolitan Magistrate Court, Sewree",
    location: "Sewree",
  },
  {
    name: "Metropolitan Magistrate Court, Girgaon",
    location: "Girgaon",
  },
];

interface CourtSelectorProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const CourtSelector = forwardRef<HTMLDivElement, CourtSelectorProps>(
  (
    {
      id,
      name,
      value,
      onChange,
      required = false,
      label = "Court",
      disabled = false,
      onKeyDown,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const selectorRef = useRef<HTMLDivElement>(null);

    const setRefs = (element: HTMLDivElement | null) => {
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
      selectorRef.current = element;
    };

    const filteredCourts = COURTS.filter(
      (court) =>
        court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        court.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (onKeyDown) {
        onKeyDown(e);
      }

      if ((e.key === "Enter" || e.key === " ") && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleSelectCourt = (courtName: string) => {
      onChange(courtName);
      setIsOpen(false);
      setSearchTerm("");
    };

    const handleOpen = () => {
      if (!disabled) {
        setIsOpen(true);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
    };

    return (
      <div className="relative">
        <label
          htmlFor={id || "courtName"}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && "*"}
        </label>

        <div
          ref={setRefs}
          tabIndex={disabled ? -1 : 0}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
        >
          {value ? (
            <div className="flex items-center justify-between w-full">
              <span>{value}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <span className="text-gray-500">Select Court</span>
          )}
        </div>

        <input
          type="hidden"
          name={name}
          id={id}
          value={value}
          required={required}
        />

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg"
          >
            <div className="sticky top-0 p-2 border-b border-gray-200 bg-white z-10">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courts..."
                  className="w-full rounded-md border border-gray-300 pl-8 pr-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-2">
              {filteredCourts.length > 0 ? (
                filteredCourts.map((court, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded p-2 hover:bg-blue-50 ${
                      value === court.name ? "bg-blue-100 text-blue-800" : ""
                    }`}
                    onClick={() => handleSelectCourt(court.name)}
                  >
                    <div className="font-medium">{court.name}</div>
                    <div className="text-xs text-gray-500">
                      Location: {court.location}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">
                  No courts found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

CourtSelector.displayName = "CourtSelector";

export default CourtSelector;
