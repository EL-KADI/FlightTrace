"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Trash2, ArrowRight, Plane } from "lucide-react"
import Link from "next/link"

interface SavedFlight {
  flightNumber: string
  airline: string
  route: string
  status: string
  savedAt: string
}

export default function SavedFlightsPage() {
  const [savedFlights, setSavedFlights] = useState<string[]>([])
  const [flightDetails, setFlightDetails] = useState<SavedFlight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSavedFlights()
  }, [])

  const loadSavedFlights = () => {
    const saved = JSON.parse(localStorage.getItem("savedFlights") || "[]")
    setSavedFlights(saved)

    const mockDetails: SavedFlight[] = saved.map((flightNumber: string) => ({
      flightNumber,
      airline: getRandomAirline(),
      route: getRandomRoute(),
      status: getRandomStatus(),
      savedAt: new Date().toLocaleDateString(),
    }))

    setFlightDetails(mockDetails)
    setIsLoading(false)
  }

  const getRandomAirline = () => {
    const airlines = [
      "American Airlines",
      "Delta Air Lines",
      "United Airlines",
      "Southwest Airlines",
      "JetBlue Airways",
    ]
    return airlines[Math.floor(Math.random() * airlines.length)]
  }

  const getRandomRoute = () => {
    const routes = ["JFK → LAX", "ORD → MIA", "SFO → NRT", "LHR → JFK", "DXB → SYD"]
    return routes[Math.floor(Math.random() * routes.length)]
  }

  const getRandomStatus = () => {
    const statuses = ["On Time", "Delayed", "Boarding", "Departed", "Landed"]
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const removeSavedFlight = (flightNumber: string) => {
    const newSaved = savedFlights.filter((f) => f !== flightNumber)
    setSavedFlights(newSaved)
    localStorage.setItem("savedFlights", JSON.stringify(newSaved))

    const newDetails = flightDetails.filter((f) => f.flightNumber !== flightNumber)
    setFlightDetails(newDetails)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "on time":
      case "boarding":
        return "bg-green-500"
      case "delayed":
        return "bg-yellow-500"
      case "departed":
        return "bg-blue-500"
      case "landed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading saved flights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Flights</h1>
              <p className="text-gray-600">Keep track of your favorite flights for quick access</p>
            </div>
            <Link href="/search">
              <Button>
                <Plane className="mr-2 h-4 w-4" />
                Search Flights
              </Button>
            </Link>
          </div>
        </div>

        {flightDetails.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Saved Flights</h2>
            <p className="text-gray-600 mb-6">Start saving flights to keep track of your favorites</p>
            <Link href="/search">
              <Button>
                Search for Flights
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {flightDetails.length} Saved Flight{flightDetails.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {flightDetails.map((flight, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                        <Plane className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{flight.flightNumber}</h3>
                        <p className="text-gray-600">{flight.airline}</p>
                        <p className="text-sm text-gray-500">Saved on {flight.savedAt}</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 mb-1">{flight.route}</div>
                      <Badge className={`${getStatusColor(flight.status)} text-white`}>{flight.status}</Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link href={`/details/${flight.flightNumber}`}>
                        <Button variant="outline">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSavedFlight(flight.flightNumber)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
