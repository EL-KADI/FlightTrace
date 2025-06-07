import { type NextRequest, NextResponse } from "next/server"

const mockFlightDetails = {
  AA123: {
    flight_number: "AA123",
    airline: "American Airlines",
    departure: {
      airport: "John F Kennedy International",
      iata: "JFK",
      scheduled: "2024-01-15T10:30:00+00:00",
      estimated: "2024-01-15T10:30:00+00:00",
      actual: "2024-01-15T10:35:00+00:00",
      gate: "A12",
      terminal: "8",
    },
    arrival: {
      airport: "Los Angeles International",
      iata: "LAX",
      scheduled: "2024-01-15T13:45:00+00:00",
      estimated: "2024-01-15T13:45:00+00:00",
      actual: "",
      gate: "B7",
      terminal: "4",
    },
    flight_status: "active",
    aircraft: {
      registration: "N123AA",
      iata: "B738",
      icao: "B738",
    },
    live: {
      latitude: 39.8283,
      longitude: -98.5795,
      altitude: 35000,
      speed_horizontal: 850,
      direction: 270,
    },
  },
  DL456: {
    flight_number: "DL456",
    airline: "Delta Air Lines",
    departure: {
      airport: "Chicago O'Hare International",
      iata: "ORD",
      scheduled: "2024-01-15T14:00:00+00:00",
      estimated: "2024-01-15T14:20:00+00:00",
      actual: "2024-01-15T14:25:00+00:00",
      gate: "C15",
      terminal: "2",
    },
    arrival: {
      airport: "Miami International",
      iata: "MIA",
      scheduled: "2024-01-15T17:30:00+00:00",
      estimated: "2024-01-15T17:50:00+00:00",
      actual: "",
      gate: "D3",
      terminal: "N",
    },
    flight_status: "active",
    aircraft: {
      registration: "N456DL",
      iata: "A320",
      icao: "A320",
    },
    live: {
      latitude: 28.4267,
      longitude: -84.2833,
      altitude: 37000,
      speed_horizontal: 780,
      direction: 180,
    },
  },
  UA789: {
    flight_number: "UA789",
    airline: "United Airlines",
    departure: {
      airport: "San Francisco International",
      iata: "SFO",
      scheduled: "2024-01-15T23:15:00+00:00",
      estimated: "2024-01-15T23:15:00+00:00",
      actual: "",
      gate: "G14",
      terminal: "3",
    },
    arrival: {
      airport: "Narita International",
      iata: "NRT",
      scheduled: "2024-01-16T15:45:00+00:00",
      estimated: "2024-01-16T15:45:00+00:00",
      actual: "",
      gate: "A5",
      terminal: "1",
    },
    flight_status: "boarding",
    aircraft: {
      registration: "N789UA",
      iata: "B777",
      icao: "B777",
    },
    live: {
      latitude: 37.6213,
      longitude: -122.379,
      altitude: 0,
      speed_horizontal: 0,
      direction: 0,
    },
  },
}

export async function GET(request: NextRequest, { params }: { params: { flightNumber: string } }) {
  const { flightNumber } = params

  if (!flightNumber) {
    return NextResponse.json({ error: "Flight number is required" }, { status: 400 })
  }

  try {
    const apiKey = "6e0cb5a76273b0cb414506c55d2b9086"
    const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}`

    console.log(`Attempting to fetch details for flight ${flightNumber}...`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || "API Error")
    }

    if (data.data && data.data.length > 0) {
      console.log(`Successfully fetched details for flight ${flightNumber}`)
      return NextResponse.json({
        flight: data.data[0],
        source: "api",
      })
    } else {
      throw new Error("Flight not found in API")
    }
  } catch (error) {
    console.error(`Flight details API error for ${flightNumber}:`, error)

    const mockFlight = mockFlightDetails[flightNumber as keyof typeof mockFlightDetails] || {
      flight_number: flightNumber,
      airline: "Sample Airlines",
      departure: {
        airport: "Sample Departure Airport",
        iata: "DEP",
        scheduled: "2024-01-15T10:00:00+00:00",
        estimated: "2024-01-15T10:00:00+00:00",
        actual: "",
        gate: "A1",
        terminal: "1",
      },
      arrival: {
        airport: "Sample Arrival Airport",
        iata: "ARR",
        scheduled: "2024-01-15T14:00:00+00:00",
        estimated: "2024-01-15T14:00:00+00:00",
        actual: "",
        gate: "B2",
        terminal: "2",
      },
      flight_status: "scheduled",
      aircraft: {
        registration: "N000XX",
        iata: "B737",
        icao: "B737",
      },
      live: {
        latitude: 40.0,
        longitude: -100.0,
        altitude: 35000,
        speed_horizontal: 800,
        direction: 90,
      },
    }

    return NextResponse.json({
      flight: mockFlight,
      source: "mock",
      message: "Using sample data - API temporarily unavailable",
    })
  }
}
