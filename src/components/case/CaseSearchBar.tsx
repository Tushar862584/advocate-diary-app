"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function CaseSearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debounce search queries to avoid excessive filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query, onSearch]);

  return (
    <div className="relative w-full mb-4">
      <div
        className={`flex items-center w-full rounded-lg border ${
          isSearchFocused
            ? "border-blue-500 ring-1 ring-blue-500"
            : "border-slate-600"
        } bg-slate-700 px-3 py-2 transition-all`}
      >
        <Search
          className={`h-5 w-5 mr-2 ${
            isSearchFocused ? "text-blue-400" : "text-slate-400"
          }`}
        />
        <input
          type="text"
          placeholder="Search cases by title, parties, court, case number, advocate..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="flex-1 bg-transparent border-0 outline-none text-slate-200 placeholder-slate-400 text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="ml-2 text-slate-400 hover:text-slate-200"
          >
            <span className="sr-only">Clear search</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
