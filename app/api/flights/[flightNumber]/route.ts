import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { flightNumber: string } }) {
  const { flightNumber } = params

  if (!flightNumber) {
    return NextResponse.json({ error: "Flight number is required" }, { status: 400 })
  }

  try {
    const apiKey = "6e0cb5a76273b0cb414506c55d2b9086"
    const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

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
      return NextResponse.json({
        flight: data.data[0],
        source: "api",
      })
    } else {
      return NextResponse.json(
        {
          error: "Flight not found",
          source: "api",
        },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error(`Flight details API error for ${flightNumber}:`, error)
    return NextResponse.json(
      {
        error: "Failed to fetch flight details",
        source: "error",
      },
      { status: 500 },
    )
  }
}
