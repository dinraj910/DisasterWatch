import { useQuery } from "@tanstack/react-query";
import type { DisasterEvent } from "@shared/schema";

export function LiveAlertTicker() {
  const { data: events = [] } = useQuery<DisasterEvent[]>({
    queryKey: ["/api/events/live"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const criticalEvents = events.filter(event => event.severity === "critical").slice(0, 5);

  if (criticalEvents.length === 0) {
    return null;
  }

  const alertText = criticalEvents
    .map(event => `${getEventIcon(event.eventType)} ${event.title}`)
    .join(" • ");

  return (
    <div className="bg-emergency-critical text-white py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-triangle animate-pulse mr-2"></i>
            <span className="font-semibold text-sm">LIVE ALERTS:</span>
          </div>
          <div className="ml-4 flex-1 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap text-sm">
              {alertText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getEventIcon(eventType: string): string {
  const icons: Record<string, string> = {
    tornado: "🌪️",
    earthquake: "🏠",
    flood: "🌊",
    wildfire: "🔥",
    volcano: "🌋",
    hurricane: "🌀",
    tsunami: "🌊",
    storm: "⛈️",
  };
  return icons[eventType.toLowerCase()] || "⚠️";
}
