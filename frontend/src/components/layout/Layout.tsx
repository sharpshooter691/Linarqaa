import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/contexts/ModeContext";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const Layout: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { mode } = useMode();

  if (!user) {
    return null;
  }

  return (
    <div 
      className="flex h-screen transition-all duration-300"
      style={{
        backgroundColor: 'var(--mode-background)',
      }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto p-6 transition-all duration-300"
          style={{
            backgroundColor: 'transparent',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;