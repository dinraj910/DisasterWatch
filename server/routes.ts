import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { getStorage } from "./storage";
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
  'gdacs:cap'?: {
    'gdacs:alertlevel': string;
    'gdacs:country': string;
    'gdacs:bbox': string;
  };
}

interface WeatherAlert {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    '@id': string;
    headline: string;
    description: string;
    severity: string;
    certainty: string;
    urgency: string;
    event: string;
    areaDesc: string;
    geocode: {
      SAME: string[];
      UGC: string[];
    };
    affectedZones: string[];
    onset?: string;
    expires?: string;
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

function getGDACSSeverity(alertLevel: string): 'critical' | 'high' | 'medium' | 'low' {
  const level = alertLevel?.toLowerCase();
  if (level === 'red') return 'critical';
  if (level === 'orange') return 'high';
  if (level === 'yellow') return 'medium';
  return 'low';
}

function getWeatherSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
  const sev = severity?.toLowerCase();
  if (sev === 'extreme') return 'critical';
  if (sev === 'severe') return 'high';
  if (sev === 'moderate') return 'medium';
  return 'low';
}

// Parse XML/RSS feeds from GDACS
async function parseGDACSFeed(xmlText: string): Promise<GDACSAlert[]> {
  // Simple XML parsing for RSS feed
  const items: GDACSAlert[] = [];
  
  // Extract items from RSS feed
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
  
  for (const itemMatch of itemMatches) {
    const title = itemMatch.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemMatch.match(/<title>(.*?)<\/title>/);
    const description = itemMatch.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || itemMatch.match(/<description>(.*?)<\/description>/);
    const link = itemMatch.match(/<link>(.*?)<\/link>/);
    const pubDate = itemMatch.match(/<pubDate>(.*?)<\/pubDate>/);
    const guid = itemMatch.match(/<guid[^>]*>(.*?)<\/guid>/);
    const category = itemMatch.match(/<category>(.*?)<\/category>/);
    const alertlevel = itemMatch.match(/<gdacs:alertlevel>(.*?)<\/gdacs:alertlevel>/);
    const country = itemMatch.match(/<gdacs:country>(.*?)<\/gdacs:country>/);
    
    if (title && description) {
      items.push({
        title: title[1]?.trim() || '',
        description: description[1]?.trim() || '',
        link: link?.[1]?.trim() || '',
        pubDate: pubDate?.[1]?.trim() || '',
        guid: guid?.[1]?.trim() || '',
        category: category?.[1]?.trim() || '',
        'gdacs:cap': {
          'gdacs:alertlevel': alertlevel?.[1]?.trim() || 'green',
          'gdacs:country': country?.[1]?.trim() || '',
          'gdacs:bbox': '',
        }
      });
    }
  }
  
  return items;
}

async function fetchUSGSEarthquakes(broadcastCallback?: (event: DisasterEvent) => void): Promise<DisasterEvent[]> {
  try {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson');
    const data = await response.json();
    
    const transformedData = transformUSGSData(data.features);
    const events: DisasterEvent[] = [];
    
    for (const eventData of transformedData) {
      if (eventData.title && eventData.location && eventData.date) {
        const event = await getStorage().createEvent({
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
        
        // Broadcast new event if callback provided
        if (broadcastCallback) {
          broadcastCallback(event);
        }
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching USGS data:', error);
    return [];
  }
}

async function fetchGDACSAlerts(broadcastCallback?: (event: DisasterEvent) => void): Promise<DisasterEvent[]> {
  try {
    const response = await fetch('https://www.gdacs.org/xml/rss.xml');
    const xmlText = await response.text();
    const alerts = await parseGDACSFeed(xmlText);
    
    const events: DisasterEvent[] = [];
    
    for (const alert of alerts) {
      const eventType = alert.category?.toLowerCase() || 'disaster';
      const country = alert['gdacs:cap']?.['gdacs:country'] || extractCountryFromPlace(alert.title);
      const alertLevel = alert['gdacs:cap']?.['gdacs:alertlevel'] || 'green';
      
      const event = await getStorage().createEvent({
        eventType: eventType.includes('earthquake') ? 'earthquake' : 
                  eventType.includes('flood') ? 'flood' :
                  eventType.includes('cyclone') ? 'hurricane' :
                  eventType.includes('volcano') ? 'volcano' : 'disaster',
        title: alert.title,
        description: alert.description,
        location: {
          lat: 0, // GDACS doesn't always provide precise coordinates
          lon: 0,
          country: country,
        },
        severity: getGDACSSeverity(alertLevel),
        date: new Date(alert.pubDate || Date.now()),
        source: 'GDACS',
        sourceId: alert.guid,
        isActive: 1,
      });
      
      events.push(event);
      
      if (broadcastCallback) {
        broadcastCallback(event);
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching GDACS data:', error);
    return [];
  }
}

async function fetchWeatherAlerts(broadcastCallback?: (event: DisasterEvent) => void): Promise<DisasterEvent[]> {
  try {
    // Fetch active weather alerts from National Weather Service
    const response = await fetch('https://api.weather.gov/alerts/active');
    const data = await response.json();
    
    const events: DisasterEvent[] = [];
    
    for (const alert of data.features || []) {
      if (!alert.properties) continue;
      
      const props = alert.properties;
      const eventType = props.event?.toLowerCase().includes('tornado') ? 'tornado' :
                        props.event?.toLowerCase().includes('hurricane') ? 'hurricane' :
                        props.event?.toLowerCase().includes('flood') ? 'flood' :
                        props.event?.toLowerCase().includes('fire') ? 'wildfire' : 'storm';
      
      // Extract coordinates from geometry if available
      let lat = 0, lon = 0;
      if (alert.geometry?.coordinates && alert.geometry.coordinates[0]?.length > 0) {
        const coords = alert.geometry.coordinates[0][0];
        lon = coords[0];
        lat = coords[1];
      }
      
      const event = await getStorage().createEvent({
        eventType,
        title: props.headline || props.event || 'Weather Alert',
        description: props.description || 'Weather alert issued',
        location: {
          lat,
          lon,
          country: 'United States',
          region: props.areaDesc,
        },
        severity: getWeatherSeverity(props.severity || 'minor'),
        date: new Date(props.onset || Date.now()),
        source: 'NWS',
        sourceId: alert.id || props['@id'],
        isActive: 1,
      });
      
      events.push(event);
      
      if (broadcastCallback) {
        broadcastCallback(event);
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching Weather alerts:', error);
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "development" ? "http://localhost:5173" : false,
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Join location-based rooms for filtering
    socket.on('joinLocation', (country: string) => {
      socket.join(`location:${country}`);
      console.log(`Client ${socket.id} joined location room: ${country}`);
    });

    socket.on('leaveLocation', (country: string) => {
      socket.leave(`location:${country}`);
      console.log(`Client ${socket.id} left location room: ${country}`);
    });
  });

  // Helper function to broadcast new events
  const broadcastNewEvent = (event: DisasterEvent) => {
    // Broadcast to all clients
    io.emit('newEvent', event);
    
    // Also broadcast to location-specific rooms
    if (event.location.country) {
      io.to(`location:${event.location.country}`).emit('locationEvent', event);
    }
  };
  
  // Health check endpoint for cron job monitoring
  app.get("/", (req, res) => res.status(200).send("server is running!"));
  
  // Get live events
  app.get("/api/events/live", async (req, res) => {
    try {
      const events = await getStorage().getActiveEvents();
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
      const events = await getStorage().getPastEvents(limit, offset);
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
      const events = await getStorage().searchEvents(query);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to search events" });
    }
  });

  // Filter events by type
  app.get("/api/events/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const events = await getStorage().getEventsByType(type);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter events by type" });
    }
  });

  // Filter events by location
  app.get("/api/events/location/:country", async (req, res) => {
    try {
      const { country } = req.params;
      const events = await getStorage().getEventsByLocation(country);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter events by location" });
    }
  });

  // Filter events by severity
  app.get("/api/events/severity/:severity", async (req, res) => {
    try {
      const { severity } = req.params;
      const events = await getStorage().getEventsBySeverity(severity);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter events by severity" });
    }
  });

  // Get dashboard statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await getStorage().getEventStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Force refresh data from external APIs
  app.post("/api/refresh", async (req, res) => {
    try {
      const [earthquakes, gdacsAlerts, weatherAlerts] = await Promise.all([
        fetchUSGSEarthquakes(broadcastNewEvent),
        fetchGDACSAlerts(broadcastNewEvent),
        fetchWeatherAlerts(broadcastNewEvent)
      ]);
      
      const totalEvents = earthquakes.length + gdacsAlerts.length + weatherAlerts.length;
      
      res.json({ 
        message: "Data refreshed successfully", 
        newEvents: totalEvents,
        sources: {
          USGS: earthquakes.length,
          GDACS: gdacsAlerts.length,
          NWS: weatherAlerts.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh data" });
    }
  });

  // Create new event (for testing/manual entry)
  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertDisasterEventSchema.parse(req.body);
      const event = await getStorage().createEvent(validatedData);
      
      // Broadcast the new event
      broadcastNewEvent(event);
      
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid event data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create event" });
      }
    }
  });

  // Periodically fetch fresh data from APIs
  setInterval(async () => {
    try {
      const [earthquakes, gdacsAlerts, weatherAlerts] = await Promise.all([
        fetchUSGSEarthquakes(broadcastNewEvent),
        fetchGDACSAlerts(broadcastNewEvent),
        fetchWeatherAlerts(broadcastNewEvent)
      ]);
      
      const totalEvents = earthquakes.length + gdacsAlerts.length + weatherAlerts.length;
      console.log(`Data refreshed from external APIs - ${totalEvents} new events`);
    } catch (error) {
      console.error('Error during periodic data refresh:', error);
    }
  }, 5 * 60 * 1000); // Refresh every 5 minutes

  // Initial data load
  Promise.all([
    fetchUSGSEarthquakes(broadcastNewEvent),
    fetchGDACSAlerts(broadcastNewEvent),
    fetchWeatherAlerts(broadcastNewEvent)
  ]).then(([earthquakes, gdacsAlerts, weatherAlerts]) => {
    const totalEvents = earthquakes.length + gdacsAlerts.length + weatherAlerts.length;
    console.log(`Initial data loaded from external APIs - ${totalEvents} events`);
  });

  return httpServer;
}
