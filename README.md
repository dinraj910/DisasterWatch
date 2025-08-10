# DisasterWatch 🌍

A real-time natural disaster monitoring and alerting system that aggregates data from multiple trusted sources to keep communities informed and prepared.

![DisasterWatch Logo](client/public/logo.png)

## 🚀 Features

- **Real-time Monitoring**: Live updates from multiple disaster monitoring APIs including USGS, GDACS, and National Weather Service
- **Global Coverage**: Track natural disasters worldwide with comprehensive location mapping
- **Historical Data**: Access archived disaster events with advanced search and filtering capabilities
- **Interactive Maps**: Leaflet-based maps with custom disaster markers and severity indicators
- **Severity Classification**: Events categorized by severity levels from low to critical with visual indicators
- **Socket.IO Integration**: Real-time updates without page refresh
- **Responsive Design**: Modern UI that works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for better user experience

## 🛠 Tech Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe development
- **MongoDB** - Database for storing disaster events
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional event-based communication
- **Cross-env** - Cross-platform environment variable management

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern UI component library
- **React Query (@tanstack/react-query)** - Data fetching and caching
- **Leaflet** - Interactive maps
- **Wouter** - Minimalist routing

### Data Sources
- **USGS (United States Geological Survey)** - Earthquake data and geological hazards
- **GDACS (Global Disaster Alert and Coordination System)** - Global disaster monitoring
- **National Weather Service** - US weather alerts and meteorological data

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas connection)
- **Git** for version control

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dinraj910/DisasterWatch.git
cd DisasterWatch
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/disasterwatch
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/disasterwatch

# Server Configuration
PORT=5000
NODE_ENV=development

# API Keys (if required by external services)
# USGS_API_KEY=your_usgs_api_key
# GDACS_API_KEY=your_gdacs_api_key
# NWS_API_KEY=your_nws_api_key
```

### 4. Database Setup

Make sure MongoDB is running on your system. The application will automatically create the necessary collections and indexes.

#### For local MongoDB:
```bash
# Start MongoDB service (varies by OS)
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

#### For MongoDB Atlas:
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update the `MONGODB_URI` in your `.env` file

### 5. Add Your Logo (Optional)

Place your official DisasterWatch logo as `logo.png` in the `client/public/` directory to replace the temporary gradient backgrounds.

## 🚀 Running the Application

### Development Mode

1. **Start the backend server:**
```bash
npm run dev
```
The backend server will start on `http://localhost:5000`

2. **Start the frontend development server (in a new terminal):**
```bash
npx vite --port 3000
```
The frontend will be available at `http://localhost:3000`

### Production Mode

1. **Build the application:**
```bash
npm run build
```

2. **Start the production server:**
```bash
npm start
```

## 📁 Project Structure

```
disasterwatch/
├── client/                     # Frontend React application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── dashboard-stats.tsx
│   │   │   ├── disaster-map.tsx
│   │   │   ├── live-alert-ticker.tsx
│   │   │   ├── live-events-feed.tsx
│   │   │   ├── navigation.tsx
│   │   │   └── ...
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries
│   │   ├── pages/            # Page components
│   │   └── ...
│   ├── index.html
│   └── vite.config.ts
├── server/                     # Backend Node.js application
│   ├── index.ts              # Main server file
│   ├── routes.ts             # API routes
│   ├── mongodb.ts            # MongoDB connection and models
│   └── storage.ts            # Data storage utilities
├── shared/                     # Shared TypeScript types
│   └── schema.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔌 API Endpoints

### Events
- `GET /api/events/live` - Get live disaster events
- `GET /api/events/past` - Get historical disaster events
- `GET /api/stats` - Get dashboard statistics

### Real-time Updates
- Socket.IO connection on the same port as the server
- Events: `newEvent`, `eventUpdate`, `statsUpdate`

## 🌐 Data Sources & APIs

The application fetches data from multiple sources:

1. **USGS Earthquake API**
   - Real-time earthquake data
   - Global coverage
   - Updates every 5 minutes

2. **GDACS API**
   - Global disaster alerts
   - Multiple disaster types
   - Severity classifications

3. **National Weather Service API**
   - US weather alerts
   - Storm warnings
   - Meteorological data

## 🎨 Customization

### Adding New Event Types
1. Update the `DisasterEvent` schema in `shared/schema.ts`
2. Add new event type handling in `server/routes.ts`
3. Update UI components to display new event types

### Styling
- Modify `tailwind.config.ts` for theme customization
- Update component styles in individual `.tsx` files
- Add custom CSS in `client/src/index.css`

### Adding New Data Sources
1. Create new API fetching functions in `server/routes.ts`
2. Update data mapping in `server/mongodb.ts`
3. Test thoroughly with the new data source

## 🧪 Testing

```bash
# Type checking
npm run check

# Build test
npm run build
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your `MONGODB_URI` in `.env`
   - Verify network connectivity for MongoDB Atlas

2. **Port Already in Use**
   - Change the port in your `.env` file
   - Kill existing processes using the port

3. **API Data Not Loading**
   - Check internet connectivity
   - Verify API endpoints are accessible
   - Check browser console for errors

4. **Build Errors**
   - Run `npm run check` to check for TypeScript errors
   - Ensure all dependencies are installed

### Development Tips

- Use browser DevTools to monitor Socket.IO connections
- Check the MongoDB database for stored events
- Monitor the server console for API fetch logs
- Use React DevTools for component debugging

## 🚦 Performance

- **Data Caching**: React Query handles API response caching
- **Real-time Updates**: Socket.IO provides efficient real-time communication
- **Database Optimization**: MongoDB indexes for fast querying
- **Auto Cleanup**: Old events are automatically cleaned up after 30 days

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@disasterwatch.com
- Documentation: [Project Wiki](https://github.com/yourusername/disasterwatch/wiki)

## 🙏 Acknowledgments

- **USGS** for providing earthquake data
- **GDACS** for global disaster monitoring
- **National Weather Service** for weather alerts
- **OpenStreetMap** contributors for map data
- **shadcn/ui** for the excellent UI components

---

**⚠️ Disclaimer**: DisasterWatch aggregates information from third-party sources and is provided for informational purposes only. Always follow official local emergency services and authorities for emergency response decisions.

---

Made with ❤️ for global community safety
