import { Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-medical.jpg";

export const Header = () => {
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
          
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 backdrop-blur-sm">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Decorative overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
    </header>
  );
};