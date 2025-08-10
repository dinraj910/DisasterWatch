import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DisasterEvent } from "@shared/schema";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PastEvents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: events = [], isLoading } = useQuery<DisasterEvent[]>({
    queryKey: ["/api/events/past"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = !dateFilter || dateFilter === "all" || (() => {
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

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h2 className="text-lg font-semibold text-foreground">Historical Events</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Time" />
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {event.imageUrl && (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getSeverityVariant(event.severity)}>
                          {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-2">{event.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        <span>{event.location.country}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {filteredEvents.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredEvents.length)}</span> of{" "}
                  <span className="font-medium">{filteredEvents.length}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
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

function getSeverityVariant(severity: string): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    critical: "destructive",
    high: "destructive",
    medium: "outline",
    low: "secondary",
  };
  return variants[severity] || "default";
}
