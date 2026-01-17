import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  Mail,
  Send,
  FileText,
  Users,
  List,
  HelpCircle,
  User,
  LayoutTemplate,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

function SidebarEnhanced() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const menuItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/view-emails", icon: Mail, label: "View Emails" },
    { path: "/send-email", icon: Send, label: "Send Emails" },
    { path: "/templates", icon: LayoutTemplate, label: "Templates" },
    { path: "/groups", icon: UsersRound, label: "Groups" },
    { path: "/contact", icon: Users, label: "Contacts" },
  ];

  const isActive = (path) => {
    return activeTab === path;
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          NexSuite
        </h2>
        <p className="text-xs text-gray-500 mt-1">Email Management</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setActiveTab(item.path)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    active ? "text-blue-600" : "text-gray-500"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default SidebarEnhanced;
