import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, MapPin, Clock, Star, Shield, Zap } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: <Plane className="h-8 w-8 text-blue-600" />,
      title: "Real-Time Tracking",
      description:
        "Get live updates on flight status, delays, gate changes, and aircraft positions with data from AviationStack API.",
    },
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: "Interactive Maps",
      description:
        "Visualize flight paths, current aircraft locations, and airport information on detailed interactive maps.",
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-600" />,
      title: "Comprehensive Details",
      description:
        "Access detailed flight information including aircraft type, registration, altitude, speed, and timeline.",
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-600" />,
      title: "Save Favorites",
      description:
        "Bookmark flights for quick access and monitoring. Your saved flights persist across browser sessions.",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Reliable Data",
      description:
        "Powered by AviationStack API, providing accurate and up-to-date flight information from global sources.",
    },
    {
      icon: <Zap className="h-8 w-8 text-orange-600" />,
      title: "Fast & Responsive",
      description:
        "Optimized for speed with a responsive design that works seamlessly on desktop, tablet, and mobile devices.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Plane className="h-16 w-16 text-blue-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">About FlightTrace</h1>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed">
              FlightTrace is a modern web application designed to provide users with comprehensive real-time flight
              tracking and detailed flight information. Our platform makes it easy to monitor flights, visualize flight
              paths, and stay updated with the latest aviation data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Search for Flights</h3>
                    <p className="text-gray-600">
                      Enter a flight number, airline name, or route (like "JFK to LAX") in our search bar. Our system
                      will find matching flights using real-time data.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">View Results</h3>
                    <p className="text-gray-600">
                      Browse through search results displayed in clean, informative cards showing flight status,
                      departure/arrival times, and gate information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Explore Details</h3>
                    <p className="text-gray-600">
                      Click on any flight to access comprehensive details including interactive maps, live tracking
                      data, aircraft information, and flight timeline.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Save & Monitor</h3>
                    <p className="text-gray-600">
                      Bookmark important flights to your saved list for quick access and ongoing monitoring. Your
                      preferences are stored locally for convenience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Data Source</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  FlightTrace is powered by the <strong>AviationStack API</strong>, a comprehensive aviation data
                  service that provides real-time flight tracking, airport information, and historical flight data. This
                  ensures that you receive accurate, up-to-date information about flights worldwide, including live
                  positions, status updates, and detailed flight schedules.
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    🌍 Global Coverage • ⚡ Real-Time Updates • 📊 Comprehensive Data • 🔒 Reliable Service
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Privacy & Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Your privacy is important to us. FlightTrace stores your saved flights locally in your browser using
                  localStorage technology. This means your bookmarked flights remain private and are only accessible on
                  your device. We don't collect or store personal information on our servers, ensuring your flight
                  tracking preferences stay completely private.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
