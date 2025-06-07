"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plane, MapPin, Star, Navigation, Gauge, BarChart3 } from "lucide-react"
import Link from "next/link"
import FlightMap from "@/components/flight-map"

interface FlightDetails {
  flight_number: string
  airline: string
  departure: {
    airport: string
    iata: string
    scheduled: string
    estimated: string
    actual: string
    gate: string
    terminal: string
  }
  arrival: {
    airport: string
    iata: string
    scheduled: string
    estimated: string
    actual: string
    gate: string
    terminal: string
  }
  flight_status: string
  aircraft: {
    registration: string
    iata: string
    icao: string
  }
  live?: {
    latitude: number
    longitude: number
    altitude: number
    speed_horizontal: number
    direction: number
  }
}

export default function FlightDetailsPage() {
  const params = useParams()
  const flightNumber = params.flightNumber as string
  const [flight, setFlight] = useState<FlightDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const savedFlights = JSON.parse(localStorage.getItem("savedFlights") || "[]")
    setIsSaved(savedFlights.includes(flightNumber))
  }, [flightNumber])

  useEffect(() => {
    fetchFlightDetails()
  }, [flightNumber])

  const fetchFlightDetails = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/flights/${flightNumber}`)

      if (!response.ok) {
        throw new Error("Failed to fetch flight details")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.flight) {
        const normalizedFlight: FlightDetails = {
          flight_number: data.flight.flight?.iata || flightNumber,
          airline:
            typeof data.flight.airline === "string"
              ? data.flight.airline
              : data.flight.airline?.name || "Unknown Airline",
          departure: {
            airport:
              typeof data.flight.departure?.airport === "string"
                ? data.flight.departure.airport
                : data.flight.departure?.airport?.name || "Unknown Airport",
            iata: data.flight.departure?.iata || "N/A",
            scheduled: data.flight.departure?.scheduled || "",
            estimated: data.flight.departure?.estimated || "",
            actual: data.flight.departure?.actual || "",
            gate: data.flight.departure?.gate || "",
            terminal: data.flight.departure?.terminal || "",
          },
          arrival: {
            airport:
              typeof data.flight.arrival?.airport === "string"
                ? data.flight.arrival.airport
                : data.flight.arrival?.airport?.name || "Unknown Airport",
            iata: data.flight.arrival?.iata || "N/A",
            scheduled: data.flight.arrival?.scheduled || "",
            estimated: data.flight.arrival?.estimated || "",
            actual: data.flight.arrival?.actual || "",
            gate: data.flight.arrival?.gate || "",
            terminal: data.flight.arrival?.terminal || "",
          },
          flight_status: data.flight.flight_status || "unknown",
          aircraft: {
            registration: data.flight.aircraft?.registration || "",
            iata: data.flight.aircraft?.iata || "",
            icao: data.flight.aircraft?.icao || "",
          },
          live: data.flight.live
            ? {
                latitude: data.flight.live.latitude,
                longitude: data.flight.live.longitude,
                altitude: data.flight.live.altitude,
                speed_horizontal: data.flight.live.speed_horizontal,
                direction: data.flight.live.direction,
              }
            : undefined,
        }
        setFlight(normalizedFlight)
      } else {
        throw new Error("Flight not found")
      }
    } catch (err) {
      console.error("Flight details error:", err)
      setError("Unable to fetch flight details. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSavedFlight = () => {
    const savedFlights = JSON.parse(localStorage.getItem("savedFlights") || "[]")
    const newSaved = isSaved ? savedFlights.filter((f: string) => f !== flightNumber) : [...savedFlights, flightNumber]

    localStorage.setItem("savedFlights", JSON.stringify(newSaved))
    setIsSaved(!isSaved)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-green-500"
      case "active":
        return "bg-blue-500"
      case "delayed":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      case "landed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "N/A"
    }
  }

  const getFlightProgress = () => {
    if (!flight) return 0

    const now = new Date()
    const departure = new Date(flight.departure.scheduled)
    const arrival = new Date(flight.arrival.scheduled)

    if (now < departure) return 0
    if (now > arrival) return 100

    const totalTime = arrival.getTime() - departure.getTime()
    const elapsedTime = now.getTime() - departure.getTime()

    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading flight details...</p>
        </div>
      </div>
    )
  }

  if (error && !flight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">{error}</p>
            <Link href="/search">
              <Button className="mt-4">Back to Search</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!flight) return null

  const progress = getFlightProgress()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/search">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Flight {flight.flight_number}</h1>
              <p className="text-lg text-gray-600">{flight.airline}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={`${getStatusColor(flight.flight_status)} text-white text-lg px-4 py-2`}>
                {flight.flight_status.charAt(0).toUpperCase() + flight.flight_status.slice(1)}
              </Badge>
              <Button
                variant="outline"
                onClick={toggleSavedFlight}
                className={isSaved ? "text-yellow-500 border-yellow-500" : ""}
              >
                <Star className={`h-5 w-5 mr-2 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save Flight"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plane className="mr-2 h-5 w-5" />
                  Flight Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{flight.departure.iata}</div>
                      <div className="text-sm text-gray-600">{flight.departure.airport}</div>
                    </div>
                    <div className="flex-1 mx-8">
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <Plane
                          className="absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600"
                          style={{ left: `${Math.max(0, progress - 2)}%` }}
                        />
                      </div>
                      <div className="text-center mt-2 text-sm text-gray-600">{Math.round(progress)}% Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{flight.arrival.iata}</div>
                      <div className="text-sm text-gray-600">{flight.arrival.airport}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <MapPin className="mr-2 h-5 w-5" />
                    Departure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">{flight.departure.iata}</div>
                    <div className="text-gray-600">{flight.departure.airport}</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Scheduled</div>
                      <div className="font-semibold">{formatTime(flight.departure.scheduled)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Estimated</div>
                      <div className="font-semibold">{formatTime(flight.departure.estimated)}</div>
                    </div>
                    {flight.departure.gate && (
                      <div>
                        <div className="text-gray-600">Gate</div>
                        <div className="font-semibold">{flight.departure.gate}</div>
                      </div>
                    )}
                    {flight.departure.terminal && (
                      <div>
                        <div className="text-gray-600">Terminal</div>
                        <div className="font-semibold">{flight.departure.terminal}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600">
                    <MapPin className="mr-2 h-5 w-5" />
                    Arrival
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">{flight.arrival.iata}</div>
                    <div className="text-gray-600">{flight.arrival.airport}</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Scheduled</div>
                      <div className="font-semibold">{formatTime(flight.arrival.scheduled)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Estimated</div>
                      <div className="font-semibold">{formatTime(flight.arrival.estimated)}</div>
                    </div>
                    {flight.arrival.gate && (
                      <div>
                        <div className="text-gray-600">Gate</div>
                        <div className="font-semibold">{flight.arrival.gate}</div>
                      </div>
                    )}
                    {flight.arrival.terminal && (
                      <div>
                        <div className="text-gray-600">Terminal</div>
                        <div className="font-semibold">{flight.arrival.terminal}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {flight.live && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Live Flight Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Gauge className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{flight.live.altitude.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Altitude (ft)</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Gauge className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{flight.live.speed_horizontal}</div>
                      <div className="text-sm text-gray-600">Speed (km/h)</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Navigation className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{flight.live.direction}°</div>
                      <div className="text-sm text-gray-600">Direction</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <MapPin className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-lg font-bold text-orange-600">
                        {flight.live.latitude.toFixed(2)}, {flight.live.longitude.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Coordinates</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aircraft Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Aircraft Type</div>
                  <div className="font-semibold">{flight.aircraft.iata || "N/A"}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-600">Registration</div>
                  <div className="font-semibold">{flight.aircraft.registration || "N/A"}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-600">ICAO Code</div>
                  <div className="font-semibold">{flight.aircraft.icao || "N/A"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flight Map</CardTitle>
              </CardHeader>
              <CardContent>
                <FlightMap flight={flight} className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flight Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${flight.departure.actual ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                    <div>
                      <div className="font-semibold">Departed</div>
                      <div className="text-sm text-gray-600">
                        {flight.departure.actual
                          ? formatTime(flight.departure.actual)
                          : "Scheduled: " + formatTime(flight.departure.scheduled)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${flight.flight_status === "active" ? "bg-blue-500" : "bg-gray-300"}`}
                    ></div>
                    <div>
                      <div className="font-semibold">In Flight</div>
                      <div className="text-sm text-gray-600">
                        {flight.flight_status === "active" ? "Currently flying" : "Not yet departed"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${flight.arrival.actual ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                    <div>
                      <div className="font-semibold">Arrived</div>
                      <div className="text-sm text-gray-600">
                        {flight.arrival.actual
                          ? formatTime(flight.arrival.actual)
                          : "Scheduled: " + formatTime(flight.arrival.scheduled)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
