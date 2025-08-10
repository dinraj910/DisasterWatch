import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDisasterEventSchema, type DisasterEvent } from "@shared/schema";
import { z } from "zod";

// API interfaces for external disaster services
interface USGSEarthquake {
  properties: {
    mag: number;
    place: string;
    time: number;
    title: string;
    url: string;
    detail: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
  id: string;
}

interface GDACSAlert {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
  category: string;
  location?: {
    lat: number;
    lon: number;
    country: string;
  };
}

// Helper functions for API data transformation
function transformUSGSData(earthquakes: USGSEarthquake[]): Partial<DisasterEvent>[] {
  return earthquakes.map(eq => ({
    eventType: 'earthquake',
    title: eq.properties.title || eq.properties.place,
    description: `Magnitude ${eq.properties.mag} earthquake`,
    location: {
      lat: eq.geometry.coordinates[1],
      lon: eq.geometry.coordinates[0],
      country: extractCountryFromPlace(eq.properties.place),
    },
    severity: getMagnitudeSeverity(eq.properties.mag),
    magnitude: eq.properties.mag,
    date: new Date(eq.properties.time),
    source: 'USGS',
    sourceId: eq.id,
    isActive: 1,
  }));
}

function extractCountryFromPlace(place: string): string {
  // Simple country extraction from USGS place string
  const countryIndicators: Record<string, string> = {
    'California': 'United States',
    'Alaska': 'United States',
    'Japan': 'Japan',
    'Chile': 'Chile',
    'Turkey': 'Turkey',
    'Indonesia': 'Indonesia',
    'Italy': 'Italy',
    'Greece': 'Greece',
    'Mexico': 'Mexico',
    'Peru': 'Peru',
  };
  
  for (const [indicator, country] of Object.entries(countryIndicators)) {
    if (place.includes(indicator)) return country;
  }
  
  return 'Unknown';
}

function getMagnitudeSeverity(magnitude: number): 'critical' | 'high' | 'medium' | 'low' {
  if (magnitude >= 7.0) return 'critical';
  if (magnitude >= 6.0) return 'high';
  if (magnitude >= 4.5) return 'medium';
  return 'low';
}

async function fetchUSGSEarthquakes(): Promise<DisasterEvent[]> {
  try {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson');
    const data = await response.json();
    
    const transformedData = transformUSGSData(data.features);
    const events: DisasterEvent[] = [];
    
    for (const eventData of transformedData) {
      if (eventData.title && eventData.location && eventData.date) {
        const event = await storage.createEvent({
          eventType: eventData.eventType!,
          title: eventData.title,
          description: eventData.description || '',
          location: eventData.location,
          severity: eventData.severity!,
          magnitude: eventData.magnitude,
          date: eventData.date,
          source: eventData.source!,
          sourceId: eventData.sourceId,
          isActive: eventData.isActive,
        });
        events.push(event);
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching USGS data:', error);
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get live events
  app.get("/api/events/live", async (req, res) => {
    try {
      const events = await storage.getActiveEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch live events" });
    }
  });

  // Get past events with pagination
  app.get("/api/events/past", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const events = await storage.getPastEvents(limit, offset);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch past events" });
    }
  });

  // Search events
  app.get("/api/events/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const events = await storage.searchEvents(query);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to search events" });
    }
  });

  // Filter events by type
  app.get("/api/events/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const events = await storage.getEventsByType(type);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter events by type" });
    }
  });

  // Filter events by location
  app.get("/api/events/location/:country", async (req, res) => {
    try {
      const { country } = req.params;
      const events = await storage.getEventsByLocation(country);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter events by location" });
    }
  });

  // Filter events by severity
  app.get("/api/events/severity/:severity", async (req, res) => {
    try {
      const { severity } = req.params;
      const events = await storage.getEventsBySeverity(severity);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter events by severity" });
    }
  });

  // Get dashboard statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getEventStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Force refresh data from external APIs
  app.post("/api/refresh", async (req, res) => {
    try {
      const earthquakes = await fetchUSGSEarthquakes();
      res.json({ 
        message: "Data refreshed successfully", 
        newEvents: earthquakes.length 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh data" });
    }
  });

  // Create new event (for testing/manual entry)
  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertDisasterEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid event data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create event" });
      }
    }
  });

  const httpServer = createServer(app);

  // Periodically fetch fresh data from APIs
  setInterval(async () => {
    try {
      await fetchUSGSEarthquakes();
      console.log('Data refreshed from external APIs');
    } catch (error) {
      console.error('Error during periodic data refresh:', error);
    }
  }, 5 * 60 * 1000); // Refresh every 5 minutes

  // Initial data load
  fetchUSGSEarthquakes().then(() => {
    console.log('Initial data loaded from external APIs');
  });

  return httpServer;
}
