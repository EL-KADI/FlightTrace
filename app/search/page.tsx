"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, Star, Filter, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Flight {
  flight_number: string
  airline: string | { name: string; iata: string; icao: string }
  departure: {
    airport: string | { name: string; iata: string; icao: string }
    iata: string
    scheduled: string
    estimated: string
    gate: string
    terminal: string
  }
  arrival: {
    airport: string | { name: string; iata: string; icao: string }
    iata: string
    scheduled: string
    estimated: string
    gate: string
    terminal: string
  }
  flight_status: string
  aircraft: {
    registration: string
    iata: string
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [flights, setFlights] = useState<Flight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [savedFlights, setSavedFlights] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("savedFlights")
    if (saved) {
      setSavedFlights(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (searchQuery) {
      searchFlights()
    }
  }, [searchQuery])

  const normalizeFlightData = (rawFlight: any): Flight => {
    const flightNumber = rawFlight.flight?.iata || rawFlight.flight_number || "N/A"
    const airline =
      typeof rawFlight.airline === "string" ? rawFlight.airline : rawFlight.airline?.name || "Unknown Airline"

    return {
      flight_number: flightNumber,
      airline: airline,
      departure: {
        airport:
          typeof rawFlight.departure?.airport === "string"
            ? rawFlight.departure.airport
            : rawFlight.departure?.airport?.name || "Unknown Airport",
        iata: rawFlight.departure?.iata || "N/A",
        scheduled: rawFlight.departure?.scheduled || "",
        estimated: rawFlight.departure?.estimated || rawFlight.departure?.scheduled || "",
        gate: rawFlight.departure?.gate || "",
        terminal: rawFlight.departure?.terminal || "",
      },
      arrival: {
        airport:
          typeof rawFlight.arrival?.airport === "string"
            ? rawFlight.arrival.airport
            : rawFlight.arrival?.airport?.name || "Unknown Airport",
        iata: rawFlight.arrival?.iata || "N/A",
        scheduled: rawFlight.arrival?.scheduled || "",
        estimated: rawFlight.arrival?.estimated || rawFlight.arrival?.scheduled || "",
        gate: rawFlight.arrival?.gate || "",
        terminal: rawFlight.arrival?.terminal || "",
      },
      flight_status: rawFlight.flight_status || "unknown",
      aircraft: {
        registration: rawFlight.aircraft?.registration || "",
        iata: rawFlight.aircraft?.iata || "",
      },
    }
  }

  // Update the searchFlights function to use the correct API endpoint
  const searchFlights = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const normalizedFlights = (data.flights || []).map(normalizeFlightData)
      setFlights(normalizedFlights)

      if (!data.flights || data.flights.length === 0) {
        setError("No flights found matching your search criteria.")
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Failed to search flights. Please try again.")
      setFlights([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchFlights()
    }
  }

  const toggleSavedFlight = (flightNumber: string) => {
    const newSaved = savedFlights.includes(flightNumber)
      ? savedFlights.filter((f) => f !== flightNumber)
      : [...savedFlights, flightNumber]

    setSavedFlights(newSaved)
    localStorage.setItem("savedFlights", JSON.stringify(newSaved))
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
      case "active":
        return "bg-green-500"
      case "delayed":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      case "landed":
        return "bg-blue-500"
      case "boarding":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "N/A"
    }
  }

  const getAirlineName = (airline: string | { name: string; iata: string; icao: string }) => {
    return typeof airline === "string" ? airline : airline.name
  }

  const getAirportName = (airport: string | { name: string; iata: string; icao: string }) => {
    return typeof airport === "string" ? airport : airport.name
  }

  const filteredFlights = flights.filter((flight) => statusFilter === "all" || flight.flight_status === statusFilter)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Enter flight number, airline, or route (e.g., AA123, JFK, American)"
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

          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <Filter className="h-5 w-5 text-gray-600" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Flights</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="boarding">Boarding</SelectItem>
                <SelectItem value="landed">Landed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Searching for flights...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-6 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800 font-medium">Error</p>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && filteredFlights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results ({filteredFlights.length} flight{filteredFlights.length !== 1 ? "s" : ""})
              </h2>
              {searchQuery && (
                <p className="text-gray-600">
                  Results for: <span className="font-semibold">"{searchQuery}"</span>
                </p>
              )}
            </div>

            {filteredFlights.map((flight, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{flight.flight_number}</h3>
                        <p className="text-gray-600">{getAirlineName(flight.airline)}</p>
                      </div>
                      <Badge className={`${getStatusColor(flight.flight_status)} text-white`}>
                        {flight.flight_status.charAt(0).toUpperCase() + flight.flight_status.slice(1)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSavedFlight(flight.flight_number)}
                      className={savedFlights.includes(flight.flight_number) ? "text-yellow-500" : "text-gray-400"}
                    >
                      <Star
                        className={`h-5 w-5 ${savedFlights.includes(flight.flight_number) ? "fill-current" : ""}`}
                      />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Departure</h4>
                      <div className="space-y-1">
                        <p className="text-lg font-bold">{flight.departure.iata}</p>
                        <p className="text-sm text-gray-600">{getAirportName(flight.departure.airport)}</p>
                        <p className="text-sm">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {formatTime(flight.departure.scheduled)}
                        </p>
                        {flight.departure.gate && <p className="text-sm text-gray-600">Gate {flight.departure.gate}</p>}
                        {flight.departure.terminal && (
                          <p className="text-sm text-gray-600">Terminal {flight.departure.terminal}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <ArrowRight className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{flight.aircraft?.iata || "Aircraft"}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Arrival</h4>
                      <div className="space-y-1">
                        <p className="text-lg font-bold">{flight.arrival.iata}</p>
                        <p className="text-sm text-gray-600">{getAirportName(flight.arrival.airport)}</p>
                        <p className="text-sm">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {formatTime(flight.arrival.scheduled)}
                        </p>
                        {flight.arrival.gate && <p className="text-sm text-gray-600">Gate {flight.arrival.gate}</p>}
                        {flight.arrival.terminal && (
                          <p className="text-sm text-gray-600">Terminal {flight.arrival.terminal}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {flight.aircraft?.registration && <span>Registration: {flight.aircraft.registration}</span>}
                    </div>
                    <Link href={`/details/${flight.flight_number}`}>
                      <Button variant="outline">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredFlights.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Flights Found</h3>
              <p className="text-gray-600 mb-4">No flights match your search for "{searchQuery}". Try searching for:</p>
              <ul className="text-sm text-gray-600 text-left space-y-1">
                <li>• Flight numbers (e.g., AA123, DL456)</li>
                <li>• Airport codes (e.g., JFK, LAX, ORD)</li>
                <li>• Airline names (e.g., American, Delta)</li>
                <li>• Routes (e.g., JFK to LAX)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
