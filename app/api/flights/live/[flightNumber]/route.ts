import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { flightNumber: string } }) {
  const { flightNumber } = params

  if (!flightNumber) {
    return NextResponse.json({ error: "Flight number is required" }, { status: 400 })
  }

  try {
    const apiKey = "6e0cb5a76273b0cb414506c55d2b9086"
    const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}&live=1`

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message || "API Error" }, { status: 400 })
    }

    return NextResponse.json({
      flights: data.data || [],
      live_data: data.data?.[0]?.live || null,
    })
  } catch (error) {
    console.error("Live flight data API error:", error)
    return NextResponse.json({ error: "Failed to fetch live flight data" }, { status: 500 })
  }
}
