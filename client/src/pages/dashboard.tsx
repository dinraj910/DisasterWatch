import { Navigation } from "@/components/navigation";
import { LiveAlertTicker } from "@/components/live-alert-ticker";
import { DashboardStats } from "@/components/dashboard-stats";
import { DisasterMap } from "@/components/disaster-map";
import { LiveEventsFeed } from "@/components/live-events-feed";
import { EventTypeFilter } from "@/components/event-type-filter";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <LiveAlertTicker />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardStats />
        <DisasterMap />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LiveEventsFeed />
          </div>
          <div>
            <EventTypeFilter />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-background border-t border-border mt-16">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center">
                <i className="fas fa-globe-americas text-2xl text-primary mr-3"></i>
                <h2 className="text-xl font-bold text-foreground">DisasterWatch</h2>
              </div>
              <p className="mt-4 text-muted-foreground text-sm">
                Real-time global natural disaster monitoring and alerting system. Stay informed, stay safe.
              </p>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <i className="fab fa-twitter text-lg"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <i className="fab fa-facebook text-lg"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <i className="fab fa-github text-lg"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">API Documentation</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Data Sources</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Emergency Guidelines</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Cookie Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 DisasterWatch. All rights reserved. Data sources: USGS, GDACS, NWS, OpenFEMA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
