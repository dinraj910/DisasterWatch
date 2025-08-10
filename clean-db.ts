import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://dinrajdinesh564:EXqPoQJkZhDMjLy9@cluster0.tkdf4dj.mongodb.net/disaster_tracker?retryWrites=true&w=majority&appName=Cluster0';

async function cleanDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Drop the disasterevents collection
    await mongoose.connection.db.collection('disasterevents').drop();
    console.log('🧹 Cleaned disasterevents collection');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected');
  }
}

cleanDatabase();
