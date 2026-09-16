'use client'

import React, { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
  label?: string
  className?: string
}

export function QRCodeDisplay({ value, size = 200, label, className = '' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: '#8B4513', // Dark brown
            light: '#FFFFFF',
          },
        },
        (error: Error | null | undefined) => {
          if (error) {
            console.error('QR Code generation error:', error)
          }
        }
      )
    }
  }, [value, size])

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="p-4 bg-white rounded-lg border-2 border-amber-200">
        <canvas ref={canvasRef} />
      </div>
      {label && (
        <p className="text-sm font-medium text-amber-900">{label}</p>
      )}
    </div>
  )
}
