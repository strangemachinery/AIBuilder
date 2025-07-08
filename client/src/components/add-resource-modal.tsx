import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertResourceSchema } from "@shared/schema";
import { z } from "zod";

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = insertResourceSchema.extend({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Type is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  priority: z.string().min(1, "Priority is required"),
  cost: z.string().min(1, "Cost is required"),
});

export default function AddResourceModal({ isOpen, onClose }: AddResourceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    type: "",
    provider: "",
    duration: "",
    cost: "",
    difficulty: "",
    priority: "",
    progress: "not-started",
    notes: "",
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      const validatedData = formSchema.parse(data);
      await apiRequest("POST", "/api/resources", validatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Success",
        description: "Resource added successfully!",
      });
      onClose();
      resetForm();
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
      console.error("Error creating resource:", error);
      toast({
        title: "Error",
        description: "Failed to add resource. Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      category: "",
      type: "",
      provider: "",
      duration: "",
      cost: "",
      difficulty: "",
      priority: "",
      progress: "not-started",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty strings
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== "")
    );
    
    createResourceMutation.mutate(cleanedData);
  };

  const handleClose = () => {
    if (!createResourceMutation.isPending) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-effect max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">Add Learning Resource</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Machine Learning Specialization"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the resource..."
                rows={3}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            
            <div>
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
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
              <Label>Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Course">Course</SelectItem>
                  <SelectItem value="Certification">Certification</SelectItem>
                  <SelectItem value="Book">Book</SelectItem>
                  <SelectItem value="Platform">Platform</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                  <SelectItem value="Repository">Repository</SelectItem>
                  <SelectItem value="Tutorial">Tutorial</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Article">Article</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g., Coursera, AWS, Google"
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 6 weeks, 40 hours"
              />
            </div>
            
            <div>
              <Label>Cost *</Label>
              <Select value={formData.cost} onValueChange={(value) => setFormData({ ...formData, cost: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cost" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="$49">$49</SelectItem>
                  <SelectItem value="$99">$99</SelectItem>
                  <SelectItem value="$149">$149</SelectItem>
                  <SelectItem value="$199">$199</SelectItem>
                  <SelectItem value="$299">$299</SelectItem>
                  <SelectItem value="$499">$499</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Difficulty *</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Priority *</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Initial Progress</Label>
              <Select value={formData.progress} onValueChange={(value) => setFormData({ ...formData, progress: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Personal notes about this resource..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createResourceMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createResourceMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-purple-700"
            >
              {createResourceMutation.isPending ? "Adding..." : "Add Resource"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
