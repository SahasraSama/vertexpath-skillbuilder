import React, { useState, useCallback } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Globe, Loader2 } from "lucide-react";

const UploadForm: React.FC = () => {
  // Helper: Call FastAPI backend for skill match
  async function checkJobSkillMatch(resumeText: string, jobTitle: string) {
    const response = await fetch("http://localhost:8000/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_text: resumeText, job_title: jobTitle }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Search failed");
    }
    return await response.json();
  }
  const [uploadMethod, setUploadMethod] = useState<"file" | "linkedin" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [skillResult, setSkillResult] = useState<any>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".pdf")) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive"
        });
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setSkillResult(null);
    try {
      let extractedText = "";
      if (uploadMethod === "file" && file) {
        extractedText = await file.text();
        if (!extractedText.trim()) throw new Error("Could not extract text from PDF. Please use a text-based PDF or paste your resume.");
      } else if (uploadMethod === "linkedin") {
        if (!linkedinUrl.trim()) throw new Error("LinkedIn URL is required.");
        extractedText = linkedinUrl.trim();
      } else if (uploadMethod === "text") {
        if (!resumeText.trim()) throw new Error("Resume text is required.");
        extractedText = resumeText.trim();
      } else {
        throw new Error("No upload method selected.");
      }
      if (!jobTitle.trim()) throw new Error("Job title is required.");
      const result = await checkJobSkillMatch(extractedText, jobTitle.trim());
      setSkillResult(result);
      toast({
        title: "Skill Match Complete",
        description: result.similarity !== undefined ? `Similarity: ${(result.similarity * 100).toFixed(1)}%` : "No similarity calculated",
      });
    } catch (error: any) {
      toast({
        title: "Processing failed",
        description: error.message || "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-dark pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Upload Your Resume
          </h1>
          <p className="text-gray-300 text-lg">
            Get personalized skill analysis and learning recommendations
          </p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Choose Upload Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Method Selection */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant={uploadMethod === "file" ? "default" : "outline"}
                onClick={() => setUploadMethod("file")}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <Button
                type="button"
                variant={uploadMethod === "linkedin" ? "default" : "outline"}
                onClick={() => setUploadMethod("linkedin")}
                className="flex-1"
              >
                <Globe className="mr-2 h-4 w-4" />
                LinkedIn URL
              </Button>
              <Button
                type="button"
                variant={uploadMethod === "text" ? "default" : "outline"}
                onClick={() => setUploadMethod("text")}
                className="flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                Paste Text
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dream Job Title Input */}
              <div className="space-y-2">
                <Label htmlFor="job-title" className="text-white">Dream Job Title</Label>
                <Input
                  id="job-title"
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
              {/* File Upload */}
              {uploadMethod === "file" && (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver 
                      ? "border-primary bg-primary/5" 
                      : "border-white/20 hover:border-white/40"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="h-12 w-12 text-primary mx-auto" />
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-white mb-1">
                          Drop your resume here, or click to browse
                        </p>
                        <p className="text-gray-400 text-sm">
                          PDF files only, max 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label
                        htmlFor="file-upload"
                        className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        Browse Files
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {/* LinkedIn URL */}
              {uploadMethod === "linkedin" && (
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-white">
                    LinkedIn Profile URL
                  </Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              )}

              {/* Text Input */}
              {uploadMethod === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="resume-text" className="text-white">
                    Paste Your Resume Text
                  </Label>
                  <Textarea
                    id="resume-text"
                    placeholder="Copy and paste your resume content here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 min-h-[200px]"
                    required
                  />
                </div>
              )}

              {/* Privacy Notice */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-300 text-sm">
                  🔒 <strong>Privacy Notice:</strong> Demo data is not stored. 
                  Your resume is processed securely and temporarily for analysis only.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  isProcessing || 
                  (uploadMethod === "file" && !file) ||
                  (uploadMethod === "linkedin" && !linkedinUrl) ||
                  (uploadMethod === "text" && !resumeText)
                }
                className="w-full bg-gradient-primary hover:opacity-90 text-white py-3"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Resume...
                  </>
                ) : (
                  "Analyze Skills"
                )}
              </Button>
            </form>
            {/* Skill Match Results */}
            {skillResult && (
              <div className="mt-8 bg-white/10 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Skill Match Results</h2>
                {skillResult.error ? (
                  <p className="text-red-400">{skillResult.error}</p>
                ) : (
                  <>
                    <p className="text-white mb-2">Job Title: <span className="font-semibold">{skillResult.job_title}</span></p>
                    <p className="text-white mb-2">Similarity: <span className="font-semibold">{(skillResult.similarity * 100).toFixed(1)}%</span></p>
                    <div className="mb-2">
                      <p className="text-white font-semibold">Required Skills:</p>
                      <ul className="list-disc ml-6">
                        {skillResult.job_skills.map((skill: string, idx: number) => (
                          <li key={idx} className="text-white">{skill}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-2">
                      <p className="text-white font-semibold">Resume Skills:</p>
                      <ul className="list-disc ml-6">
                        {skillResult.resume_skills.map((skill: string, idx: number) => (
                          <li key={idx} className="text-white">{skill}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Skill Matches:</p>
                      <ul className="list-disc ml-6">
                        {skillResult.skill_matches.map((match: any, idx: number) => (
                          <li key={idx} className={match.matched ? "text-green-400" : "text-red-400"}>
                            {match.skill} {match.matched ? "✔️" : "❌"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default UploadForm;