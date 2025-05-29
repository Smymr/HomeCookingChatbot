
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Menu, Users, FileText, BarChart, Bell, Search, Settings, LogOut } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { useState } from "react";

const DashboardLayout = ({ onLogout }: { onLogout: () => void }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { title: "Dashboard", icon: BarChart, path: "/admin" },
    { title: "Users", icon: Users, path: "/admin/users" },
    { title: "Recipes", icon: FileText, path: "/admin/recipes" },
    { title: "Blogs", icon: FileText, path: "/admin/blogs" },
    { title: "Notifications", icon: Bell, path: "/admin/notifications" },
    { title: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 to-yellow-50">
        <Sidebar className={`border-r border-orange-200 ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white shadow-lg`}>
          <div className="flex items-center justify-between p-4 border-b border-orange-200 bg-gradient-to-r from-orange-500 to-yellow-400">
            <h1 className={`text-xl font-bold text-white ${isCollapsed ? 'hidden' : 'block'}`}>
              Yegna Taste
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hover:bg-orange-100 text-white hover:text-orange-600"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className={`${isCollapsed ? 'hidden' : 'block'} text-orange-600`}>
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.path} className="flex items-center gap-2 py-3 text-orange-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100 rounded-lg mx-2">
                          <item.icon className="h-5 w-5" />
                          <span className={isCollapsed ? 'hidden' : 'block'}>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          {/* Logout Button */}
          <div className="mt-auto p-4 border-t border-orange-200">
            <Button 
              onClick={onLogout}
              variant="outline" 
              className={`${isCollapsed ? 'w-8 h-8 p-0' : 'w-full'} border-orange-300 text-orange-600 hover:bg-orange-100`}
            >
              <LogOut className="h-4 w-4" />
              <span className={`${isCollapsed ? 'hidden' : 'ml-2'}`}>Logout</span>
            </Button>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-orange-200 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <SidebarTrigger />
                <h2 className="ml-4 text-xl font-semibold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">Admin Dashboard</h2>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="flex gap-2 border-orange-200 hover:bg-orange-50">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
                <Button variant="outline" size="sm" className="flex gap-2 border-orange-200 hover:bg-orange-50">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-white">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default DashboardLayout;
