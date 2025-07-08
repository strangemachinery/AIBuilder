// Mobile navigation component for better mobile app experience
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BookOpen, Calendar, TrendingUp, Brain, Trophy } from "lucide-react";
import { useOffline } from "@/hooks/useOffline";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const { isOnline, pendingActions } = useOffline();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-orange-500/10 border-orange-500/20 border-t px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-orange-600 text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Offline mode
            {pendingActions > 0 && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                {pendingActions} pending
              </span>
            )}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="w-full h-16 bg-transparent border-0 rounded-none grid grid-cols-6 gap-0">
          <TabsTrigger 
            value="dashboard" 
            className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="resources" 
            className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">Learn</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="timeline" 
            className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Plan</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="progress" 
            className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs">Progress</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="achievements" 
            className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Trophy className="h-5 w-5" />
            <span className="text-xs">Awards</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="insights" 
            className="flex flex-col items-center justify-center gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Brain className="h-5 w-5" />
            <span className="text-xs">Insights</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}