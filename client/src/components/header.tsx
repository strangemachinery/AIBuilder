import { useState } from "react";
import { Brain, ChevronDown, User as UserIcon, Download, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Signing out...",
      description: "You will be redirected to the login page.",
    });
    setTimeout(() => {
      window.location.href = "/api/logout";
    }, 500);
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "Your data export will be available shortly.",
    });
    // TODO: Implement actual export functionality
  };

  return (
    <header className="glass-effect rounded-2xl p-6 mb-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">AI Learning Hub</h1>
            <p className="text-gray-600">Advanced Learning Tracker & Progress Manager</p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
              <AvatarFallback>
                {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="font-medium text-gray-900">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user.email}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => toast({ title: "Profile settings coming soon!" })}>
                  <UserIcon className="w-4 h-4 mr-3" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-3" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
