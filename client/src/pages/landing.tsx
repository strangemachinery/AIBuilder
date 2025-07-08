import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BookOpen, Target, TrendingUp, Users, CheckCircle } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Comprehensive Resource Library",
      description: "Access 100+ curated learning resources across AI, ML, and automation technologies"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Personalized Learning Paths",
      description: "Custom roadmaps tailored to your experience level and career goals"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Detailed analytics and insights to monitor your learning journey"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Recommendations",
      description: "AI-powered suggestions based on industry trends and your progress"
    }
  ];

  const stats = [
    { number: "100+", label: "Learning Resources" },
    { number: "50+", label: "Free Courses" },
    { number: "15+", label: "Technology Categories" },
    { number: "90%", label: "Completion Rate" }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="glass-effect rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text">AI Learning Hub</h1>
                <p className="text-gray-600">Advanced Learning Tracker & Progress Manager</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/api/login'}
                className="border-blue-200 hover:bg-blue-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-gradient-to-r from-blue-500 to-purple-700 hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="glass-effect rounded-2xl p-8 md:p-12 mb-8 shadow-xl text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Master <span className="gradient-text">AI Automation</span> with Structured Learning
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your career with our comprehensive learning tracker designed specifically for AI Automation Engineers. 
              Track progress, follow curated paths, and achieve your goals faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-gradient-to-r from-blue-500 to-purple-700 hover:shadow-lg transition-all duration-300 text-lg px-8 py-4"
              >
                Start Learning Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-blue-200 hover:bg-blue-50 text-lg px-8 py-4"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-effect shadow-xl hover-lift">
              <CardContent className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="glass-effect rounded-2xl p-8 mb-8 shadow-xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive tools and features designed to accelerate your learning in AI and automation technologies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-white bg-opacity-60 rounded-xl hover:bg-opacity-80 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-700 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Paths Preview */}
        <div className="glass-effect rounded-2xl p-8 mb-8 shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Choose Your Learning Path</h3>
            <p className="text-gray-600 text-lg">Structured roadmaps for every experience level</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover-lift border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h4 className="text-xl font-bold">Beginner Path</h4>
                  <p className="text-gray-600 text-sm">0-2 years experience</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Python & Programming Fundamentals
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Machine Learning Basics
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Cloud Platforms Introduction
                  </li>
                </ul>
                <div className="text-center">
                  <span className="text-sm text-gray-500">Est. 18 months</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-blue-300 bg-blue-50 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h4 className="text-xl font-bold">Intermediate Path</h4>
                  <p className="text-gray-600 text-sm">2-5 years experience</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Advanced ML & Deep Learning
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    MLOps & DevOps Integration
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    AI Agents & Automation
                  </li>
                </ul>
                <div className="text-center">
                  <span className="text-sm text-gray-500">Est. 15 months</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift border-2 border-gray-200 hover:border-purple-300 transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h4 className="text-xl font-bold">Advanced Path</h4>
                  <p className="text-gray-600 text-sm">5+ years experience</p>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Multi-Agent Systems
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Cutting-Edge Research
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    AI Leadership & Strategy
                  </li>
                </ul>
                <div className="text-center">
                  <span className="text-sm text-gray-500">Est. 12 months</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass-effect rounded-2xl p-8 shadow-xl text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Accelerate Your AI Career?</h3>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already using our platform to master AI automation and advance their careers.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-blue-500 to-purple-700 hover:shadow-lg transition-all duration-300 text-lg px-8 py-4"
          >
            Start Your Journey Today
          </Button>
        </div>
      </div>
    </div>
  );
}
