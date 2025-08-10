import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 mr-3 bg-gradient-to-br from-blue-600 via-red-500 to-blue-800 rounded-full flex items-center justify-center">
                <i className="fas fa-globe text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-bold text-foreground">DisasterWatch</h1>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive("/") 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}>
                <i className="fas fa-chart-line mr-2"></i>Live Dashboard
              </Link>
              <Link href="/past-events" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive("/past-events") 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}>
                <i className="fas fa-history mr-2"></i>Past Events
              </Link>
              <Link href="/about" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive("/about") 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              }`}>
                <i className="fas fa-info-circle mr-2"></i>About
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Location Filter */}
            <div className="hidden sm:block">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="EU">Europe</SelectItem>
                  <SelectItem value="AS">Asia</SelectItem>
                  <SelectItem value="AF">Africa</SelectItem>
                  <SelectItem value="SA">South America</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "light" ? (
                <i className="fas fa-moon text-lg"></i>
              ) : (
                <i className="fas fa-sun text-lg"></i>
              )}
            </Button>
            
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <i className="fas fa-bars text-lg"></i>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
