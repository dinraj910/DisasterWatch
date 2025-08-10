import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useGeolocation } from "@/hooks/use-geolocation";

interface DashboardStats {
  activeEvents: number;
  countriesAffected: number;
  severityCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

export function EventTypeFilter() {
  const [eventTypeFilters, setEventTypeFilters] = useState<Record<string, boolean>>({
    earthquake: true,
    storm: true,
    wildfire: false,
    flood: false,
    volcano: false,
    tornado: false,
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
    refetchInterval: 60000,
  });

  const { getCurrentPosition, loading: geoLoading } = useGeolocation();

  const handleFilterChange = (eventType: string, checked: boolean) => {
    setEventTypeFilters(prev => ({
      ...prev,
      [eventType]: checked
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Filter by Type</h3>
          <div className="space-y-3">
            {Object.entries(eventTypeFilters).map(([eventType, checked]) => (
              <div key={eventType} className="flex items-center space-x-2">
                <Checkbox
                  id={eventType}
                  checked={checked}
                  onCheckedChange={(checked) => handleFilterChange(eventType, !!checked)}
                />
                <label
                  htmlFor={eventType}
                  className="text-sm text-foreground cursor-pointer flex-1"
                >
                  {eventType.charAt(0).toUpperCase() + eventType.slice(1)}s ({stats?.typeCounts[eventType] || 0})
                </label>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Severity Levels</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Critical</span>
              <span className="text-2xl font-bold text-emergency-critical">
                {stats?.severityCounts.critical || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">High</span>
              <span className="text-2xl font-bold text-emergency-high">
                {stats?.severityCounts.high || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Medium</span>
              <span className="text-2xl font-bold text-emergency-medium">
                {stats?.severityCounts.medium || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Low</span>
              <span className="text-2xl font-bold text-emergency-low">
                {stats?.severityCounts.low || 0}
              </span>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Your Location</h3>
          <Button
            onClick={getCurrentPosition}
            disabled={geoLoading}
            className="w-full"
            variant="outline"
          >
            <i className="fas fa-crosshairs mr-2"></i>
            {geoLoading ? "Detecting..." : "Detect My Location"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Get personalized alerts for your area
          </p>
        </div>
      </Card>
    </div>
  );
}
