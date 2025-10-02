import {
  
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  DashboardOutlined,
  TeamOutlined,
  ShopOutlined,
  ToolOutlined,
  CarOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  DollarOutlined,
  DownOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Badge, Tooltip } from "antd";
import {
  APP_NAME,
  LOGO_IMAGE,
  APP_COMPANY_NAME,
  getColors,
} from "../../config";
import {
  dashboardRoute,
  userManagementRoute,
  marketplaceRoute,
  serviceManagementRoute,
  deliveryManagementRoute,
  communicationRoute,
  disputesManagementRoute,
  reportAndAnalyticsRoute,
  financeManagementRoute,
} from "../../config/page_routes";
import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import ThemeToggle from "../controls/ThemeToggle";
import { CustomText, CustomTitle } from "../controls/customstext";
import { useTheme } from "../../hooks/useTheme";
import ErrorBoundary from "../ErrorBoundary";

interface DashboardLayoutProps {
  children: ReactNode;
}
export default function DashboardLayout({ children }: DashboardLayoutProps) {
 
  const { isDark} = useTheme();
 



  return (

      <div className={`h-screen ${isDark ? "dark bg-gray-900" : "bg-gray-50"}`}>
        <Header />
        <div className="w-screen flex pt-16 h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <Sidebar />

          {/* MainContent */}
          <MainContent>{children}</MainContent>
        </div>
      </div>
   
  );
}
/* ---------------- HEADER ---------------- */
const Header = () => {
  const { isDark, toggleTheme } = useTheme();


  const [notifications] = useState(3);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4  shadow-sm border-b 
        ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
    >
      {/* Left: Mobile Menu Button */}
      <div className="flex items-center gap-2 md:hidden">
 
        <img src={LOGO_IMAGE} alt={APP_NAME} className="h-8" />
      </div>
      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

        <Tooltip title="Notifications">
          <Badge count={notifications} size="small">
            <button
              className={`p-2 rounded-full transition-colors ${
                isDark
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-100 text-gray-300"
              }`}
            >
              <BellOutlined className="text-lg" />
            </button>
          </Badge>
        </Tooltip>

        <CompanyLogoComp />
      </div>
    </header>
  );
};

/* ---------------- SIDEBAR ---------------- */
const Sidebar = () => {
  const { isDark } = useTheme();
  const navItems = [
    { path: dashboardRoute, label: "Dashboard", Icon: DashboardOutlined, description: "Overview & Analytics" },
    { path: userManagementRoute, label: "User Management", Icon: TeamOutlined, description: "Manage Users" },
    { path: marketplaceRoute, label: "Marketplace", Icon: ShopOutlined, description: "Product Oversight" },
    { path: serviceManagementRoute, label: "Service Management", Icon: ToolOutlined, description: "Service Operations" },
    { path: deliveryManagementRoute, label: "Delivery Management", Icon: CarOutlined, description: "Delivery Tracking" },
    { path: communicationRoute, label: "Communication", Icon: MessageOutlined, description: "Chat & Calls" },
    { path: disputesManagementRoute, label: "Dispute Management", Icon: ExclamationCircleOutlined, description: "Resolve Issues" },
    { path: reportAndAnalyticsRoute, label: "Analytics & Reports", Icon: BarChartOutlined, description: "Data Insights" },
    { path: financeManagementRoute, label: "Finance Management", Icon: DollarOutlined, description: "Financial Reports" },
  ];

  
    return (
      <aside
        className={`w-64 h-full border-r shadow-sm pt-16 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 "
        }`}
      >
        <nav className="px-4 pb-6 overflow-y-auto h-full">
        <div className="space-y-1">
          {navItems.map(({ path, label, Icon, description }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? "bg-blue-900/50 text-blue-400 border-r-2 border-blue-400"
                      : "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : isDark
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? isDark
                          ? "text-blue-400"
                          : "text-blue-600"
                        : isDark
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  />
                  <div>
                    <div className="font-medium">{label}</div>
                    <CustomText
                      size="small"
                      className={`${
                        isActive
                        ? isDark
                          ? "text-blue-400"
                          : "text-blue-600"
                          : isDark
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {description}
                    </CustomText>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

/* ---------------- MAIN CONTENT ---------------- */
const MainContent = ({ children }: { children: ReactNode }) => {
  const { isDark } = useTheme();

  return (
    <main
      className={`flex-1 overflow-y-auto transition-colors ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <ErrorBoundary>
      <div className="p-6 h-full">{children}</div>
      </ErrorBoundary>
    </main>
  );
};


/* ---------------- COMPANY MENU ---------------- */
const CompanyLogoComp = () => {
  const [showmodal, setshowmodal] = useState(false);
  const { isDark } = useTheme();

  const handlelogout = () => {
    localStorage.removeItem("acepick_admin_token");
    window.location.href = "/login";
    setshowmodal(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <Tooltip title="Help & Support">
          <button
            className={`p-2 rounded-full ${
              isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-300"
            }`}
          >
            <QuestionCircleOutlined />
          </button>
        </Tooltip>

        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isDark ? "bg-gray-700" : "bg-gray-200"
          }`}>
            <UserOutlined className={isDark ? "text-gray-300" : "text-gray-600"} />
          </div>
          <div className="hidden md:block">
            <CustomText weight="medium" className={isDark ? "text-white" : "text-gray-800"}>
              {APP_COMPANY_NAME}
            </CustomText>
            <CustomText size="small" className={isDark ? "text-gray-400" : "text-gray-500"}>
              Administrator
            </CustomText>
          </div>
          <button
            onClick={() => setshowmodal(!showmodal)}
            className={`p-1 rounded ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
          >
            <DownOutlined />
          </button>
        </div>
      </div>

      {showmodal && (
        <div
          className={`absolute right-0 top-12 w-48 py-2 rounded-lg shadow-lg border z-50 ${
            isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700"
          }`}
        >
          <NavLink
            to="/settings"
            onClick={() => setshowmodal(false)}
            className={`flex items-center gap-2 px-4 py-2 ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
            }`}
          >
            <UserOutlined /> Profile Settings
          </NavLink>
          <hr className={isDark ? "border-gray-700" : "border-gray-200"} />
          <button
            onClick={handlelogout}
            className={`w-full flex items-center gap-2 px-4 py-2 ${
              isDark ? "hover:bg-red-500 text-white" : "hover:bg-red-500 text-white"
            }`}
          >
            <LogoutOutlined /> Logout
          </button>
        </div>
      )}
    </div>
  );
};
