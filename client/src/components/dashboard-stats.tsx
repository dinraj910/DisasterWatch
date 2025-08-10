import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStats {
  activeEvents: number;
  countriesAffected: number;
  severityCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const lastUpdate = new Date().toLocaleTimeString();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emergency-critical/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-emergency-critical"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active Events</p>
              <p className="text-2xl font-bold text-foreground">{stats?.activeEvents || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emergency-high/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-globe text-emergency-high"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Countries Affected</p>
              <p className="text-2xl font-bold text-foreground">{stats?.countriesAffected || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-primary"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Last Update</p>
              <p className="text-lg font-bold text-foreground">{lastUpdate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emergency-low/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-emergency-low"></i>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">People Monitoring</p>
              <p className="text-2xl font-bold text-foreground">Live</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
