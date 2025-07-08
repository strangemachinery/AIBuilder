import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Target, 
  Plus,
  TrendingUp,
  Star,
  Award,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Stats {
  totalResources: number;
  completedResources: number;
  inProgressResources: number;
  notStartedResources: number;
  freeResources: number;
  paidResources: number;
  categoryBreakdown: { category: string; count: number }[];
}

interface ActivityEntry {
  id: number;
  action: string;
  description: string;
  createdAt: string;
}

export default function DashboardTab() {
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
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    },
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/activity"],
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        return; // Already handled above
      }
      console.error("Failed to load activity:", error);
    },
  });

  const { data: learningPaths } = useQuery({
    queryKey: ["/api/paths"],
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        return; // Already handled above
      }
      console.error("Failed to load learning paths:", error);
    },
  });

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-effect rounded-2xl p-6 shadow-xl">
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "created":
        return <Plus className="w-4 h-4 text-blue-600" />;
      case "updated":
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      default:
        return <Star className="w-4 h-4 text-purple-600" />;
    }
  };

  const getActivityBgColor = (action: string) => {
    switch (action) {
      case "completed":
        return "bg-green-100";
      case "created":
        return "bg-blue-100";
      case "updated":
        return "bg-orange-100";
      default:
        return "bg-purple-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect shadow-xl hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-blue-600">+12%</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.totalResources || 0}
              </p>
              <p className="text-gray-600 text-sm">Total Resources</p>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="progress-bar h-2 rounded-full" 
                  style={{ width: `${stats ? (stats.totalResources / 200) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect shadow-xl hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-green-600">+{stats?.completedResources || 0}</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.completedResources || 0}
              </p>
              <p className="text-gray-600 text-sm">Completed</p>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" 
                  style={{ 
                    width: stats && stats.totalResources > 0 
                      ? `${(stats.completedResources / stats.totalResources) * 100}%` 
                      : "0%" 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect shadow-xl hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-orange-600">+{stats?.inProgressResources || 0}</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.inProgressResources || 0}
              </p>
              <p className="text-gray-600 text-sm">In Progress</p>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full" 
                  style={{ 
                    width: stats && stats.totalResources > 0 
                      ? `${(stats.inProgressResources / stats.totalResources) * 100}%` 
                      : "0%" 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect shadow-xl hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-purple-600">Goal</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.freeResources || 0}
              </p>
              <p className="text-gray-600 text-sm">Free Resources</p>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" 
                  style={{ 
                    width: stats && stats.totalResources > 0 
                      ? `${(stats.freeResources / stats.totalResources) * 100}%` 
                      : "0%" 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Learning Paths */}
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Learning Paths</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast({ title: "Add Path feature coming soon!" })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Path
              </Button>
            </div>
            
            <div className="space-y-4">
              {learningPaths && learningPaths.length > 0 ? (
                learningPaths.slice(0, 3).map((path: any) => (
                  <div key={path.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{path.name}</h4>
                      <span className="text-sm text-gray-500">0%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2 mb-3">
                      <div className="progress-bar h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>0/0 completed</span>
                      <span>{path.estimatedDuration || "~3 months"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No learning paths yet</p>
                  <p className="text-sm text-gray-500">Create your first learning path to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            
            <div className="space-y-4">
              {activity && activity.length > 0 ? (
                activity.slice(0, 4).map((item: ActivityEntry) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 ${getActivityBgColor(item.action)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {getActivityIcon(item.action)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{item.description}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(item.createdAt).toRelativeTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                  <p className="text-sm text-gray-500">Start learning to see your activity here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-effect shadow-xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              className="p-4 h-auto text-left bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200"
              onClick={() => toast({ title: "Add Resource feature available in Resources tab!" })}
            >
              <div>
                <Plus className="w-6 h-6 text-blue-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Add Resource</h4>
                <p className="text-sm text-gray-600">Add a new learning resource to your collection</p>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="p-4 h-auto text-left bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200"
              onClick={() => toast({ title: "Timeline planning available in Timeline tab!" })}
            >
              <div>
                <Calendar className="w-6 h-6 text-green-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Plan Timeline</h4>
                <p className="text-sm text-gray-600">Organize your learning schedule for the month</p>
              </div>
            </Button>
            
            <Button 
              variant="outline"
              className="p-4 h-auto text-left bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200"
              onClick={() => toast({ title: "Insights available in Insights tab!" })}
            >
              <div>
                <TrendingUp className="w-6 h-6 text-purple-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">View Insights</h4>
                <p className="text-sm text-gray-600">Analyze your learning patterns and progress</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
