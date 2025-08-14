import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Heart, User, History, Home } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

export const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <header 
      className="relative bg-gradient-primary text-primary-foreground shadow-glow overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(var(--primary) / 0.9), hsl(var(--primary-glow) / 0.9)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'multiply'
      }}
    >
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SmartMed</h1>
              <p className="text-primary-foreground/90 text-xs sm:text-sm font-medium">Your intelligent medication companion</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Button 
              asChild
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              size="sm"
              className="text-primary-foreground hover:bg-white/10"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            
            <Button 
              asChild
              variant={location.pathname === "/history" ? "secondary" : "ghost"}
              size="sm"
              className="text-primary-foreground hover:bg-white/10"
            >
              <Link to="/history">
                <History className="h-4 w-4 mr-2" />
                History
              </Link>
            </Button>
            
            <Button 
              asChild
              variant={location.pathname === "/profile" ? "secondary" : "ghost"}
              size="sm"
              className="text-primary-foreground hover:bg-white/10"
            >
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Decorative overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
    </header>
  );
};