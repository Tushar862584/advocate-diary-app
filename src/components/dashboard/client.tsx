'use client';

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";

interface DashboardClientProps {
  children: React.ReactNode;
}

/**
 * Client component for dashboard layout
 * Handles sidebar state and UI interactions
 */
export function DashboardClientWrapper({ children }: DashboardClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Effect to initialize sidebar state on client and detect mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    try {
      // Get stored preference or default based on screen width
      const storedValue = localStorage.getItem('sidebarCollapsed');
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      
      const initialValue = storedValue !== null 
        ? storedValue === 'true' 
        : window.innerWidth < 1024;
        
      setSidebarCollapsed(initialValue);
      
      // Add resize listener
      window.addEventListener('resize', handleResize);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      // Fallback to screen width
      setSidebarCollapsed(window.innerWidth < 1024);
      setIsMobile(window.innerWidth < 768);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleCollapseChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar onCollapseChange={handleCollapseChange} />
      
      <main 
        className={`flex-1 transition-all pt-16 md:pt-0 ${isMobile ? 'px-2' : 'px-4'}`}
        style={{
          // Fallback inline style to ensure proper layout transitions
          marginLeft: sidebarCollapsed ? '0' : '0',
          paddingLeft: isMobile ? '0' : (sidebarCollapsed ? '4rem' : '16rem'),
        }}
      >
        <div className="container mx-auto py-4 px-0 sm:px-2 md:px-4 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
} 