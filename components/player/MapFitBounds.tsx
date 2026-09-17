'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { Station } from '@/content/public/stations'

interface MapFitBoundsProps {
  stations: Station[]
}

export function MapFitBounds({ stations }: MapFitBoundsProps) {
  const map = useMap()

  useEffect(() => {
    if (!map || stations.length === 0) {
      return
    }

    // Small delay to ensure map is fully initialized
    const timer = setTimeout(() => {
      try {
        // Calculate bounds from stations
        const lats = stations.map((s) => s.latitude)
        const lons = stations.map((s) => s.longitude)

        const minLat = Math.min(...lats)
        const maxLat = Math.max(...lats)
        const minLon = Math.min(...lons)
        const maxLon = Math.max(...lons)

        // Fit map to bounds
        const bounds = [
          [minLat, minLon],
          [maxLat, maxLon],
        ] as const

        if (map.fitBounds && typeof map.fitBounds === 'function') {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        }
      } catch (error) {
        console.error('Error fitting bounds:', error)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [map, stations])

  return null
}
