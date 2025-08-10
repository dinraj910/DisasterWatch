import { type DisasterEvent, type InsertDisasterEvent, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { MongoStorage, connectMongoDB } from "./mongodb";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Disaster event methods
  getActiveEvents(): Promise<DisasterEvent[]>;
  getPastEvents(limit?: number, offset?: number): Promise<DisasterEvent[]>;
  getEventsByType(eventType: string): Promise<DisasterEvent[]>;
  getEventsByLocation(country: string): Promise<DisasterEvent[]>;
  getEventsBySeverity(severity: string): Promise<DisasterEvent[]>;
  createEvent(event: InsertDisasterEvent): Promise<DisasterEvent>;
  updateEvent(id: string, event: Partial<DisasterEvent>): Promise<DisasterEvent | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  searchEvents(query: string): Promise<DisasterEvent[]>;
  getEventStats(): Promise<{
    activeEvents: number;
    countriesAffected: number;
    severityCounts: Record<string, number>;
    typeCounts: Record<string, number>;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, DisasterEvent>;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Add some demo events for demonstration
    const demoEvents = [
      {
        eventType: 'earthquake',
        title: 'M 5.4 - 23 km S of Hualien City, Taiwan',
        description: 'Moderate earthquake detected off the coast of Taiwan',
        location: { lat: 23.8041, lon: 121.5650, country: 'Taiwan', region: undefined, address: undefined },
        severity: 'medium' as const,
        magnitude: 5.4,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        source: 'USGS',
        sourceId: 'us6000demo1',
        isActive: 1,
      },
      {
        eventType: 'earthquake',
        title: 'M 6.8 - Near the coast of Central Peru',
        description: 'Strong earthquake felt across central Peru region',
        location: { lat: -12.0464, lon: -77.0428, country: 'Peru', region: undefined, address: undefined },
        severity: 'high' as const,
        magnitude: 6.8,
        date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        source: 'USGS',
        sourceId: 'us6000demo2',
        isActive: 1,
      },
      {
        eventType: 'earthquake',
        title: 'M 7.2 - Kuril Islands, Russia',
        description: 'Major earthquake in remote Kuril Islands region',
        location: { lat: 44.4108, lon: 147.7489, country: 'Russia', region: undefined, address: undefined },
        severity: 'critical' as const,
        magnitude: 7.2,
        date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        source: 'USGS',
        sourceId: 'us6000demo3',
        isActive: 1,
      },
      {
        eventType: 'earthquake',
        title: 'M 4.1 - 15 km NE of San Fernando, CA',
        description: 'Light earthquake in Los Angeles metropolitan area',
        location: { lat: 34.3439, lon: -118.4381, country: 'United States', region: undefined, address: undefined },
        severity: 'low' as const,
        magnitude: 4.1,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        source: 'USGS',
        sourceId: 'us6000demo4',
        isActive: 1,
      }
    ];

    for (const eventData of demoEvents) {
      await this.createEvent(eventData);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getActiveEvents(): Promise<DisasterEvent[]> {
    return Array.from(this.events.values())
      .filter(event => event.isActive === 1)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getPastEvents(limit = 50, offset = 0): Promise<DisasterEvent[]> {
    const allEvents = Array.from(this.events.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return allEvents.slice(offset, offset + limit);
  }

  async getEventsByType(eventType: string): Promise<DisasterEvent[]> {
    return Array.from(this.events.values())
      .filter(event => event.eventType.toLowerCase() === eventType.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getEventsByLocation(country: string): Promise<DisasterEvent[]> {
    return Array.from(this.events.values())
      .filter(event => event.location.country.toLowerCase().includes(country.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getEventsBySeverity(severity: string): Promise<DisasterEvent[]> {
    return Array.from(this.events.values())
      .filter(event => event.severity === severity)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createEvent(insertEvent: InsertDisasterEvent): Promise<DisasterEvent> {
    const id = randomUUID();
    const now = new Date();
    const event: DisasterEvent = {
      ...insertEvent,
      id,
      description: insertEvent.description || null,
      location: {
        ...insertEvent.location,
        region: insertEvent.location.region || undefined,
        address: insertEvent.location.address || undefined,
      },
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updates: Partial<DisasterEvent>): Promise<DisasterEvent | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates, updatedAt: new Date() };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  async searchEvents(query: string): Promise<DisasterEvent[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.events.values())
      .filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm) ||
        event.location.country.toLowerCase().includes(searchTerm) ||
        event.eventType.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getEventStats(): Promise<{
    activeEvents: number;
    countriesAffected: number;
    severityCounts: Record<string, number>;
    typeCounts: Record<string, number>;
  }> {
    const events = Array.from(this.events.values());
    const activeEvents = events.filter(e => e.isActive === 1);
    
    const countries = new Set(events.map(e => e.location.country));
    const severityCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    
    activeEvents.forEach(event => {
      severityCounts[event.severity] = (severityCounts[event.severity] || 0) + 1;
      typeCounts[event.eventType] = (typeCounts[event.eventType] || 0) + 1;
    });
    
    return {
      activeEvents: activeEvents.length,
      countriesAffected: countries.size,
      severityCounts,
      typeCounts,
    };
  }
}

// Initialize MongoDB connection and use MongoStorage
let storage: IStorage;

const initializeStorage = async (): Promise<IStorage> => {
  try {
    await connectMongoDB();
    storage = new MongoStorage();
    console.log('✅ Using MongoDB storage');
    return storage;
  } catch (error) {
    console.log('⚠️  Falling back to in-memory storage');
    storage = new MemStorage();
    return storage;
  }
};

// Export a promise that resolves to the storage instance
export const getStorage = (): IStorage => {
  if (!storage) {
    throw new Error('Storage not initialized. Call initializeStorage() first.');
  }
  return storage;
};

export { initializeStorage };
