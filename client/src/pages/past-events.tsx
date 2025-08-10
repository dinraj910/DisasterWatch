import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DisasterEvent } from "@shared/schema";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'high': return 'default';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'outline';
  }
};

export default function PastEvents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: events = [], isLoading, error } = useQuery<DisasterEvent[]>({
    queryKey: ["/api/events/past", { limit: 200, offset: 0 }],
    queryFn: async () => {
      const response = await fetch("/api/events/past?limit=200&offset=0");
      if (!response.ok) throw new Error("Failed to fetch past events");
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 60000, // Consider data fresh for 1 minute
  });

  // Also get some recent active events as "recent past" if no past events exist
  const { data: recentEvents = [] } = useQuery<DisasterEvent[]>({
    queryKey: ["/api/events/live"],
    enabled: events.length === 0, // Only fetch if no past events
  });

  // Combine past events with older recent events if needed
  const allEvents = events.length > 0 ? events : recentEvents.slice(5); // Use older events if no past events

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || 
      event.eventType.toLowerCase() === typeFilter.toLowerCase();

    const matchesDate = dateFilter === "all" || (() => {
      const eventDate = new Date(event.date);
      const now = new Date();
      
      switch (dateFilter) {
        case "week":
          return (now.getTime() - eventDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        case "month":
          return (now.getTime() - eventDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        case "year":
          return (now.getTime() - eventDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesDate && matchesType;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  // Get unique event types for filter
  const eventTypesSet = new Set(allEvents.map(event => event.eventType));
  const eventTypes = Array.from(eventTypesSet);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading past events...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error loading past events</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <div className="p-6 border-b border-border">
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Historical Events</h2>
              <p className="text-muted-foreground">
                Browse through past natural disasters and historical events. 
                {allEvents.length > 0 ? ` ${allEvents.length} events in database.` : ' Loading events...'}
              </p>
              
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                  <Input
                    type="text"
                    placeholder="Search events by title, description, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {getEventIcon(type)} {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : paginatedEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-6">
                  <i className="fas fa-calendar-times text-6xl text-muted-foreground/50"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || dateFilter !== 'all' || typeFilter !== 'all' 
                    ? 'No events match your current filters. Try adjusting your search criteria.'
                    : 'No historical events are currently available in the database. Events will appear here as they are archived.'
                  }
                </p>
                {(searchQuery || dateFilter !== 'all' || typeFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setDateFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                    <div className="relative">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <span className="text-6xl opacity-50">
                            {getEventIcon(event.eventType)}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant={getSeverityColor(event.severity) as any} className="text-xs">
                          {event.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {event.eventType}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <i className="fas fa-clock"></i>
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{event.source}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
                        {event.description || 'No detailed description available for this event.'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{event.location.country}</span>
                          {event.location.region && (
                            <>
                              <span>, {event.location.region}</span>
                            </>
                          )}
                        </div>
                        {event.magnitude && (
                          <Badge variant="outline" className="text-xs">
                            M{event.magnitude}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left mr-1"></i>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <i className="fas fa-chevron-right ml-1"></i>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
