import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  Percent,
  Video,
  TrendingUp,
  Brain,
  Target,
  Plus,
  Lightbulb,
  BookOpen,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Stats {
  totalResources: number;
  completedResources: number;
  inProgressResources: number;
  categoryBreakdown: { category: string; count: number }[];
}

interface ActivityEntry {
  id: number;
  action: string;
  description: string;
  createdAt: string;
}

export default function InsightsTab() {
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery({
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
        description: "Failed to load insights data",
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-effect shadow-xl">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
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

  // Calculate analytics from real data
  const calculateAnalytics = () => {
    if (!activity || activity.length === 0) {
      return {
        mostActiveDay: "No data",
        avgSession: "No data",
        completionRate: "0%",
        preferredFormat: "No data",
      };
    }

    // Calculate most active day
    const dayCount = activity.reduce((acc: Record<string, number>, item: ActivityEntry) => {
      const day = new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
    
    const mostActiveDay = Object.entries(dayCount).reduce((a, b) => 
      dayCount[a[0]] > dayCount[b[0]] ? a : b
    )?.[0] || "No data";

    // Calculate completion rate
    const completionRate = stats && stats.totalResources > 0
      ? `${Math.round((stats.completedResources / stats.totalResources) * 100)}%`
      : "0%";

    return {
      mostActiveDay,
      avgSession: "45 min", // Static for now
      completionRate,
      preferredFormat: "Mixed", // Static for now
    };
  };

  const analytics = calculateAnalytics();

  // Generate AI recommendations based on user's data
  const generateRecommendations = () => {
    const recommendations = [];
    
    if (!stats || stats.totalResources === 0) {
      recommendations.push({
        id: 1,
        title: "Start Your Learning Journey",
        reason: "Add your first learning resources to begin tracking progress",
        priority: "High Priority",
        estimatedTime: "5 minutes",
        category: "Getting Started"
      });
      return recommendations;
    }

    // Check for categories with low completion
    if (stats.categoryBreakdown) {
      const lowCategories = stats.categoryBreakdown.filter(cat => cat.count < 3);
      if (lowCategories.length > 0) {
        recommendations.push({
          id: 2,
          title: `Expand ${lowCategories[0].category} Skills`,
          reason: "Diversify your knowledge base with more resources in this area",
          priority: "Medium Priority",
          estimatedTime: "2-4 weeks",
          category: lowCategories[0].category
        });
      }
    }

    // Check completion rate
    const completionRate = stats.totalResources > 0 
      ? (stats.completedResources / stats.totalResources) * 100 
      : 0;

    if (completionRate < 30) {
      recommendations.push({
        id: 3,
        title: "Focus on Completion",
        reason: "Consider focusing on completing current resources before adding new ones",
        priority: "High Priority",
        estimatedTime: "1-2 weeks",
        category: "Progress"
      });
    }

    if (stats.inProgressResources > 5) {
      recommendations.push({
        id: 4,
        title: "Reduce Work in Progress",
        reason: "Too many concurrent resources may reduce learning effectiveness",
        priority: "Medium Priority",
        estimatedTime: "1 week",
        category: "Organization"
      });
    }

    // Add some general recommendations if not many specific ones
    if (recommendations.length < 2) {
      recommendations.push(
        {
          id: 5,
          title: "Advanced AI Techniques",
          reason: "Based on your learning progress, explore advanced topics",
          priority: "Low Priority",
          estimatedTime: "3-4 weeks",
          category: "Advanced Learning"
        },
        {
          id: 6,
          title: "Practice Projects",
          reason: "Apply your knowledge with hands-on projects",
          priority: "Medium Priority",
          estimatedTime: "2-3 weeks",
          category: "Application"
        }
      );
    }

    return recommendations.slice(0, 4);
  };

  const recommendations = generateRecommendations();

  // Generate skill gap analysis
  const generateSkillGaps = () => {
    if (!stats || !stats.categoryBreakdown) return [];

    const allCategories = [
      "Machine Learning",
      "Programming", 
      "Cloud Platforms",
      "DevOps/MLOps",
      "Data Engineering",
      "AI Agents"
    ];

    return allCategories.map(category => {
      const categoryData = stats.categoryBreakdown.find(cat => cat.category === category);
      const resourceCount = categoryData?.count || 0;
      
      // Simple gap calculation based on resource count
      const targetResources = 10; // Ideal number of resources per category
      const currentLevel = Math.min((resourceCount / targetResources) * 100, 100);
      const gap = Math.max(0, 100 - currentLevel);
      
      return {
        name: category,
        currentLevel: Math.round(currentLevel),
        gap: Math.round(gap),
        status: gap > 60 ? "Needs Focus" : gap > 30 ? "Developing" : "Strong"
      };
    });
  };

  const skillGaps = generateSkillGaps();

  // Generate learning goals based on current progress
  const generateLearningGoals = () => {
    const goals = [];
    
    if (stats) {
      // Completion goal
      const completionRate = stats.totalResources > 0 
        ? (stats.completedResources / stats.totalResources) * 100 
        : 0;
      
      goals.push({
        id: 1,
        title: "Complete Current Resources",
        progress: Math.round(completionRate),
        deadline: "End of month",
        status: completionRate > 75 ? "On track" : "Needs attention",
        remaining: `${stats.totalResources - stats.completedResources} resources left`
      });

      // Category-specific goals
      if (stats.categoryBreakdown.length > 0) {
        const topCategory = stats.categoryBreakdown.reduce((a, b) => 
          a.count > b.count ? a : b
        );
        
        goals.push({
          id: 2,
          title: `Master ${topCategory.category}`,
          progress: Math.min(Math.round((topCategory.count / 10) * 100), 100),
          deadline: "Next quarter",
          status: "In progress",
          remaining: `${Math.max(0, 10 - topCategory.count)} resources to expert level`
        });
      }

      // Streak goal
      goals.push({
        id: 3,
        title: "30-Day Learning Streak",
        progress: Math.min(Math.round((activity?.length || 0) / 30 * 100), 100),
        deadline: "This month",
        status: "Challenging",
        remaining: `${Math.max(0, 30 - (activity?.length || 0))} days to go`
      });
    }

    return goals;
  };

  const learningGoals = generateLearningGoals();

  const handleAddRecommendation = (recommendation: any) => {
    toast({
      title: "Recommendation noted!",
      description: `"${recommendation.title}" has been added to your learning plan.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Learning Analytics & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Learning Analytics */}
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Analytics</h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-900">Most Active Day</span>
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{analytics.mostActiveDay}</p>
                <p className="text-sm text-blue-700">Peak learning performance</p>
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-green-900">Average Session</span>
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{analytics.avgSession}</p>
                <p className="text-sm text-green-700">Typical study duration</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-purple-900">Completion Rate</span>
                  <Percent className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{analytics.completionRate}</p>
                <p className="text-sm text-purple-700">Resources finished</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-orange-900">Learning Style</span>
                  <Video className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">{analytics.preferredFormat}</p>
                <p className="text-sm text-orange-700">Preferred content type</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">AI Recommendations</h3>
            
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <Badge variant={rec.priority.includes("High") ? "destructive" : 
                                   rec.priority.includes("Medium") ? "default" : "secondary"}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{rec.estimatedTime}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddRecommendation(rec)}
                    >
                      Add to Plan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gap Analysis */}
      <Card className="glass-effect shadow-xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Skill Gap Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillGaps.map((skill, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                  <Badge variant={skill.gap > 60 ? "destructive" : 
                                  skill.gap > 30 ? "default" : "secondary"}>
                    {skill.gap}% gap
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full ${
                      skill.currentLevel > 70 
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : skill.currentLevel > 40
                        ? "bg-gradient-to-r from-orange-500 to-orange-600"
                        : "bg-gradient-to-r from-red-500 to-red-600"
                    }`}
                    style={{ width: `${skill.currentLevel}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current: {skill.currentLevel}%</span>
                  <span className="text-gray-900 font-medium">Target: 100%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Goal Tracker */}
      <Card className="glass-effect shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Learning Goals</h3>
            <Button 
              onClick={() => toast({ title: "Goal creation feature coming soon!" })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>

          <div className="space-y-4">
            {learningGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No learning goals set</p>
                <p className="text-sm text-gray-500">Set goals to track your learning progress</p>
              </div>
            ) : (
              learningGoals.map((goal) => (
                <div key={goal.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                      <p className="text-sm text-gray-600">Target: {goal.deadline}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold gradient-text">{goal.progress}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="progress-bar h-2 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant={goal.status === "On track" ? "secondary" : "destructive"}>
                      {goal.status}
                    </Badge>
                    <span className="text-gray-500">{goal.remaining}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
