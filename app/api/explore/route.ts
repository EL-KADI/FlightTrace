import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const airport = searchParams.get("airport")
  const type = searchParams.get("type") || "departure"
  const limit = searchParams.get("limit") || "100"

  try {
    const apiKey = "6e0cb5a76273b0cb414506c55d2b9086"
    let apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&limit=${limit}`

    if (airport) {
      if (type === "departure") {
        apiUrl += `&dep_iata=${airport}`
      } else {
        apiUrl += `&arr_iata=${airport}`
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

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

    const flights = data.data || []

    return NextResponse.json({
      flights: flights,
      pagination: data.pagination || null,
      source: "api",
    })
  } catch (error) {
    console.error("Explore flights API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch flights data",
        flights: [],
        source: "error",
      },
      { status: 500 },
    )
  }
}
