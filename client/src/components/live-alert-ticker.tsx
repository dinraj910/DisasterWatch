import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/hooks/use-socket";
import { useEffect, useState } from "react";
import type { DisasterEvent } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Eye, Clock, MapPin, AlertTriangle } from "lucide-react";

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'high': return 'default';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'outline';
  }
};

const getEventIcon = (eventType: string): string => {
  switch (eventType.toLowerCase()) {
    case 'earthquake': return '🌍';
    case 'hurricane': return '🌀';
    case 'tornado': return '🌪️';
    case 'flood': return '🌊';
    case 'wildfire': return '🔥';
    case 'volcano': return '🌋';
    case 'storm': return '⛈️';
    default: return '⚠️';
  }
};

export function LiveAlertTicker() {
  const [recentEvents, setRecentEvents] = useState<DisasterEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null);
  const { onNewEvent } = useSocket();

  const { data: initialEvents = [] } = useQuery<DisasterEvent[]>({
    queryKey: ["/api/events/live"],
    refetchInterval: 60000,
  });

  useEffect(() => {
    // Set initial events (most recent 20 for better content)
    const sorted = [...initialEvents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
    setRecentEvents(sorted);
  }, [initialEvents]);

  useEffect(() => {
    // Listen for new events via Socket.IO
    const unsubscribe = onNewEvent((newEvent) => {
      setRecentEvents(prev => {
        const updated = [newEvent, ...prev].slice(0, 20); // Keep latest 20
        return updated;
      });
    });

    return unsubscribe;
  }, [onNewEvent]);

  if (recentEvents.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            Live Alert Feed
            <Badge variant="secondary" className="ml-2">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading recent alerts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          Live Alert Feed
          <Badge variant="secondary" className="ml-2">
            {recentEvents.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-6 pb-6">
          <div className="space-y-3">
            {recentEvents.map((event, index) => (
              <Card 
                key={`${event.id}-${index}`}
                className="border border-border/50 hover:border-border transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-1">
                      {getEventIcon(event.eventType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={getSeverityColor(event.severity) as any}
                          className="text-xs px-2 py-0.5"
                        >
                          {event.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {event.eventType}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(event.date).toLocaleString()}
                        </div>
                        {index === 0 && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            NEW
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="text-sm font-semibold text-foreground mb-2 line-clamp-2">
                        {event.title}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {event.description && event.description.length > 120 
                          ? event.description.substring(0, 120) + '...' 
                          : event.description || 'No additional details available.'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location.country}{event.location.region ? `, ${event.location.region}` : ''}
                          </div>
                          <span>📊 {event.source}</span>
                          {event.magnitude && (
                            <span>🌍 M{event.magnitude}</span>
                          )}
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => setSelectedEvent(event)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <span className="text-2xl">{getEventIcon(event.eventType)}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    {event.title}
                                    <Badge variant={getSeverityColor(event.severity) as any}>
                                      {event.severity.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground font-normal capitalize">
                                    {event.eventType} • {new Date(event.date).toLocaleString()}
                                  </div>
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Event Details</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {event.description || 'No detailed description available for this event.'}
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Location</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4" />
                                      <span>{event.location.country}</span>
                                    </div>
                                    {event.location.region && (
                                      <div className="text-muted-foreground ml-6">
                                        Region: {event.location.region}
                                      </div>
                                    )}
                                    <div className="text-muted-foreground ml-6">
                                      Coordinates: {event.location.lat.toFixed(4)}, {event.location.lon.toFixed(4)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Event Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4" />
                                      <span>Severity: {event.severity}</span>
                                    </div>
                                    {event.magnitude && (
                                      <div className="text-muted-foreground ml-6">
                                        Magnitude: {event.magnitude}
                                      </div>
                                    )}
                                    <div className="text-muted-foreground ml-6">
                                      Source: {event.source}
                                    </div>
                                    <div className="text-muted-foreground ml-6">
                                      Status: {event.isActive ? 'Active' : 'Historical'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {event.imageUrl && (
                                <div>
                                  <h4 className="font-semibold mb-2">Related Image</h4>
                                  <img 
                                    src={event.imageUrl} 
                                    alt={event.title}
                                    className="w-full h-48 object-cover rounded-lg border"
                                  />
                                </div>
                              )}
                              
                              <div className="flex justify-end">
                                <Button variant="outline" size="sm" asChild>
                                  <a 
                                    href={`https://www.google.com/search?q=${encodeURIComponent(event.title + ' ' + event.location.country)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Search for News
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        {recentEvents.length >= 20 && (
          <div className="px-6 pb-4 pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              Showing latest 20 alerts • More events available in dashboard
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
