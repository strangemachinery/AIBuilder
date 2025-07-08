import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  Calendar,
  Target,
  Award,
  CheckCircle,
  X,
  Trophy,
  Flame,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Stats {
  totalResources: number;
  completedResources: number;
  inProgressResources: number;
  notStartedResources: number;
  categoryBreakdown: { category: string; count: number }[];
}

interface ActivityEntry {
  id: number;
  action: string;
  description: string;
  createdAt: string;
}

export default function ProgressTab() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to load progress statistics",
        variant: "destructive",
      });
    },
  });

  const { data: activity } = useQuery({
    queryKey: ["/api/activity"],
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        return; // Already handled above
      }
      console.error("Failed to load activity:", error);
    },
  });

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="glass-effect shadow-xl">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const overallProgress = stats && stats.totalResources > 0 
    ? Math.round((stats.completedResources / stats.totalResources) * 100)
    : 0;

  // Calculate learning streak based on recent activity
  const calculateStreak = () => {
    if (!activity || activity.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    // Simple streak calculation - count consecutive days with activity
    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toDateString();
      const hasActivity = activity.some((item: ActivityEntry) => 
        new Date(item.createdAt).toDateString() === dateStr
      );
      
      if (hasActivity) {
        streak++;
      } else if (streak > 0) {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  // Generate streak calendar for last 7 days
  const generateStreakCalendar = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const hasActivity = activity?.some((item: ActivityEntry) => 
        new Date(item.createdAt).toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        hasActivity,
        isToday: i === 0
      });
    }
    
    return days;
  };

  const streakCalendar = generateStreakCalendar();

  // Mock achievements based on actual progress
  const generateAchievements = () => {
    const achievements = [];
    
    if (stats?.completedResources && stats.completedResources >= 1) {
      achievements.push({
        id: 1,
        title: "First Steps",
        description: "Completed your first learning resource",
        icon: Trophy,
        date: "Recently",
        color: "yellow"
      });
    }
    
    if (currentStreak >= 7) {
      achievements.push({
        id: 2,
        title: "Week Warrior",
        description: "Maintained learning consistency for 7 days",
        icon: Flame,
        date: "Recently",
        color: "orange"
      });
    }
    
    if (stats?.completedResources && stats.completedResources >= 5) {
      achievements.push({
        id: 3,
        title: "Learning Enthusiast",
        description: "Completed 5 learning resources",
        icon: Star,
        date: "Recently",
        color: "purple"
      });
    }
    
    return achievements;
  };

  const achievements = generateAchievements();

  return (
    <div className="space-y-8">
      {/* Progress Overview & Learning Streaks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Overview */}
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Overview</h3>
            
            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Overall Completion</span>
                <span className="text-2xl font-bold gradient-text">{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="progress-bar h-4 rounded-full" 
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stats?.completedResources || 0} of {stats?.totalResources || 0} resources completed
              </p>
            </div>

            {/* Category Progress */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Progress by Category</h4>
              {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
                stats.categoryBreakdown.map((category, index) => {
                  const colors = [
                    'from-purple-500 to-purple-600',
                    'from-blue-500 to-blue-600',
                    'from-green-500 to-green-600',
                    'from-orange-500 to-orange-600',
                    'from-teal-500 to-teal-600',
                    'from-pink-500 to-pink-600',
                    'from-indigo-500 to-indigo-600',
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div key={category.category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">{category.category}</span>
                        <span className="text-sm text-gray-600">{category.count} resources</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${colorClass} h-2 rounded-full`}
                          style={{ 
                            width: stats.totalResources > 0 
                              ? `${(category.count / stats.totalResources) * 100}%` 
                              : "0%" 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">No category data available</p>
                  <p className="text-sm text-gray-500">Add some resources to see progress by category</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Streaks */}
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Streaks</h3>
            
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{currentStreak}</div>
                  <div className="text-xs text-orange-100">Days</div>
                </div>
              </div>
              <p className="text-gray-600">Current learning streak</p>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {streakCalendar.map((day, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    day.hasActivity
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  } ${day.isToday ? "ring-2 ring-blue-500" : ""}`}
                  title={`${day.date.toLocaleDateString()} - ${day.hasActivity ? "Active" : "No activity"}`}
                >
                  {day.hasActivity ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current streak</span>
                <span className="font-semibold text-gray-900">{currentStreak} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">This month</span>
                <span className="font-semibold text-gray-900">
                  {activity?.filter((item: ActivityEntry) => {
                    const itemDate = new Date(item.createdAt);
                    const now = new Date();
                    return itemDate.getMonth() === now.getMonth() && 
                           itemDate.getFullYear() === now.getFullYear();
                  }).length || 0} activities
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total activities</span>
                <span className="font-semibold text-gray-900">{activity?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress Chart Placeholder */}
      <Card className="glass-effect shadow-xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Progress</h3>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Progress Chart</p>
              <p className="text-sm text-gray-500">Visual progress tracking coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="glass-effect shadow-xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h3>
          
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No achievements yet</p>
              <p className="text-sm text-gray-500">Complete learning resources to earn achievements</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                const colorClasses = {
                  yellow: "from-yellow-50 to-yellow-100 border-yellow-200",
                  orange: "from-orange-50 to-orange-100 border-orange-200",
                  purple: "from-purple-50 to-purple-100 border-purple-200",
                  blue: "from-blue-50 to-blue-100 border-blue-200",
                };
                
                const iconColors = {
                  yellow: "bg-yellow-500",
                  orange: "bg-orange-500", 
                  purple: "bg-purple-500",
                  blue: "bg-blue-500",
                };
                
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 bg-gradient-to-br ${colorClasses[achievement.color as keyof typeof colorClasses]} rounded-xl border`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 ${iconColors[achievement.color as keyof typeof iconColors]} rounded-full flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
