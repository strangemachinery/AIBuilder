import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { TimelineEvent, InsertTimelineEvent } from "@shared/schema";

export default function TimelineTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState("month");

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/timeline"],
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
        description: "Failed to load timeline events",
        variant: "destructive",
      });
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: InsertTimelineEvent) => {
      await apiRequest("POST", "/api/timeline", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Success",
        description: "Timeline event created successfully!",
      });
      setIsAddEventModalOpen(false);
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
        description: "Failed to create timeline event",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await apiRequest("DELETE", `/api/timeline/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Success",
        description: "Timeline event deleted successfully!",
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
        description: "Failed to delete timeline event",
        variant: "destructive",
      });
    },
  });

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    if (!events) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event: TimelineEvent) => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getUpcomingDeadlines = () => {
    if (!events) return [];
    const now = new Date();
    const upcoming = events
      .filter((event: TimelineEvent) => {
        const eventDate = new Date(event.date);
        return eventDate > now && (event.type === 'deadline' || event.type === 'exam');
      })
      .sort((a: TimelineEvent, b: TimelineEvent) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .slice(0, 3);
    
    return upcoming;
  };

  const getDaysUntil = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'study':
        return 'bg-blue-100 text-blue-800';
      case 'exam':
        return 'bg-red-100 text-red-800';
      case 'deadline':
        return 'bg-orange-100 text-orange-800';
      case 'milestone':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddEvent = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsAddEventModalOpen(true);
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(eventId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-7 gap-4 h-96 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const upcomingDeadlines = getUpcomingDeadlines();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="glass-effect shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Learning Timeline</h2>
            <div className="flex gap-3">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly View</SelectItem>
                  <SelectItem value="quarter">Quarterly View</SelectItem>
                  <SelectItem value="year">Yearly View</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => handleAddEvent()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-32 p-2 bg-white rounded-lg border transition-colors cursor-pointer ${
                    isCurrentMonth 
                      ? 'border-gray-200 hover:border-blue-300' 
                      : 'border-gray-100 bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleAddEvent(day)}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isToday ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event: TimelineEvent) => (
                      <div
                        key={event.id}
                        className={`text-xs p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${getEventTypeColor(event.type)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toast({ title: "Event details", description: event.description || event.title });
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        {event.type && (
                          <div className="text-xs opacity-75 capitalize">{event.type}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card className="glass-effect shadow-xl">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming deadlines</p>
                <p className="text-sm text-gray-500">Add deadlines to track important dates</p>
              </div>
            ) : (
              upcomingDeadlines.map((deadline: TimelineEvent) => {
                const daysLeft = getDaysUntil(deadline.date);
                const isUrgent = daysLeft <= 3;
                
                return (
                  <div
                    key={deadline.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      isUrgent 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isUrgent ? 'bg-red-500' : 'bg-orange-500'
                      }`}>
                        {isUrgent ? (
                          <AlertTriangle className="w-5 h-5 text-white" />
                        ) : (
                          <Clock className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{deadline.title}</h4>
                        <p className="text-sm text-gray-600">{deadline.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
                        {new Date(deadline.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
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
                        onClick={() => handleDeleteEvent(deadline.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        selectedDate={selectedDate}
        onSubmit={(eventData) => createEventMutation.mutate(eventData)}
        isLoading={createEventMutation.isPending}
      />
    </div>
  );
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSubmit: (eventData: InsertTimelineEvent) => void;
  isLoading: boolean;
}

function AddEventModal({ isOpen, onClose, selectedDate, onSubmit, isLoading }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    type: "study",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    
    onSubmit({
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date),
      type: formData.type,
      completed: false,
    });
    
    setFormData({ title: "", description: "", date: "", type: "study" });
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setFormData({ title: "", description: "", date: "", type: "study" });
    }
  };

  // Set default date when modal opens
  React.useEffect(() => {
    if (isOpen && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateStr }));
    }
  }, [isOpen, selectedDate]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">Add Timeline Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Study TensorFlow basics"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this event..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label>Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="study">Study Session</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-700"
            >
              {isLoading ? "Adding..." : "Add Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
