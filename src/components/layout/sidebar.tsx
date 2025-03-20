"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [aiChatVisible, setAiChatVisible] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen flex-col border-r border-slate-700 bg-slate-900 shadow-sm">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">Advocate Diary</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          <Link
            href="/cases"
            className={`flex items-center rounded-md p-2 ${
              isActive("/cases") ? "bg-blue-900 text-blue-200 font-medium" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span className="mr-2">📁</span>
            Cases
          </Link>
          
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin/users"
              className={`flex items-center rounded-md p-2 ${
                isActive("/admin/users") ? "bg-blue-900 text-blue-200 font-medium" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="mr-2">👥</span>
              Manage Users
            </Link>
          )}
          
          <button
            onClick={() => setAiChatVisible(!aiChatVisible)}
            className="flex w-full items-center rounded-md p-2 text-slate-300 hover:bg-slate-800"
          >
            <span className="mr-2">🤖</span>
            AI Assistant
          </button>
        </nav>
      </div>
      
      {/* AI Chat Interface (can be expanded later) */}
      {aiChatVisible && (
        <div className="m-4 border border-slate-700 rounded-lg p-4 bg-slate-800 shadow-sm">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium text-slate-200">AI Chat</h3>
            <button 
              onClick={() => setAiChatVisible(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              ×
            </button>
          </div>
          <div className="h-60 overflow-y-auto border border-slate-700 rounded p-2 mb-2 bg-slate-900">
            <div className="p-2 mb-2 bg-blue-900 text-blue-100 rounded">
              How can I help you with your cases today?
            </div>
            {/* Chat messages would go here */}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Ask something..."
              className="flex-1 border border-slate-700 bg-slate-900 text-slate-200 rounded-l p-2"
            />
            <button className="bg-blue-700 text-white p-2 rounded-r hover:bg-blue-600">
              Send
            </button>
          </div>
        </div>
      )}
      
      <div className="border-t border-slate-700 p-4 bg-slate-900">
        <div className="mb-2 text-sm font-medium text-slate-300">
          {session?.user?.name || "User"}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-red-400 hover:text-red-300 hover:underline"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
} 