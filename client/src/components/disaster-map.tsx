import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DisasterEvent } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

declare global {
  interface Window {
    L: any;
  }
}

export function DisasterMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  const { data: events = [] } = useQuery<DisasterEvent[]>({
    queryKey: ["/api/events/live"],
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current).setView([20, 0], 2);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer.options && layer.options.isMarker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add markers for events
    events.forEach(event => {
      if (event.location && event.location.lat && event.location.lon) {
        const severity = event.severity;
        const color = getSeverityColor(severity);
        
        const marker = window.L.circleMarker([event.location.lat, event.location.lon], {
          color: color,
          fillColor: color,
          fillOpacity: 0.7,
          radius: getSeverityRadius(severity),
          isMarker: true,
        }).addTo(mapInstanceRef.current);

        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold">${event.title}</h3>
            <p class="text-sm text-gray-600">${event.description || ''}</p>
            <p class="text-xs text-gray-500 mt-2">
              <i class="fas fa-map-marker-alt mr-1"></i>
              ${event.location.country}
            </p>
            <p class="text-xs text-gray-500">
              <i class="fas fa-clock mr-1"></i>
              ${new Date(event.date).toLocaleString()}
            </p>
          </div>
        `);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events]);

  return (
    <Card className="mb-8">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Global Disaster Map</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-emergency-critical rounded-full"></div>
              <span className="text-muted-foreground">Critical</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-emergency-high rounded-full"></div>
              <span className="text-muted-foreground">High</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-emergency-medium rounded-full"></div>
              <span className="text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-emergency-low rounded-full"></div>
              <span className="text-muted-foreground">Low</span>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-0">
        <div ref={mapRef} className="h-96 w-full rounded-b-lg"></div>
      </CardContent>
    </Card>
  );
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: "#dc2626",
    high: "#f59e0b", 
    medium: "#f97316",
    low: "#10b981",
  };
  return colors[severity] || "#6b7280";
}

function getSeverityRadius(severity: string): number {
  const radii: Record<string, number> = {
    critical: 12,
    high: 10,
    medium: 8,
    low: 6,
  };
  return radii[severity] || 6;
}
