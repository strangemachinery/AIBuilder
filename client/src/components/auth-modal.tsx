import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Brain, Eye, EyeOff, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, mode = 'login' }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to Replit Auth instead of handling form submission
    window.location.href = '/api/login';
  };

  const handleClose = () => {
    onClose();
    setFormData({ fullName: '', email: '', password: '' });
    setShowPassword(false);
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-effect max-w-md">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 p-2"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <DialogHeader className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold gradient-text">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <p className="text-gray-600 mt-2">Access your learning journey</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="mt-2"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-700 hover:shadow-lg transition-all duration-300 mt-6"
          >
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              type="button"
              onClick={toggleAuthMode}
              className="text-blue-600 font-medium hover:underline"
            >
              {authMode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>Note:</strong> This demo uses Replit authentication. Click "Sign In" to continue with your Replit account.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
