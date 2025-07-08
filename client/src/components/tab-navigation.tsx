import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Lightbulb 
} from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "insights", label: "Insights", icon: Lightbulb },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="glass-effect rounded-2xl p-2 mb-6 shadow-xl">
      <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-700 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
