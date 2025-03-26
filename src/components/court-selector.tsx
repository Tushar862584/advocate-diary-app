"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

// The court data from your JSON
const COURTS = [
  {
    "name": "Metropolitan Magistrate Court, Andheri",
    "location": "Andheri"
  },
  {
    "name": "Metropolitan Magistrate Court, Bandra",
    "location": "Bandra"
  },
  {
    "name": "Metropolitan Magistrate Court, Borivali",
    "location": "Borivali"
  },
  {
    "name": "Metropolitan Magistrate Court, Kurla",
    "location": "Kurla"
  },
  {
    "name": "Metropolitan Magistrate Court, Vikhroli",
    "location": "Vikhroli"
  },
  {
    "name": "Metropolitan Magistrate Court, Vile Parle",
    "location": "Vile Parle"
  },
  {
    "name": "Metropolitan Magistrate Court, Mulund",
    "location": "Mulund"
  },
  {
    "name": "Metropolitan Magistrate Court, Dadar",
    "location": "Dadar"
  },
  {
    "name": "Metropolitan Magistrate Court, Sewree",
    "location": "Sewree"
  },
  {
    "name": "Metropolitan Magistrate Court, Girgaon",
    "location": "Girgaon"
  }
];

interface CourtSelectorProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  id: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  label?: string;
}

export default function CourtSelector({
  value,
  onChange,
  name,
  id,
  disabled = false,
  placeholder = "Select a court",
  required = false,
  label
}: CourtSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter courts based on search term
  const filteredCourts = COURTS.filter(court => 
    court.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    court.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle court selection
  const handleSelectCourt = (courtName: string) => {
    onChange(courtName);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle opening the dropdown
  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // Clear the selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div
        className={`relative rounded-md border ${
          isOpen ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={handleOpen}
      >
        <div className="flex items-center px-3 py-2">
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
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>

        {/* Hidden actual input */}
        <input
          type="hidden"
          name={name}
          id={id}
          value={value}
          required={required}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg"
        >
          {/* Search input */}
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

          {/* Court list */}
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
                  <div className="text-xs text-gray-500">Location: {court.location}</div>
                </div>
              ))
            ) : (
              <div className="p-2 text-center text-gray-500">No courts found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 