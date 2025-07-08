// Achievements tab component for gamification
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Flame, 
  Crown, 
  Star, 
  Award,
  Users,
  Calendar,
  TrendingUp,
  BookOpen,
  Clock
} from "lucide-react";
import { Achievement, UserAchievement, LearningStreak, UserStats } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useOffline } from "@/hooks/useOffline";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AchievementsTab() {
  const { toast } = useToast();
  const { isOnline, getOfflineData, saveForOffline } = useOffline();
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch user achievements
  const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/achievements/user'],
    enabled: isOnline,
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
    },
  });

  // Fetch available achievements
  const { data: achievements } = useQuery({
    queryKey: ['/api/achievements'],
    enabled: isOnline,
  });

  // Fetch learning streak
  const { data: streak } = useQuery({
    queryKey: ['/api/streak'],
    enabled: isOnline,
  });

  // Fetch user stats for level/XP
  const { data: userStats } = useQuery({
    queryKey: ['/api/user-stats'],
    enabled: isOnline,
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ['/api/leaderboard'],
    enabled: isOnline,
  });

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'learning': return BookOpen;
      case 'streak': return Flame;
      case 'milestone': return Target;
      case 'social': return Users;
      default: return Trophy;
    }
  };

  const getLevelFromXP = (xp: number) => {
    return Math.floor(xp / 1000) + 1;
  };

  const getXPForNextLevel = (xp: number) => {
    const currentLevel = getLevelFromXP(xp);
    return currentLevel * 1000;
  };

  const filterAchievements = (achievements: Achievement[]) => {
    if (activeCategory === "all") return achievements;
    return achievements?.filter(a => a.category === activeCategory) || [];
  };

  if (!isOnline) {
    return (
      <div className="space-y-6 pb-20">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-700">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Offline Mode</span>
          </div>
          <p className="text-orange-600 text-sm mt-1">
            Achievement data will sync when you're back online.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* User Level & XP */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Level {userStats?.level || 1}</h3>
                <p className="text-muted-foreground">{userStats?.totalPoints || 0} XP</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next Level</p>
                <p className="font-medium">{getXPForNextLevel(userStats?.experiencePoints || 0)} XP</p>
              </div>
            </div>
            <Progress 
              value={((userStats?.experiencePoints || 0) % 1000) / 10} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning Streak */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Learning Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-500">{streak?.currentStreak || 0}</p>
              <p className="text-sm text-muted-foreground">Current</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{streak?.longestStreak || 0}</p>
              <p className="text-sm text-muted-foreground">Best</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{streak?.totalActiveDays || 0}</p>
              <p className="text-sm text-muted-foreground">Total Days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="learning">Learn</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="milestone">Goals</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-4 mt-4">
          {/* Unlocked Achievements */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Unlocked ({userAchievements?.length || 0})
            </h3>
            <div className="grid gap-3">
              {userAchievements?.map((userAchievement: any) => {
                const achievement = achievements?.find((a: Achievement) => a.id === userAchievement.achievementId);
                if (!achievement) return null;
                
                const IconComponent = getAchievementIcon(achievement.category);
                
                return (
                  <Card key={userAchievement.id} className="glass-effect border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">+{achievement.points} XP</Badge>
                            <span className="text-xs text-muted-foreground">
                              Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Available Achievements */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Available
            </h3>
            <div className="grid gap-3">
              {filterAchievements(achievements || [])
                ?.filter((achievement: Achievement) => 
                  !userAchievements?.some((ua: any) => ua.achievementId === achievement.id)
                )
                ?.map((achievement: Achievement) => {
                  const IconComponent = getAchievementIcon(achievement.category);
                  
                  return (
                    <Card key={achievement.id} className="glass-effect opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-muted-foreground">{achievement.name}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            <Badge variant="outline" className="mt-1">+{achievement.points} XP</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Leaderboard Section */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard?.slice(0, 10)?.map((user: any, index: number) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground">Level {user.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{user.totalPoints} XP</p>
                  <p className="text-xs text-muted-foreground">{user.resourcesCompleted} completed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}