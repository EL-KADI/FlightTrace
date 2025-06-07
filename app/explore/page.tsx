"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plane, Clock, Star, ArrowRight } from "lucide-react"
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

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const [flights, setFlights] = useState<Flight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAirport, setSelectedAirport] = useState(searchParams.get("airport") || "all")
  const [flightType, setFlightType] = useState("departure")
  const [statusFilter, setStatusFilter] = useState("all")
  const [savedFlights, setSavedFlights] = useState<string[]>([])

  const majorAirports = [
    { code: "JFK", name: "John F Kennedy International", city: "New York" },
    { code: "LAX", name: "Los Angeles International", city: "Los Angeles" },
    { code: "LHR", name: "London Heathrow", city: "London" },
    { code: "DXB", name: "Dubai International", city: "Dubai" },
    { code: "CDG", name: "Charles de Gaulle", city: "Paris" },
    { code: "NRT", name: "Narita International", city: "Tokyo" },
    { code: "SYD", name: "Sydney Kingsford Smith", city: "Sydney" },
    { code: "ORD", name: "Chicago O'Hare International", city: "Chicago" },
    { code: "MIA", name: "Miami International", city: "Miami" },
    { code: "SFO", name: "San Francisco International", city: "San Francisco" },
  ]

  useEffect(() => {
    const saved = localStorage.getItem("savedFlights")
    if (saved) {
      setSavedFlights(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    fetchFlights()
  }, [selectedAirport, flightType])

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

  const fetchFlights = async () => {
    setIsLoading(true)
    setError("")

    try {
      let url = "/api/explore"
      const params = new URLSearchParams()

      if (selectedAirport && selectedAirport !== "all") {
        params.append("airport", selectedAirport)
        params.append("type", flightType)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)

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
        setError("No flights found for the selected criteria.")
      }
    } catch (err) {
      console.error("Explore flights error:", err)
      setError("Failed to load flights. Please try again.")
      setFlights([])
    } finally {
      setIsLoading(false)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Flights</h1>
          <p className="text-gray-600 mb-6">Browse flights from airports worldwide</p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Airport</label>
              <Select value={selectedAirport} onValueChange={setSelectedAirport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an airport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Airports</SelectItem>
                  {majorAirports.map((airport) => (
                    <SelectItem key={airport.code} value={airport.code}>
                      {airport.code} - {airport.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flight Type</label>
              <Select value={flightType} onValueChange={setFlightType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Flight Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departure">Departures</SelectItem>
                  <SelectItem value="arrival">Arrivals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
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
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading flights...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-6 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && filteredFlights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedAirport && selectedAirport !== "all"
                  ? `${selectedAirport} ${flightType === "departure" ? "Departures" : "Arrivals"}`
                  : "All Flights"}
                ({filteredFlights.length} flight{filteredFlights.length !== 1 ? "s" : ""})
              </h2>
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

        {!isLoading && !error && filteredFlights.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Flights Found</h3>
              <p className="text-gray-600">Try selecting a different airport or adjusting your filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
