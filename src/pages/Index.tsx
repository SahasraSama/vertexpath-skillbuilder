import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import AuthModal from "@/components/AuthModal";
import UploadForm from "@/components/UploadForm";
import ProfileForm from "@/components/ProfileForm";
import PersonalizedRoadmap from "@/pages/PersonalizedRoadmap";
import Courses from "@/pages/Courses";
import Analysis from "@/pages/Analysis";
import Community from "@/pages/Community";
import { 
  Upload, 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ChevronRight,
  Star,
  Globe,
  Zap,
  BarChart3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import vertexPathLogo from "@/assets/vertexpath-logo.png";

const Index = () => {
  const { user, signOut } = useAuth();
  const [currentSection, setCurrentSection] = useState("home");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const mockSkills = ["JavaScript", "Python", "React", "SQL", "AWS"];
  const mockCourses = [
    { name: "Python for Data Science", platform: "Coursera", hours: 20, level: "Beginner", free: true },
    { name: "Advanced SQL", platform: "Udemy", hours: 15, level: "Intermediate", free: false },
    { name: "React Masterclass", platform: "Frontend Masters", hours: 25, level: "Advanced", free: false },
  ];

  const handleSectionChange = (section: string) => {
    if ((section === "analysis" || section === "courses") && !user) {
      setAuthMode("signup");
      setIsAuthModalOpen(true);
      return;
    }
    if (section === "community" && !user) {
      setAuthMode("signup");
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentSection(section);
    setIsMenuOpen(false);
  };

  const handleUploadClick = () => {
    if (!user) {
      setAuthMode("signin");
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentSection("upload");
  };

  // Navigation Component
  const Navigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleSectionChange("home")}
          >
            <img src={vertexPathLogo} alt="VertexPath" className="h-8 w-8" />
            <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              VertexPath
            </span>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-muted"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
              <button 
                onClick={() => handleSectionChange("home")}
                className="text-foreground hover:text-primary transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => handleSectionChange("courses")}
                className="text-foreground hover:text-primary transition-colors"
              >
                Courses
              </button>
              <button 
                onClick={() => handleSectionChange("analysis")}
                className="text-foreground hover:text-primary transition-colors"
              >
                Analysis
              </button>
              <button 
                onClick={() => handleSectionChange("community")}
                className="text-foreground hover:text-primary transition-colors"
              >
                Community
              </button>
              {user && (
                <button 
                  onClick={() => handleSectionChange("roadmap")}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Roadmap
                </button>
              )}
            </nav>

            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-2">
                    <User size={20} />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleSectionChange("profile")}>
                    <Settings size={16} className="mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => {
                  setAuthMode("signin");
                  setIsAuthModalOpen(true);
                }} 
                className="bg-gradient-primary hover:opacity-90"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-4 py-4 space-y-4">
              <nav className="space-y-3">
                <button 
                  onClick={() => handleSectionChange("home")}
                  className="block text-foreground hover:text-primary transition-colors w-full text-left"
                >
                  Home
                </button>
                <button 
                  onClick={() => handleSectionChange("courses")}
                  className="block text-foreground hover:text-primary transition-colors w-full text-left"
                >
                  Courses
                </button>
                <button 
                  onClick={() => handleSectionChange("analysis")}
                  className="block text-foreground hover:text-primary transition-colors w-full text-left"
                >
                  Analysis
                </button>
                <button 
                  onClick={() => handleSectionChange("community")}
                  className="block text-foreground hover:text-primary transition-colors w-full text-left"
                >
                  Community
                </button>
                {user && (
                  <button 
                    onClick={() => handleSectionChange("roadmap")}
                    className="block text-foreground hover:text-primary transition-colors w-full text-left"
                  >
                    Roadmap
                  </button>
                )}
              </nav>
              
              {user ? (
                <div className="pt-4 border-t space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2"
                    onClick={() => handleSectionChange("profile")}
                  >
                    <Settings size={16} />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={signOut}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    setAuthMode("signin");
                    setIsAuthModalOpen(true);
                  }} 
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  // Hero Section
  const HeroSection = () => (
    <section className="min-h-screen bg-gradient-dark flex items-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            VertexPath — Turns skill gaps into{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              real learning paths
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload your resume or paste LinkedIn. Get curated free & paid courses, track progress, and auto-upgrade your resume.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleUploadClick}
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-white px-8 py-3 text-lg"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Resume
            </Button>
            <Button 
              onClick={handleUploadClick}
              variant="outline" 
              size="lg" 
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg"
            >
              <Globe className="mr-2 h-5 w-5" />
              Paste LinkedIn URL
            </Button>
          </div>
        </div>
      </div>
    </section>
  );

  // Trusted Section
  const TrustedSection = () => (
    <section className="bg-gradient-section py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gray-300 text-lg mb-8">Trusted by learners worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-gray-300">Active Learners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">95%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-gray-300">Partner Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">1M+</div>
              <div className="text-gray-300">Skills Matched</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Features Section
  const FeaturesSection = () => (
    <section className="bg-gradient-section py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How VertexPath Works
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Transform your career with AI-powered skill gap analysis and personalized learning paths
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <Target className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Upload your resume or LinkedIn profile to get instant skill gap analysis and career insights.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Curated Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Get personalized course recommendations from trusted platforms with difficulty and duration matching.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Monitor your learning journey with skill timelines and automatically update your resume.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );

  // Community Section
  const CommunitySection = () => (
    <section className="bg-gradient-section py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Learning Community
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Join the community to share your learning journey and get inspired
          </p>
          {!user ? (
            <Button 
              onClick={() => {
                setAuthMode("signup");
                setIsAuthModalOpen(true);
              }}
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              Sign Up
            </Button>
          ) : (
            <Button 
              onClick={() => handleSectionChange("community")}
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              Join Community
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'Sarah Chen',
              content: 'Just completed Python for Data Science! Added to my resume 🎉',
              time: '2 hours ago',
              likes: 12
            },
            {
              name: 'Michael Rodriguez', 
              content: 'VertexPath helped me transition from marketing to UX design. Got my dream job!',
              time: '1 day ago',
              likes: 28
            },
            {
              name: 'Emily Johnson',
              content: 'The AWS certification path was perfect. Passed on first try thanks to the structured learning!',
              time: '3 days ago', 
              likes: 19
            }
          ].map((review, i) => (
            <Card key={i} className="bg-white/5 border-white/10 dark:bg-white/5 dark:border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white dark:text-white">{review.name}</h4>
                    <p className="text-sm text-gray-300 dark:text-gray-300 mt-1">
                      {review.content}
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-400 dark:text-gray-400">
                      <span>{review.time}</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {review.likes} likes
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );

  // CTA Section
  const CTASection = () => (
    <section className="bg-gradient-section py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to bridge your skill gap?
        </h2>
        <p className="text-gray-300 text-lg mb-8">
          Start your personalized learning journey today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleUploadClick}
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 text-white"
          >
            Get Started Free
          </Button>
          <Button 
            onClick={() => handleSectionChange("community")}
            variant="outline" 
            size="lg" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            Join Community
          </Button>
        </div>
      </div>
    </section>
  );

  // Footer
  const Footer = () => (
    <footer className="bg-gradient-dark border-t border-white/10 dark:bg-gradient-dark dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-white dark:text-white mb-4">Product</h3>
            <ul className="space-y-2 text-gray-300 dark:text-gray-300">
              <li><button onClick={() => handleSectionChange("home")} className="hover:text-primary transition-colors">Features</button></li>
              <li><button onClick={() => window.open('#pricing', '_self')} className="hover:text-primary transition-colors">Pricing</button></li>
              <li><button onClick={() => window.open('#api', '_self')} className="hover:text-primary transition-colors">API</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white dark:text-white mb-4">Company</h3>
            <ul className="space-y-2 text-gray-300 dark:text-gray-300">
              <li><button onClick={() => window.open('#about', '_self')} className="hover:text-primary transition-colors">About</button></li>
              <li><button onClick={() => window.open('#careers', '_self')} className="hover:text-primary transition-colors">Careers</button></li>
              <li><button onClick={() => window.open('#blog', '_self')} className="hover:text-primary transition-colors">Blog</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white dark:text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-300 dark:text-gray-300">
              <li><button onClick={() => window.open('#docs', '_self')} className="hover:text-primary transition-colors">Documentation</button></li>
              <li><button onClick={() => window.open('#help', '_self')} className="hover:text-primary transition-colors">Help Center</button></li>
              <li><button onClick={() => handleSectionChange("community")} className="hover:text-primary transition-colors">Community</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-300 dark:text-gray-300">
              <li><button onClick={() => window.open('#privacy', '_self')} className="hover:text-primary transition-colors">Privacy</button></li>
              <li><button onClick={() => window.open('#terms', '_self')} className="hover:text-primary transition-colors">Terms</button></li>
              <li><button onClick={() => window.open('#security', '_self')} className="hover:text-primary transition-colors">Security</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400 dark:text-gray-400">
          <p>&copy; 2024 VertexPath. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );

  // Auth Required Message
  const AuthRequiredMessage = ({ section }: { section: string }) => (
    <section className="min-h-screen bg-gradient-dark flex items-center pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          {section === "analysis" ? "Skill Analysis" : section === "courses" ? "Course Recommendations" : "Community"}
        </h2>
        <p className="text-gray-300 text-lg mb-8">
          Please sign up to access your skill analysis and personalized recommendations
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => {
              setAuthMode("signup");
              setIsAuthModalOpen(true);
            }}
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 text-white"
          >
            Sign Up
          </Button>
          <Button 
            onClick={() => {
              setAuthMode("signin");
              setIsAuthModalOpen(true);
            }}
            variant="outline" 
            size="lg" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            Sign In
          </Button>
        </div>
      </div>
    </section>
  );

  // Render current section
  const renderCurrentSection = () => {
    switch (currentSection) {
      case "upload":
        return <UploadForm />;
      case "profile":
        return <ProfileForm />;
      case "roadmap":
        return <PersonalizedRoadmap />;
      case "analysis":
        return <Analysis />;
      case "courses":
        return <Courses />;
      case "community":
        return <Community />;
      case "home":
      default:
        return (
          <>
            <HeroSection />
            <TrustedSection />
            <FeaturesSection />
            <CommunitySection />
            <CTASection />
            <Footer />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:bg-gradient-dark">
      <Navigation />
      {renderCurrentSection()}
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
      />
    </div>
  );
};

export default Index;