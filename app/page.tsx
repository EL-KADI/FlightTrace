"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Plane, MapPin, Clock, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const handlePopularRouteClick = (route: string) => {
    setSearchQuery(route)
    router.push(`/search?q=${encodeURIComponent(route)}`)
  }

  const popularRoutes = [
    { from: "New York", to: "London", code: "JFK-LHR", searchQuery: "JFK to LHR" },
    { from: "Los Angeles", to: "Tokyo", code: "LAX-NRT", searchQuery: "LAX to NRT" },
    { from: "Dubai", to: "Sydney", code: "DXB-SYD", searchQuery: "DXB to SYD" },
    { from: "Paris", to: "New York", code: "CDG-JFK", searchQuery: "CDG to JFK" },
  ]

  const featuredAirports = [
    { name: "John F Kennedy International", code: "JFK", city: "New York" },
    { name: "Los Angeles International", code: "LAX", city: "Los Angeles" },
    { name: "London Heathrow", code: "LHR", city: "London" },
    { name: "Dubai International", code: "DXB", city: "Dubai" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Plane className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">FlightTrace</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">Track flights in real-time with comprehensive flight information</p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Enter flight number, airline, or route (e.g., AA123, JFK to LAX)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Popular Routes
              </CardTitle>
              <CardDescription>Quick access to frequently searched flight routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularRoutes.map((route, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handlePopularRouteClick(route.searchQuery)}
                  >
                    <span>
                      {route.from} → {route.to}
                    </span>
                    <span className="text-sm text-gray-500">{route.code}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Explore Airports
              </CardTitle>
              <CardDescription>Browse flights from major airports worldwide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {featuredAirports.map((airport, index) => (
                  <Link key={index} href={`/explore?airport=${airport.code}`}>
                    <Button variant="outline" className="w-full justify-between">
                      <span>
                        {airport.code} - {airport.city}
                      </span>
                      <span className="text-sm text-gray-500">Explore</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-8">
          <Link href="/explore">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plane className="mr-2 h-5 w-5" />
              Explore All Flights
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose FlightTrace?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <Plane className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">Get live updates on flight status, delays, and gate changes</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Interactive Maps</h3>
              <p className="text-gray-600">Visualize flight paths and current aircraft positions</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Save Favorites</h3>
              <p className="text-gray-600">Bookmark flights for quick access and monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
