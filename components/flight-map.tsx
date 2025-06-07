"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface FlightMapProps {
  flight: {
    departure: {
      iata: string
      airport: string
    }
    arrival: {
      iata: string
      airport: string
    }
    live?: {
      latitude: number
      longitude: number
      altitude: number
      speed_horizontal: number
      direction: number
    }
  }
  className?: string
}

export default function FlightMap({ flight, className = "" }: FlightMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  const getAirportCoordinates = (iata: string) => {
    const airports: { [key: string]: [number, number] } = {
      JFK: [40.6413, -73.7781],
      LAX: [33.9425, -118.4081],
      ORD: [41.9742, -87.9073],
      MIA: [25.7959, -80.287],
      SFO: [37.6213, -122.379],
      NRT: [35.772, 140.3929],
      LHR: [51.47, -0.4543],
      DXB: [25.2532, 55.3657],
      SYD: [-33.9399, 151.1753],
      CDG: [49.0097, 2.5479],
    }
    return airports[iata] || [0, 0]
  }

  useEffect(() => {
    if (!mapRef.current) return

    const departureCoords = getAirportCoordinates(flight.departure.iata)
    const arrivalCoords = getAirportCoordinates(flight.arrival.iata)
    const currentCoords = flight.live ? [flight.live.latitude, flight.live.longitude] : departureCoords

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", "100%")
    svg.setAttribute("height", "100%")
    svg.setAttribute("viewBox", "0 0 400 200")
    svg.style.background = "#f0f9ff"
    svg.style.borderRadius = "8px"

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
    gradient.setAttribute("id", "flightPath")
    gradient.setAttribute("x1", "0%")
    gradient.setAttribute("y1", "0%")
    gradient.setAttribute("x2", "100%")
    gradient.setAttribute("y2", "0%")

    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
    stop1.setAttribute("offset", "0%")
    stop1.setAttribute("stop-color", "#10b981")

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop")
    stop2.setAttribute("offset", "100%")
    stop2.setAttribute("stop-color", "#3b82f6")

    gradient.appendChild(stop1)
    gradient.appendChild(stop2)
    defs.appendChild(gradient)
    svg.appendChild(defs)

    const depX = 50
    const depY = 150
    const arrX = 350
    const arrY = 150

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
    const midX = (depX + arrX) / 2
    const midY = depY - 50
    path.setAttribute("d", `M ${depX} ${depY} Q ${midX} ${midY} ${arrX} ${arrY}`)
    path.setAttribute("stroke", "url(#flightPath)")
    path.setAttribute("stroke-width", "3")
    path.setAttribute("fill", "none")
    path.setAttribute("stroke-dasharray", "5,5")
    svg.appendChild(path)

    const depCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    depCircle.setAttribute("cx", depX.toString())
    depCircle.setAttribute("cy", depY.toString())
    depCircle.setAttribute("r", "8")
    depCircle.setAttribute("fill", "#10b981")
    svg.appendChild(depCircle)

    const arrCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    arrCircle.setAttribute("cx", arrX.toString())
    arrCircle.setAttribute("cy", arrY.toString())
    arrCircle.setAttribute("r", "8")
    arrCircle.setAttribute("fill", "#3b82f6")
    svg.appendChild(arrCircle)

    if (flight.live) {
      const progress = 0.6
      const planeX = depX + (arrX - depX) * progress
      const planeY = depY - 50 * Math.sin(Math.PI * progress)

      const planeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      planeCircle.setAttribute("cx", planeX.toString())
      planeCircle.setAttribute("cy", planeY.toString())
      planeCircle.setAttribute("r", "6")
      planeCircle.setAttribute("fill", "#f59e0b")
      planeCircle.setAttribute("stroke", "#ffffff")
      planeCircle.setAttribute("stroke-width", "2")
      svg.appendChild(planeCircle)
    }

    const depText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    depText.setAttribute("x", depX.toString())
    depText.setAttribute("y", (depY + 20).toString())
    depText.setAttribute("text-anchor", "middle")
    depText.setAttribute("font-size", "12")
    depText.setAttribute("font-weight", "bold")
    depText.setAttribute("fill", "#374151")
    depText.textContent = flight.departure.iata
    svg.appendChild(depText)

    const arrText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    arrText.setAttribute("x", arrX.toString())
    arrText.setAttribute("y", (arrY + 20).toString())
    arrText.setAttribute("text-anchor", "middle")
    arrText.setAttribute("font-size", "12")
    arrText.setAttribute("font-weight", "bold")
    arrText.setAttribute("fill", "#374151")
    arrText.textContent = flight.arrival.iata
    svg.appendChild(arrText)

    mapRef.current.innerHTML = ""
    mapRef.current.appendChild(svg)
  }, [flight])

  return (
    <div className={`relative bg-blue-50 rounded-lg overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      {!flight.live && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Live tracking not available</p>
          </div>
        </div>
      )}
    </div>
  )
}
