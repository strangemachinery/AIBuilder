import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  Search, 
  Edit, 
  Trash2, 
  StickyNote,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import AddResourceModal from "./add-resource-modal";
import type { Resource } from "@shared/schema";

export default function ResourcesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: resources, isLoading } = useQuery({
    queryKey: ["/api/resources"],
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
        description: "Failed to load resources",
        variant: "destructive",
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ resourceId, progress, notes }: { resourceId: number; progress: string; notes?: string }) => {
      await apiRequest("PUT", `/api/resources/${resourceId}/progress`, { progress, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Success",
        description: "Progress updated successfully!",
      });
    },
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
        description: "Failed to update progress",
        variant: "destructive",
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      await apiRequest("DELETE", `/api/resources/${resourceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Success",
        description: "Resource deleted successfully!",
      });
    },
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
        description: "Failed to delete resource",
        variant: "destructive",
      });
    },
  });

  // Filter resources based on current filters
  const filteredResources = resources?.filter((resource: Resource) => {
    const matchesSearch = !searchTerm || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || categoryFilter === "all" || resource.category === categoryFilter;
    const matchesProgress = !progressFilter || progressFilter === "all" || resource.progress === progressFilter;
    const matchesPriority = !priorityFilter || priorityFilter === "all" || resource.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesProgress && matchesPriority;
  }) || [];

  const handleProgressChange = (resourceId: number, progress: string) => {
    updateProgressMutation.mutate({ resourceId, progress });
  };

  const handleDeleteResource = (resourceId: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation.mutate(resourceId);
    }
  };

  const handleExport = () => {
    if (!resources || resources.length === 0) {
      toast({
        title: "No data",
        description: "No resources to export",
        variant: "destructive",
      });
      return;
    }

    // Simple CSV export
    const headers = ["Title", "Category", "Type", "Provider", "Duration", "Cost", "Difficulty", "Priority", "Progress", "URL"];
    const csvContent = [
      headers.join(","),
      ...resources.map((resource: Resource) => [
        `"${resource.title}"`,
        resource.category,
        resource.type,
        `"${resource.provider || ""}"`,
        `"${resource.duration || ""}"`,
        resource.cost,
        resource.difficulty,
        resource.priority,
        resource.progress,
        `"${resource.url || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "learning-resources.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Resources exported successfully!",
    });
  };

  const getCategoryBadgeClass = (category: string) => {
    const baseClass = "px-3 py-1 rounded-full text-sm font-medium ";
    switch (category.toLowerCase()) {
      case "programming":
        return baseClass + "category-programming";
      case "machine learning":
        return baseClass + "category-ml";
      case "cloud platforms":
        return baseClass + "category-cloud";
      case "devops/mlops":
        return baseClass + "category-devops";
      case "data engineering":
        return baseClass + "category-data";
      case "soft skills":
        return baseClass + "category-soft";
      case "emerging tech":
        return baseClass + "category-emerging";
      case "mathematics":
        return baseClass + "category-math";
      case "ai agents":
        return baseClass + "category-agents";
      case "security":
        return baseClass + "category-security";
      default:
        return baseClass + "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    const baseClass = "px-3 py-1 rounded-full text-sm font-medium ";
    switch (priority.toLowerCase()) {
      case "high":
        return baseClass + "priority-high";
      case "medium":
        return baseClass + "priority-medium";
      case "low":
        return baseClass + "priority-low";
      default:
        return baseClass + "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyBadgeClass = (difficulty: string) => {
    const baseClass = "px-3 py-1 rounded-full text-sm font-medium ";
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return baseClass + "difficulty-beginner";
      case "intermediate":
        return baseClass + "difficulty-intermediate";
      case "advanced":
        return baseClass + "difficulty-advanced";
      default:
        return baseClass + "bg-gray-100 text-gray-800";
    }
  };

  const getProgressBadgeClass = (progress: string) => {
    const baseClass = "px-3 py-1 rounded-full text-sm font-medium ";
    switch (progress) {
      case "not-started":
        return baseClass + "progress-not-started";
      case "in-progress":
        return baseClass + "progress-in-progress";
      case "completed":
        return baseClass + "progress-completed";
      default:
        return baseClass + "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="glass-effect shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Learning Resources</h2>
            <div className="flex gap-3">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                  <SelectItem value="Cloud Platforms">Cloud Platforms</SelectItem>
                  <SelectItem value="DevOps/MLOps">DevOps/MLOps</SelectItem>
                  <SelectItem value="Data Engineering">Data Engineering</SelectItem>
                  <SelectItem value="AI Agents">AI Agents</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Emerging Tech">Emerging Tech</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Progress</Label>
              <Select value={progressFilter} onValueChange={setProgressFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Progress" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Progress</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("");
                  setProgressFilter("");
                  setPriorityFilter("");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card className="glass-effect shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-500 to-purple-700">
                  <TableHead className="text-white font-semibold">Resource</TableHead>
                  <TableHead className="text-white font-semibold">Category</TableHead>
                  <TableHead className="text-white font-semibold">Progress</TableHead>
                  <TableHead className="text-white font-semibold">Priority</TableHead>
                  <TableHead className="text-white font-semibold">Difficulty</TableHead>
                  <TableHead className="text-white font-semibold">Duration</TableHead>
                  <TableHead className="text-white font-semibold">Cost</TableHead>
                  <TableHead className="text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">No resources found</p>
                        <p className="text-sm text-gray-500">Add your first learning resource to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResources.map((resource: Resource) => (
                    <TableRow key={resource.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div>
                          <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                          )}
                          {resource.url && (
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-1"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {resource.provider || "View Resource"}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getCategoryBadgeClass(resource.category)}>
                          {resource.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={resource.progress} 
                          onValueChange={(value) => handleProgressChange(resource.id, value)}
                          disabled={updateProgressMutation.isPending}
                        >
                          <SelectTrigger className={`w-32 ${getProgressBadgeClass(resource.progress)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-started">Not Started</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className={getPriorityBadgeClass(resource.priority)}>
                          {resource.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getDifficultyBadgeClass(resource.difficulty)}>
                          {resource.difficulty}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {resource.duration || "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className={resource.cost === "Free" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {resource.cost}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast({ title: "Edit functionality coming soon!" })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteResource(resource.id)}
                            disabled={deleteResourceMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toast({ title: "Notes functionality coming soon!" })}
                          >
                            <StickyNote className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddResourceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
