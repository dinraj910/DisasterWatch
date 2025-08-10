import { useQuery } from "@tanstack/react-query";
import type { DisasterEvent } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LiveEventsFeed() {
  const { data: events = [], isLoading } = useQuery<DisasterEvent[]>({
    queryKey: ["/api/events/live"],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Live Events Feed</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>
        </div>
        <CardContent className="divide-y divide-border max-h-96 overflow-y-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Live Events Feed</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </div>
      
      <CardContent className="divide-y divide-border max-h-96 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="p-6 hover:bg-muted/50 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityBackgroundClass(event.severity)}`}>
                  <i className={`${getEventTypeIcon(event.eventType)} ${getSeverityTextClass(event.severity)}`}></i>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <Badge variant={getSeverityVariant(event.severity)} className="ml-2">
                    {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  <span>{event.location.country}</span>
                  <span className="mx-2">•</span>
                  <i className="fas fa-clock mr-1"></i>
                  <span>{getRelativeTime(event.date)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {events.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            <i className="fas fa-info-circle text-2xl mb-2"></i>
            <p>No active events at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getEventTypeIcon(eventType: string): string {
  const icons: Record<string, string> = {
    earthquake: "fas fa-home",
    tornado: "fas fa-tornado",
    flood: "fas fa-water",
    wildfire: "fas fa-fire",
    volcano: "fas fa-mountain",
    hurricane: "fas fa-hurricane",
    tsunami: "fas fa-water",
    storm: "fas fa-bolt",
  };
  return icons[eventType.toLowerCase()] || "fas fa-exclamation-triangle";
}

function getSeverityBackgroundClass(severity: string): string {
  const classes: Record<string, string> = {
    critical: "bg-emergency-critical/10",
    high: "bg-emergency-high/10",
    medium: "bg-emergency-medium/10",
    low: "bg-emergency-low/10",
  };
  return classes[severity] || "bg-muted";
}

function getSeverityTextClass(severity: string): string {
  const classes: Record<string, string> = {
    critical: "text-emergency-critical",
    high: "text-emergency-high",
    medium: "text-emergency-medium",
    low: "text-emergency-low",
  };
  return classes[severity] || "text-muted-foreground";
}

function getSeverityVariant(severity: string): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    critical: "destructive",
    high: "destructive",
    medium: "outline",
    low: "secondary",
  };
  return variants[severity] || "default";
}

function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const eventDate = new Date(date);
  const diffMs = now.getTime() - eventDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
