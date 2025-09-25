import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Menu, 
  X, 
  User, 
  BarChart3, 
  Map, 
  BookOpen, 
  Settings,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  user: any;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentSection, 
  onSectionChange, 
  user, 
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "analysis", label: "Analysis", icon: BarChart3 },
    { id: "roadmap", label: "Roadmap", icon: Map },
    { id: "courses", label: "Courses", icon: BookOpen },
  ];

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsOpen(false); // Close sidebar on mobile after selection
  };

  if (!user) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-20 left-4 z-50 bg-background/80 backdrop-blur"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-full bg-background/95 backdrop-blur border-r transition-transform duration-300 z-40",
          "w-64 md:w-16 lg:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12",
                  "md:justify-center lg:justify-start",
                  "group relative overflow-hidden",
                  isActive && "bg-primary/10 text-primary border-primary/20"
                )}
                onClick={() => handleSectionChange(item.id)}
              >
                <Icon 
                  size={20} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                <span className="md:hidden lg:inline">
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight 
                    size={16} 
                    className="ml-auto md:hidden lg:inline text-primary" 
                  />
                )}
              </Button>
            );
          })}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;