"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import {
  Home,
  Gavel,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Lock,
  Bot,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  // Initialize collapsed state from localStorage and screen width
  useEffect(() => {
    try {
      // Check localStorage first for user preference
      const savedPreference = localStorage.getItem("sidebarCollapsed");

      // Set initial state based on screen width or saved preference
      const handleResize = () => {
        const shouldCollapseByWidth = window.innerWidth < 1024;

        // If we have a saved preference, use that instead of auto-deciding
        let finalCollapsedState = shouldCollapseByWidth;
        if (savedPreference !== null) {
          finalCollapsedState = savedPreference === "true";
        } else if (shouldCollapseByWidth) {
          // Only save the auto-decision if it's collapsed
          localStorage.setItem("sidebarCollapsed", "true");
        }

        setCollapsed(finalCollapsedState);
        if (onCollapseChange) {
          onCollapseChange(finalCollapsedState);
        }
      };

      // Set initial state
      handleResize();

      // Add listener for future resizes
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      // If localStorage is not available, just use screen width
      const shouldCollapseByWidth = window.innerWidth < 1024;
      setCollapsed(shouldCollapseByWidth);
      if (onCollapseChange) {
        onCollapseChange(shouldCollapseByWidth);
      }
    }
  }, [onCollapseChange]);

  const isActive = (path: string) => {
    // Special case for admin routes to prevent /admin highlighting when on sub-pages
    if (path === "/admin") {
      return pathname === "/admin";
    }

    // For all other paths, use the standard check
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleCollapse = useCallback(() => {
    try {
      const newCollapsed = !collapsed;
      // Save user preference to localStorage
      localStorage.setItem("sidebarCollapsed", String(newCollapsed));
      setCollapsed(newCollapsed);
      if (onCollapseChange) {
        onCollapseChange(newCollapsed);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      // If localStorage is not available, just toggle state
      const newCollapsed = !collapsed;
      setCollapsed(newCollapsed);
      if (onCollapseChange) {
        onCollapseChange(newCollapsed);
      }
    }
  }, [collapsed, onCollapseChange]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const navItems = [
    {
      href: "/admin",
      label: "Admin Dashboard",
      icon: <LayoutDashboard size={20} strokeWidth={1.75} />,
      condition: isAdmin,
    },
    {
      href: "/cases",
      label: "Cases",
      icon: <Gavel size={20} strokeWidth={1.75} />,
      condition: !isAdmin,
    },
    {
      href: "/chatbot",
      label: "Legal Assistant",
      icon: <Bot size={20} strokeWidth={1.75} />,
      condition: true,
    },
    {
      href: "/profile/change-password",
      label: "Change Password",
      icon: <Lock size={20} strokeWidth={1.75} />,
      condition: true,
    },
    /* {
      href: "/admin/users",
      label: "Manage Users",
      icon: <Users size={20} strokeWidth={1.75} />,
      condition: isAdmin,
    },
    {
      href: "/admin/cases",
      label: "Case Management",
      icon: <Gavel size={20} strokeWidth={1.75} />,
      condition: isAdmin,
    }, */
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-800 p-4 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-bold text-blue-400">Advocate Diary</h1>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex md:flex-col md:fixed md:h-screen border-r border-slate-700 bg-slate-800 shadow-lg transition-sidebar z-20 ${
          collapsed ? "md:w-16" : "md:w-64"
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold text-blue-400">Advocate Diary</h1>
          )}
          {collapsed && <Gavel size={20} className="text-blue-400 mx-auto" />}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2">
          <nav className="space-y-1">
            {navItems.map(
              (item) =>
                item.condition && (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-md p-2 text-base transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-600 text-white font-medium shadow-sm"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.label : ""}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    <div className={collapsed ? "mx-auto" : "mr-3"}>
                      {item.icon}
                    </div>
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                )
            )}
          </nav>
        </div>

        <div
          className={`p-2 border-t border-slate-700 ${
            collapsed ? "flex flex-col items-center" : ""
          }`}
        >
          {!collapsed && (
            <div className="flex items-center mb-3 p-2 rounded-md bg-slate-700/50">
              <UserCircle
                size={22}
                className="text-blue-400 mr-3 flex-shrink-0"
              />
              <div className="text-sm text-slate-200 font-medium truncate">
                {session?.user?.name || "User"}
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className={`flex items-center rounded-md p-2 text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-colors ${
              collapsed ? "justify-center w-10 h-10" : "w-full"
            }`}
            title={collapsed ? "Sign Out" : ""}
            aria-label="Sign out"
          >
            <LogOut size={20} className={collapsed ? "" : "mr-3"} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu with backdrop */}
      <div
        onClick={toggleMobileMenu}
        className={`md:hidden fixed inset-0 bg-slate-900/60 z-20 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile menu drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 shadow-lg transition-transform duration-300 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-screen pt-16 pb-16 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2 mt-4">
              {navItems.map(
                (item) =>
                  item.condition && (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center rounded-md p-3 text-base ${
                        isActive(item.href)
                          ? "bg-blue-600 text-white font-medium"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      <div className="mr-3">{item.icon}</div>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
              )}
            </nav>
          </div>

          {/* User Info and Sign Out Button */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center mb-4 p-2 rounded-md bg-slate-700/50">
              <UserCircle
                size={22}
                className="text-blue-400 mr-3 flex-shrink-0"
              />
              <div className="text-sm text-slate-200 font-medium truncate">
                {session?.user?.name || "User"}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center rounded-md p-3 text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={20} className="mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
