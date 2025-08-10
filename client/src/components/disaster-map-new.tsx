import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DisasterEvent } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

interface DisasterMapProps {
  events?: DisasterEvent[];
  onEventClick?: (event: DisasterEvent) => void;
  className?: string;
  height?: string;
}

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#6b7280';
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

const getSeverityRadius = (severity: string): number => {
  const radii: Record<string, number> = {
    critical: 15,
    high: 12,
    medium: 10,
    low: 8,
  };
  return radii[severity] || 8;
};

export function DisasterMap({ events: propEvents, onEventClick, className = "", height = "400px" }: DisasterMapProps = {}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  const { data: queryEvents = [] } = useQuery<DisasterEvent[]>({
    queryKey: ["/api/events/live"],
    refetchInterval: 60000,
  });

  // Use prop events if provided, otherwise use query events
  const events = propEvents || queryEvents;

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;
      
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      const L = (await import('leaflet')).default;

      // Fix Leaflet default icons issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Initialize map
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [20, 0],
          zoom: 2,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
      }

      return L;
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !events.length) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer.options && layer.options.isCustomMarker) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add markers for events
      events.forEach(event => {
        if (event.location && event.location.lat && event.location.lon) {
          const color = getSeverityColor(event.severity);
          const icon = getEventIcon(event.eventType);
          const radius = getSeverityRadius(event.severity);

          // Create custom HTML marker
          const customIcon = L.divIcon({
            html: `
              <div style="
                background-color: ${color};
                width: ${radius * 2}px;
                height: ${radius * 2}px;
                border-radius: 50%;
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${radius}px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                cursor: pointer;
              ">
                ${icon}
              </div>
            `,
            className: 'custom-disaster-marker',
            iconSize: [radius * 2, radius * 2],
            iconAnchor: [radius, radius],
          });

          const marker = L.marker([event.location.lat, event.location.lon], {
            icon: customIcon,
            isCustomMarker: true,
          }).addTo(mapInstanceRef.current);

          // Add popup
          marker.bindPopup(`
            <div style="max-width: 280px; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937; font-size: 14px;">
                ${event.title}
              </h3>
              <div style="margin-bottom: 8px;">
                <span style="
                  display: inline-block;
                  padding: 2px 8px;
                  font-size: 10px;
                  border-radius: 12px;
                  background-color: ${color};
                  color: white;
                  font-weight: 500;
                  text-transform: uppercase;
                ">
                  ${event.severity}
                </span>
                <span style="
                  margin-left: 8px;
                  font-size: 10px;
                  color: #6b7280;
                  text-transform: capitalize;
                ">
                  ${event.eventType}
                </span>
              </div>
              <p style="margin: 8px 0; color: #4b5563; font-size: 12px; line-height: 1.4;">
                ${event.description && event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description || ''}
              </p>
              <div style="font-size: 11px; color: #6b7280;">
                <div style="margin-bottom: 2px;">
                  📍 ${event.location.country}${event.location.region ? `, ${event.location.region}` : ''}
                </div>
                <div style="margin-bottom: 2px;">
                  🕐 ${new Date(event.date).toLocaleString()}
                </div>
                <div>
                  📊 ${event.source}
                </div>
              </div>
            </div>
          `);

          // Add click handler
          marker.on('click', () => {
            if (onEventClick) {
              onEventClick(event);
            }
          });
        }
      });

      // Auto-fit bounds if there are events
      if (events.length > 0) {
        const validEvents = events.filter(e => e.location?.lat && e.location?.lon);
        if (validEvents.length > 0) {
          const bounds = L.latLngBounds(
            validEvents.map(event => [event.location.lat, event.location.lon])
          );
          mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    };

    updateMarkers();
  }, [events, onEventClick]);

  return (
    <Card className={`mb-8 ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Global Disaster Map</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Critical</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-muted-foreground">High</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Low</span>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className="w-full rounded-b-lg"
          style={{ height }}
        ></div>
      </CardContent>
    </Card>
  );
}
