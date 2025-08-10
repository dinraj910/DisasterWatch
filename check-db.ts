import mongoose from 'mongoose';

// Connect to the same database
const MONGODB_URI = 'mongodb+srv://dinrajdinesh564:EXqPoQJkZhDMjLy9@cluster0.tkdf4dj.mongodb.net/disaster_tracker?retryWrites=true&w=majority&appName=Cluster0';

async function checkDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('All databases:', dbs.databases.map(db => db.name));
    
    // List all collections in current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in disaster_tracker:', collections.map(c => c.name));
    
    // Check if DisasterEvent collection exists and count documents
    const DisasterEvent = mongoose.model('DisasterEvent', new mongoose.Schema({}, { strict: false }));
    const count = await DisasterEvent.countDocuments();
    console.log('Number of disaster events:', count);
    
    // Get a few sample documents
    const samples = await DisasterEvent.find().limit(3).exec();
    console.log('Sample events:', JSON.stringify(samples, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabase();
