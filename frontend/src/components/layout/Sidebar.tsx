import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/contexts/ModeContext";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Package,
  CreditCard,
  GraduationCap,
  Settings,
  Home,
  Baby,
  School,
  BookMarked,
  UserCheck,
  Palette,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { mode } = useMode();
  const { t } = useTranslation();
  const location = useLocation();

  // Mode-specific navigation items
  const kindergartenNavigation = [
    {
      name: t('sidebar.dashboard'),
      href: "/dashboard",
      icon: Home,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.students'),
      href: "/students",
      icon: Baby,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.attendance'),
      href: "/attendance",
      icon: Calendar,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.belongings'),
      href: "/belongings",
      icon: Package,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.payments'),
      href: "/payments",
      icon: CreditCard,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.enrollments'),
      href: "/enrollments",
      icon: GraduationCap,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.salaries'),
      href: "/personnel",
      icon: Users,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.monthlyBalance'),
      href: "/monthly-balance",
      icon: BarChart3,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.logs'),
      href: "/logs",
      icon: FileText,
      roles: ["OWNER"],
    },
    {
      name: t('sidebar.settings'),
      href: "/settings",
      icon: Settings,
      roles: ["OWNER", "STAFF"],
    },
  ];

  const extraCoursesNavigation = [
    {
      name: t('sidebar.dashboard'),
      href: "/dashboard",
      icon: Home,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.students'),
      href: "/extra-students",
      icon: School,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.payments'),
      href: "/extra-payments",
      icon: CreditCard,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.extraCourses'),
      href: "/extra-courses",
      icon: BookMarked,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.enrollments'),
      href: "/extra-students-register",
      icon: UserCheck,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.salaries'),
      href: "/personnel",
      icon: Users,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.monthlyBalance'),
      href: "/monthly-balance",
      icon: BarChart3,
      roles: ["OWNER", "STAFF"],
    },
    {
      name: t('sidebar.logs'),
      href: "/logs",
      icon: FileText,
      roles: ["OWNER"],
    },
    {
      name: t('sidebar.settings'),
      href: "/settings",
      icon: Palette,
      roles: ["OWNER", "STAFF"],
    },
  ];

  const navigation = mode === 'kindergarten' ? kindergartenNavigation : extraCoursesNavigation;

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <div 
      className="w-64 shadow-lg transition-all duration-300"
      style={{
        background: `linear-gradient(to bottom, var(--mode-sidebar), var(--mode-background))`,
        borderRight: `2px solid var(--mode-border)`,
        boxShadow: `0 0 20px var(--mode-shadow)20`,
      }}
    >
      <div 
        className="flex items-center justify-center h-16 px-4 border-b transition-colors duration-300"
        style={{
          borderBottomColor: 'var(--mode-border)',
        }}
      >
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.jpg" 
            alt="Linarqaa Logo" 
            className="h-10 w-10 rounded-lg"
          />
          <h1 
            className="text-xl font-bold transition-colors duration-300"
            style={{ color: 'var(--mode-text)' }}
          >
            {mode === 'kindergarten' ? 'Linarqa Kids' : 'Linarqa Academy'}
          </h1>
        </div>
      </div>
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 relative"
                style={{
                  backgroundColor: isActive 
                    ? `var(--mode-primary)`
                    : 'transparent',
                  color: isActive 
                    ? 'white'
                    : 'var(--mode-textSecondary)',
                  boxShadow: isActive 
                    ? `0 4px 12px var(--mode-shadow)30`
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--mode-primary)20';
                    e.currentTarget.style.color = 'var(--mode-text)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--mode-textSecondary)';
                  }
                }}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                    style={{
                      backgroundColor: 'var(--mode-secondary)',
                    }}
                  />
                )}
                <Icon 
                  className="mr-3 h-5 w-5 transition-colors duration-300 relative z-10"
                  style={{ 
                    color: isActive 
                      ? 'white' 
                      : 'var(--mode-accent)' 
                  }}
                />
                <span className="relative z-10">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 