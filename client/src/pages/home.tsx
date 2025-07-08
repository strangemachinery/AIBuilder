import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useOffline } from "@/hooks/useOffline";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/header";
import TabNavigation from "@/components/tab-navigation";
import MobileNav from "@/components/mobile-nav";
import DashboardTab from "@/components/dashboard-tab";
import ResourcesTab from "@/components/resources-tab";
import TimelineTab from "@/components/timeline-tab";
import ProgressTab from "@/components/progress-tab";
import InsightsTab from "@/components/insights-tab";
import AchievementsTab from "@/components/achievements-tab";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { isOnline } = useOffline();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Initialize offline storage and sync
  useEffect(() => {
    if (isOnline && isAuthenticated) {
      // Sync data for offline use
      import("@/lib/offlineStorage").then(({ offlineStorage }) => {
        offlineStorage.syncDataForOffline();
      });
    }
  }, [isOnline, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-effect rounded-2xl p-6 mb-6 shadow-xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "resources":
        return <ResourcesTab />;
      case "timeline":
        return <TimelineTab />;
      case "progress":
        return <ProgressTab />;
      case "achievements":
        return <AchievementsTab />;
      case "insights":
        return <InsightsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Header user={user} />
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        )}
        
        <div className={`${!isMobile ? '' : 'pb-24'}`}>
          {renderTabContent()}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}
