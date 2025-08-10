import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, Database, Zap, Globe, Users, Heart } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Monitoring",
      description: "Live updates from multiple disaster monitoring APIs including USGS, GDACS, and National Weather Service."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Coverage",
      description: "Track natural disasters worldwide with comprehensive location mapping and detailed event information."
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Historical Data",
      description: "Access archived disaster events with advanced search and filtering capabilities."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Severity Classification",
      description: "Events categorized by severity levels from low to critical with visual indicators."
    }
  ];

  const dataSources = [
    {
      name: "USGS (United States Geological Survey)",
      description: "Earthquake data and geological hazard information",
      coverage: "Global earthquake monitoring",
      url: "https://earthquake.usgs.gov/",
      types: ["Earthquakes", "Geological hazards"]
    },
    {
      name: "GDACS (Global Disaster Alert and Coordination System)",
      description: "Comprehensive global disaster monitoring and alerts",
      coverage: "Worldwide natural disasters",
      url: "https://www.gdacs.org/",
      types: ["Hurricanes", "Floods", "Volcanoes", "Earthquakes", "Droughts"]
    },
    {
      name: "National Weather Service",
      description: "US weather alerts and meteorological data",
      coverage: "United States weather monitoring",
      url: "https://www.weather.gov/",
      types: ["Storms", "Tornadoes", "Floods", "Extreme weather"]
    }
  ];

  const stats = [
    { label: "Data Sources", value: "3+", description: "Reliable APIs" },
    { label: "Event Types", value: "10+", description: "Natural disasters" },
    { label: "Countries", value: "200+", description: "Global coverage" },
    { label: "Updates", value: "Real-time", description: "Live monitoring" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-600 via-red-500 to-blue-800 rounded-full flex items-center justify-center">
                <i className="fas fa-globe text-white text-3xl"></i>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              About DisasterWatch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A real-time natural disaster monitoring and alerting system that aggregates data from multiple 
              trusted sources to keep communities informed and prepared.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed text-lg">
              To provide timely, accurate, and accessible information about natural disasters worldwide, 
              empowering individuals, communities, and organizations to make informed decisions and take 
              appropriate action to protect lives and property. We believe that informed communities are 
              safer communities.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Data Sources</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {dataSources.map((source, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{source.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">{source.description}</p>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Coverage:</div>
                    <Badge variant="secondary" className="text-xs">
                      {source.coverage}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Event Types:</div>
                    <div className="flex flex-wrap gap-1">
                      {source.types.map((type, typeIndex) => (
                        <Badge key={typeIndex} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Visit Source
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Database className="w-6 h-6" />
              Technology Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Frontend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">React</Badge>
                    <span className="text-muted-foreground">- Modern UI framework</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">TypeScript</Badge>
                    <span className="text-muted-foreground">- Type-safe development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Tailwind CSS</Badge>
                    <span className="text-muted-foreground">- Responsive design</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Leaflet</Badge>
                    <span className="text-muted-foreground">- Interactive maps</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Backend</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Node.js</Badge>
                    <span className="text-muted-foreground">- Server runtime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Express</Badge>
                    <span className="text-muted-foreground">- Web framework</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">MongoDB</Badge>
                    <span className="text-muted-foreground">- Data storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Socket.IO</Badge>
                    <span className="text-muted-foreground">- Real-time updates</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Data Collection</h3>
                <p className="text-sm text-muted-foreground">
                  Our system automatically fetches data from trusted sources every 5 minutes
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Data Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Events are processed, categorized, and stored in our database with proper metadata
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Real-time Updates</h3>
                <p className="text-sm text-muted-foreground">
                  New events are instantly broadcasted to users through WebSocket connections
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              Support & Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Have questions, suggestions, or need technical support? We'd love to hear from you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" asChild>
                  <a href="mailto:support@disasterwatch.com" className="flex items-center gap-2">
                    <i className="fas fa-envelope"></i>
                    Contact Support
                  </a>
                </Button>
                
                <Button variant="outline" asChild>
                  <a 
                    href="https://github.com/disasterwatch" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <i className="fab fa-github"></i>
                    View on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Important Disclaimer</span>
          </div>
          <p className="max-w-4xl mx-auto">
            DisasterWatch aggregates information from third-party sources and is provided for informational 
            purposes only. While we strive for accuracy, we cannot guarantee the completeness or timeliness 
            of the data. Always follow official local emergency services and authorities for emergency 
            response decisions.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border mt-8">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 DisasterWatch. Built with care for global community safety.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
