import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Lightbulb,
  BookOpen
} from "lucide-react";
import{
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  BarChart,
  Bar
} from 'recharts';
interface Profile {
  id: string;
  full_name: string;
  target_job: string;
  skills: string;
  experience_years: string;
  industry: string;
}

interface SkillAnalysis {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

const Analysis: React.FC = () => {
  // Read analysis result from localStorage
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("analysisResult");
    if (stored) {
      setAnalysisResult(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };
  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16 flex items-center justify-center">
        <div className="text-foreground text-xl">Analyzing your skills...</div>
      </section>
    );
  }

  if (!analysisResult) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">No Analysis Found</h2>
          <p className="text-muted-foreground">Please upload your resume to get skill analysis.</p>
          <Button onClick={() => window.location.hash = ""}>
            Go to Upload
          </Button>
        </div>
      </section>
    );
  }

  // Example analysisResult: { matchPercentage: number, missingSkills: string[], matchingSkills: string[] }
  return (
    <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Skill Gap Analysis
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            AI-powered insights into your current skills vs target role requirements
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Overall Match</p>
                  <p className="text-2xl font-bold text-foreground">{analysisResult.matchPercentage}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <Progress value={analysisResult.matchPercentage} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Skills to Improve</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analysisResult.missingSkills.length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Skills Mastered</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analysisResult.matchingSkills.length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skill Gap Details */}
          <div className="lg:col-span-2">
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Missing Skills & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysisResult.missingSkills.length === 0 ? (
                  <div className="text-green-600 font-semibold">No major skill gaps detected. Great job!</div>
                ) : (
                  analysisResult.missingSkills.map((skill: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg mb-2">
                      <span className="font-medium text-foreground">{skill}</span>
                      <div className="flex gap-2">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorial')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-xs"
                        >Google</a>
                        <a
                          href={`https://www.coursera.org/search?query=${encodeURIComponent(skill)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-xs"
                        >Coursera</a>
                        <a
                          href={`https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-xs"
                        >Udemy</a>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations & Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Quick Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisResult.missingSkills.length > 0 ? (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Focus on Missing Skills</h4>
                    <p className="text-sm text-muted-foreground">
                      Start learning the missing skills above to improve your match percentage.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">All Skills Matched</h4>
                    <p className="text-sm text-muted-foreground">
                      You have matched all required skills for your target role!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => window.location.hash = "courses"}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Find Relevant Courses
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.hash = "roadmap"}>
                  <Target className="h-4 w-4 mr-2" />
                  View Learning Path
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Resume
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analysis;