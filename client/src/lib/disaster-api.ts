import { apiRequest } from "./queryClient";
import type { DisasterEvent } from "@shared/schema";

export interface DisasterApiFilters {
  eventType?: string;
  severity?: string;
  location?: string;
  searchQuery?: string;
  dateRange?: 'week' | 'month' | 'year';
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface DashboardStats {
  activeEvents: number;
  countriesAffected: number;
  severityCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

export class DisasterApi {
  private static instance: DisasterApi;
  private baseUrl = '/api';

  static getInstance(): DisasterApi {
    if (!DisasterApi.instance) {
      DisasterApi.instance = new DisasterApi();
    }
    return DisasterApi.instance;
  }

  async getLiveEvents(): Promise<DisasterEvent[]> {
    const response = await apiRequest('GET', `${this.baseUrl}/events/live`);
    return response.json();
  }

  async getPastEvents(options: PaginationOptions = {}): Promise<DisasterEvent[]> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    
    const response = await apiRequest('GET', `${this.baseUrl}/events/past?${params}`);
    return response.json();
  }

  async searchEvents(query: string): Promise<DisasterEvent[]> {
    const response = await apiRequest('GET', `${this.baseUrl}/events/search?q=${encodeURIComponent(query)}`);
    return response.json();
  }

  async getEventsByType(eventType: string): Promise<DisasterEvent[]> {
    const response = await apiRequest('GET', `${this.baseUrl}/events/type/${encodeURIComponent(eventType)}`);
    return response.json();
  }

  async getEventsByLocation(country: string): Promise<DisasterEvent[]> {
    const response = await apiRequest('GET', `${this.baseUrl}/events/location/${encodeURIComponent(country)}`);
    return response.json();
  }

  async getEventsBySeverity(severity: string): Promise<DisasterEvent[]> {
    const response = await apiRequest('GET', `${this.baseUrl}/events/severity/${encodeURIComponent(severity)}`);
    return response.json();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiRequest('GET', `${this.baseUrl}/stats`);
    return response.json();
  }

  async refreshData(): Promise<{ message: string; newEvents: number }> {
    const response = await apiRequest('POST', `${this.baseUrl}/refresh`);
    return response.json();
  }

  async createEvent(event: Omit<DisasterEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<DisasterEvent> {
    const response = await apiRequest('POST', `${this.baseUrl}/events`, event);
    return response.json();
  }

  // Utility methods for data transformation and filtering
  filterEventsByCriteria(events: DisasterEvent[], filters: DisasterApiFilters): DisasterEvent[] {
    return events.filter(event => {
      if (filters.eventType && event.eventType !== filters.eventType) {
        return false;
      }
      if (filters.severity && event.severity !== filters.severity) {
        return false;
      }
      if (filters.location && !event.location.country.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!event.title.toLowerCase().includes(query) &&
            !event.description?.toLowerCase().includes(query) &&
            !event.location.country.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filters.dateRange) {
        const eventDate = new Date(event.date);
        const now = new Date();
        const timeDiff = now.getTime() - eventDate.getTime();
        
        switch (filters.dateRange) {
          case 'week':
            if (timeDiff > 7 * 24 * 60 * 60 * 1000) return false;
            break;
          case 'month':
            if (timeDiff > 30 * 24 * 60 * 60 * 1000) return false;
            break;
          case 'year':
            if (timeDiff > 365 * 24 * 60 * 60 * 1000) return false;
            break;
        }
      }
      return true;
    });
  }

  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      critical: '#dc2626',
      high: '#f59e0b',
      medium: '#f97316',
      low: '#10b981',
    };
    return colors[severity] || '#6b7280';
  }

  getEventTypeIcon(eventType: string): string {
    const icons: Record<string, string> = {
      earthquake: 'fas fa-home',
      tornado: 'fas fa-tornado',
      flood: 'fas fa-water',
      wildfire: 'fas fa-fire',
      volcano: 'fas fa-mountain',
      hurricane: 'fas fa-hurricane',
      tsunami: 'fas fa-water',
      storm: 'fas fa-bolt',
    };
    return icons[eventType.toLowerCase()] || 'fas fa-exclamation-triangle';
  }

  formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const eventDate = new Date(date);
    const diffMs = now.getTime() - eventDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  // Real-time connection utilities
  private eventSource: EventSource | null = null;

  initializeRealTimeUpdates(onUpdate: (event: DisasterEvent) => void): void {
    // Note: This would require SSE implementation on the backend
    // For now, we rely on polling via React Query's refetchInterval
    console.log('Real-time updates would be initialized here');
  }

  disconnectRealTime(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Geolocation utilities
  async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free service)
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      return data.address?.country || data.display_name || 'Unknown Location';
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return 'Unknown Location';
    }
  }

  async getNearbyEvents(lat: number, lon: number, radiusKm: number = 500): Promise<DisasterEvent[]> {
    const allEvents = await this.getLiveEvents();
    
    return allEvents.filter(event => {
      if (!event.location.lat || !event.location.lon) return false;
      
      const distance = this.calculateDistance(
        lat, lon,
        event.location.lat, event.location.lon
      );
      
      return distance <= radiusKm;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
}

// Export singleton instance
export const disasterApi = DisasterApi.getInstance();

// Export commonly used utility functions
export const {
  getSeverityColor,
  getEventTypeIcon,
  formatRelativeTime,
  filterEventsByCriteria
} = disasterApi;
