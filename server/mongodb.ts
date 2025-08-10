import mongoose, { Schema, Document } from 'mongoose';
import { type DisasterEvent, type InsertDisasterEvent, type User, type InsertUser } from '@shared/schema';
import { randomUUID } from 'crypto';
import { IStorage } from './storage';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_tracker';

export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Mongoose Schemas
interface IDisasterEvent extends Document {
  id: string;
  eventType: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lon: number;
    country: string;
    region?: string;
    address?: string;
  };
  severity: 'critical' | 'high' | 'medium' | 'low';
  magnitude?: number;
  date: Date;
  source: string;
  sourceId?: string;
  imageUrl?: string;
  isActive?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IUser extends Document {
  id: string;
  username: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisasterEventSchema = new Schema<IDisasterEvent>({
  id: { type: String, required: true, unique: true, default: () => randomUUID() },
  eventType: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    country: { type: String, required: true, index: true },
    region: String,
    address: String,
  },
  severity: { 
    type: String, 
    required: true, 
    enum: ['critical', 'high', 'medium', 'low'],
    index: true 
  },
  magnitude: Number,
  date: { type: Date, required: true, index: true },
  source: { type: String, required: true },
  sourceId: String,
  imageUrl: String,
  isActive: { type: Number, default: 1, index: true },
}, {
  timestamps: true,
});

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true, default: () => randomUUID() },
  username: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
}, {
  timestamps: true,
});

const DisasterEventModel = mongoose.model<IDisasterEvent>('DisasterEvent', DisasterEventSchema);
const UserModel = mongoose.model<IUser>('User', UserSchema);

export class MongoStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ id });
    if (!user) return undefined;
    
    return {
      id: user.id,
      username: user.username,
      hashedPassword: user.hashedPassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    if (!user) return undefined;
    
    return {
      id: user.id,
      username: user.username,
      hashedPassword: user.hashedPassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = new UserModel({
      id: randomUUID(),
      ...user,
    });
    
    const savedUser = await newUser.save();
    
    return {
      id: savedUser.id,
      username: savedUser.username,
      hashedPassword: savedUser.hashedPassword,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }

  async getActiveEvents(): Promise<DisasterEvent[]> {
    const events = await DisasterEventModel.find({ isActive: 1 })
      .sort({ date: -1 })
      .lean();
    
    return events.map(this.mapMongoEvent);
  }

  async getPastEvents(limit = 50, offset = 0): Promise<DisasterEvent[]> {
    // Get events that are either marked as inactive OR older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const events = await DisasterEventModel.find({
      $or: [
        { isActive: 0 },
        { 
          date: { $lt: sevenDaysAgo },
          isActive: { $ne: 1 } // Not explicitly active
        }
      ]
    })
      .sort({ date: -1 })
      .limit(limit)
      .skip(offset)
      .lean();
    
    return events.map(this.mapMongoEvent);
  }

  async getEventsByType(eventType: string): Promise<DisasterEvent[]> {
    const events = await DisasterEventModel.find({ eventType })
      .sort({ date: -1 })
      .lean();
    
    return events.map(this.mapMongoEvent);
  }

  async getEventsByLocation(country: string): Promise<DisasterEvent[]> {
    const events = await DisasterEventModel.find({ 'location.country': country })
      .sort({ date: -1 })
      .lean();
    
    return events.map(this.mapMongoEvent);
  }

  async getEventsBySeverity(severity: string): Promise<DisasterEvent[]> {
    const events = await DisasterEventModel.find({ severity })
      .sort({ date: -1 })
      .lean();
    
    return events.map(this.mapMongoEvent);
  }

  async createEvent(event: InsertDisasterEvent): Promise<DisasterEvent> {
    // Check if event with same sourceId already exists
    if (event.sourceId) {
      const existing = await DisasterEventModel.findOne({ 
        sourceId: event.sourceId,
        source: event.source 
      });
      if (existing) {
        return this.mapMongoEvent(existing);
      }
    }

    const newEvent = new DisasterEventModel({
      id: randomUUID(),
      ...event,
    });
    
    const savedEvent = await newEvent.save();
    return this.mapMongoEvent(savedEvent);
  }

  async updateEvent(id: string, event: Partial<DisasterEvent>): Promise<DisasterEvent | undefined> {
    const updatedEvent = await DisasterEventModel.findOneAndUpdate(
      { id },
      { $set: event },
      { new: true }
    ).lean();
    
    if (!updatedEvent) return undefined;
    return this.mapMongoEvent(updatedEvent);
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await DisasterEventModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async searchEvents(query: string): Promise<DisasterEvent[]> {
    const events = await DisasterEventModel.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'location.country': { $regex: query, $options: 'i' } },
        { eventType: { $regex: query, $options: 'i' } },
      ]
    })
    .sort({ date: -1 })
    .lean();
    
    return events.map(this.mapMongoEvent);
  }

  async getEventStats(): Promise<{
    activeEvents: number;
    countriesAffected: number;
    severityCounts: Record<string, number>;
    typeCounts: Record<string, number>;
  }> {
    const activeEvents = await DisasterEventModel.countDocuments({ isActive: 1 });
    
    const countries = await DisasterEventModel.distinct('location.country', { isActive: 1 });
    const countriesAffected = countries.length;
    
    const severityAggregation = await DisasterEventModel.aggregate([
      { $match: { isActive: 1 } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    const typeAggregation = await DisasterEventModel.aggregate([
      { $match: { isActive: 1 } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);
    
    const severityCounts: Record<string, number> = {};
    severityAggregation.forEach(item => {
      severityCounts[item._id] = item.count;
    });
    
    const typeCounts: Record<string, number> = {};
    typeAggregation.forEach(item => {
      typeCounts[item._id] = item.count;
    });
    
    return {
      activeEvents,
      countriesAffected,
      severityCounts,
      typeCounts,
    };
  }

  private mapMongoEvent(event: any): DisasterEvent {
    return {
      id: event.id,
      eventType: event.eventType,
      title: event.title,
      description: event.description,
      location: event.location,
      severity: event.severity,
      magnitude: event.magnitude,
      date: event.date,
      source: event.source,
      sourceId: event.sourceId,
      imageUrl: event.imageUrl,
      isActive: event.isActive,
      createdAt: event.createdAt || new Date(),
      updatedAt: event.updatedAt || new Date(),
    };
  }

  // Cleanup old events (move to past events after 7 days)
  async cleanupOldEvents(): Promise<void> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await DisasterEventModel.updateMany(
      { 
        date: { $lt: sevenDaysAgo },
        isActive: 1 
      },
      { $set: { isActive: 0 } }
    );
  }
}
