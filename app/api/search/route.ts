import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 })
  }

  try {
    const apiKey = "6e0cb5a76273b0cb414506c55d2b9086"

    let apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&limit=50`

    if (query.includes("→") || query.includes("to")) {
      const parts = query.split(/→|to/i).map((part) => part.trim())
      if (parts.length === 2) {
        const [dep, arr] = parts
        apiUrl += `&dep_iata=${encodeURIComponent(dep)}&arr_iata=${encodeURIComponent(arr)}`
      }
    } else if (query.length === 3 && query.match(/^[A-Z]{3}$/)) {
      apiUrl += `&dep_iata=${query}`
    } else if (query.match(/^[A-Z]{2}\d+$/)) {
      apiUrl += `&flight_iata=${query}`
    } else {
      apiUrl += `&airline_name=${encodeURIComponent(query)}`
    }

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

    const flights = data.data || []

    return NextResponse.json({
      flights: flights,
      pagination: data.pagination || null,
      source: "api",
    })
  } catch (error) {
    console.error("AviationStack API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch flight data",
        flights: [],
        source: "error",
      },
      { status: 500 },
    )
  }
}
