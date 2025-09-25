import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Upload, User, Loader2, X } from "lucide-react";

interface ProfileData {
  full_name: string;
  bio: string;
  current_status: string;
  education_level: string;
  education_detail: string;
  college_or_company: string;
  gender: string;
  dob: string;
  target_job: string;
  experience_years: string;
  industry: string;
  skills: string[];
  location: string;
  availability: string;
  salary_expectation: string;
}

const ProfileForm: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    bio: '',
    current_status: 'student',
    education_level: 'UG',
    education_detail: '',
    college_or_company: '',
    gender: '',
    dob: '',
    target_job: '',
    experience_years: '',
    industry: '',
    skills: [],
    location: '',
    availability: '',
    salary_expectation: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [skillInput, setSkillInput] = useState('');

  // Calculate profile completion percentage
  useEffect(() => {
    const requiredFields = ['full_name', 'current_status', 'education_level', 'target_job'];
    const optionalFields = ['education_detail', 'college_or_company', 'gender', 'dob', 'location'];
    
    const completedRequired = requiredFields.filter(field => {
      const value = formData[field as keyof ProfileData];
      return typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : false;
    }).length;
    
    const completedOptional = optionalFields.filter(field => {
      const value = formData[field as keyof ProfileData];
      return typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : false;
    }).length;

    const completion = ((completedRequired / requiredFields.length) * 60) + 
                     ((completedOptional / optionalFields.length) * 40);
    
    setProfileCompletion(Math.round(completion));
  }, [formData]);

  // Load existing profile data
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setFormData({
        full_name: data.full_name || '',
        bio:'',//Will be added to database later
        current_status: data.current_status || 'student',
        education_level: data.education_level || 'UG',
        education_detail: data.education_detail || '',
        college_or_company: data.college_or_company || '',
        gender: data.gender || '',
        dob: data.dob || '',
        target_job: data.target_job || '',
        experience_years: data.experience_years || '',
        industry: data.industry || '',
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        location: data.location || '',
        availability: data.availability || '',
        salary_expectation: data.salary_expectation || '',
      });
      setAvatarUrl(data.avatar_url || '');
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      let newAvatarUrl = avatarUrl;
      
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar() || avatarUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          skills: formData.skills.join(', '),
          avatar_url: newAvatarUrl,
        });

      if (error) throw error;

      toast({ title: "Profile updated successfully!" });
      
      // Redirect to roadmap after successful profile update
      setTimeout(() => {
        window.location.hash = "roadmap";
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkillAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const trimmedSkill = skillInput.trim();
      if (!formData.skills.includes(trimmedSkill)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, trimmedSkill]
        }));
      }
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <section className="min-h-screen bg-gradient-dark pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Complete Your Profile
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Tell us about yourself to get personalized recommendations
          </p>
          
          {/* Profile Completion Progress */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Profile Completion</span>
              <span className="text-sm text-primary font-medium">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
          </div>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20">
                      <User className="h-12 w-12 text-white/50" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-white">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                {/* Bio */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="A short bio about yourself"
                    rows={3}
                  />
                </div>
                {/* Current Status */}
                <div className="space-y-2">
                  <Label className="text-white">Current Status *</Label>
                  <Select
                    value={formData.current_status}
                    onValueChange={(value) => handleInputChange('current_status', value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="working">Working Professional</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="unemployed">Seeking Opportunities</SelectItem>
                      <SelectItem value="career_change">Career Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Education Level */}
                <div className="space-y-2">
                  <Label className="text-white">Education Level</Label>
                  <Select
                    value={formData.education_level}
                    onValueChange={(value) => handleInputChange('education_level', value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="UG">Undergraduate</SelectItem>
                      <SelectItem value="PG">Postgraduate</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Education Detail */}
                <div className="space-y-2">
                  <Label htmlFor="education_detail" className="text-white">
                    {formData.education_level === 'UG' || formData.education_level === 'PG' ? 'Degree/Major' : 'Program/Field'}
                  </Label>
                  <Input
                    id="education_detail"
                    value={formData.education_detail}
                    onChange={(e) => handleInputChange('education_detail', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder={formData.education_level === 'UG' ? 'e.g., Computer Science' : 'e.g., Data Science'}
                  />
                </div>

                {/* College or Company */}
                <div className="space-y-2">
                  <Label htmlFor="college_or_company" className="text-white">
                    {formData.current_status === 'student' ? 'College/University' : 'Company/Organization'}
                  </Label>
                  <Input
                    id="college_or_company"
                    value={formData.college_or_company}
                    onChange={(e) => handleInputChange('college_or_company', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder={formData.current_status === 'student' ? 'e.g., MIT' : 'e.g., Google'}
                  />
                </div>

                {/* Experience Years (if working) */}
                {(formData.current_status === 'working' || formData.current_status === 'freelancer') && (
                  <div className="space-y-2">
                    <Label className="text-white">Years of Experience</Label>
                    <Select
                      value={formData.experience_years}
                      onValueChange={(value) => handleInputChange('experience_years', value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Target Job */}
                <div className="space-y-2">
                  <Label htmlFor="target_job" className="text-white">Target Job Title *</Label>
                  <Input
                    id="target_job"
                    value={formData.target_job}
                    onChange={(e) => handleInputChange('target_job', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="e.g., Data Scientist, Software Engineer"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-white">Gender (Optional)</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-white">Date of Birth (Optional)</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-white">Current Skills</Label>
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillAdd}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Type a skill and press Enter to add"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-primary/20 text-white border-primary/30 hover:bg-primary/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    "Save & Continue to Roadmap"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.hash = "roadmap"}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProfileForm;