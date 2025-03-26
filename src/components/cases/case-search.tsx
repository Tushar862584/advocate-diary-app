"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";

interface CaseSearchProps {
  onSearch: (searchParams: SearchParams) => void;
}

export interface SearchParams {
  query: string;
  field: string;
}

export default function CaseSearch({ onSearch }: CaseSearchProps) {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, field });
  };

  const clearSearch = () => {
    setQuery("");
    setField("all");
    onSearch({ query: "", field: "all" });
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="flex items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cases..."
              className="block w-full pl-10 pr-10 py-2 rounded-md border border-slate-700 bg-slate-800 text-slate-200 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-slate-500 hover:text-slate-300" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilter(!showFilter)}
            className="ml-2 p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 focus:outline-none"
          >
            <Filter className="h-4 w-4" />
          </button>
          <button
            type="submit"
            className="ml-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </div>

        {showFilter && (
          <div className="bg-slate-800 p-3 rounded-md border border-slate-700 animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="text-sm text-slate-300 mb-2">Search in:</div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-blue-600 focus:ring-blue-500 h-3 w-3"
                  name="searchField"
                  value="all"
                  checked={field === "all"}
                  onChange={() => setField("all")}
                />
                <span className="ml-1.5 text-sm text-slate-300">All Fields</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-blue-600 focus:ring-blue-500 h-3 w-3"
                  name="searchField"
                  value="caseNumber"
                  checked={field === "caseNumber"}
                  onChange={() => setField("caseNumber")}
                />
                <span className="ml-1.5 text-sm text-slate-300">Case Number</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-blue-600 focus:ring-blue-500 h-3 w-3"
                  name="searchField"
                  value="title"
                  checked={field === "title"}
                  onChange={() => setField("title")}
                />
                <span className="ml-1.5 text-sm text-slate-300">Title</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-blue-600 focus:ring-blue-500 h-3 w-3"
                  name="searchField"
                  value="parties"
                  checked={field === "parties"}
                  onChange={() => setField("parties")}
                />
                <span className="ml-1.5 text-sm text-slate-300">Parties</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-blue-600 focus:ring-blue-500 h-3 w-3"
                  name="searchField"
                  value="court"
                  checked={field === "court"}
                  onChange={() => setField("court")}
                />
                <span className="ml-1.5 text-sm text-slate-300">Court</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-blue-600 focus:ring-blue-500 h-3 w-3"
                  name="searchField"
                  value="caseType"
                  checked={field === "caseType"}
                  onChange={() => setField("caseType")}
                />
                <span className="ml-1.5 text-sm text-slate-300">Case Type</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio text-blue-600 focus:ring-blue-500 h-3 w-3"
                  name="searchField"
                  value="status"
                  checked={field === "status"}
                  onChange={() => setField("status")}
                />
                <span className="ml-1.5 text-sm text-slate-300">Status</span>
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 