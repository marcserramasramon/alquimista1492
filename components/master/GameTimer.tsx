'use client'

import { useEffect, useState } from 'react'

interface GameTimerProps {
  startTime?: Date | null
  endTime?: Date | null
  totalMinutes?: number
}

export function GameTimer({
  startTime,
  endTime,
  totalMinutes = 90,
}: GameTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [status, setStatus] = useState<'active' | 'warning' | 'critical' | 'ended'>(
    'active'
  )

  useEffect(() => {
    if (!endTime) {
      // If no endTime, calculate from startTime
      if (startTime) {
        const calcEndTime = new Date(startTime.getTime() + totalMinutes * 60 * 1000)
        const timer = setInterval(() => {
          const now = new Date()
          const remaining = Math.max(0, calcEndTime.getTime() - now.getTime())
          const seconds = Math.floor(remaining / 1000)
          setTimeRemaining(seconds)

          // Set status based on remaining time
          const percentRemaining = (remaining / (totalMinutes * 60 * 1000)) * 100
          if (seconds === 0) {
            setStatus('ended')
          } else if (percentRemaining <= 10) {
            setStatus('critical')
          } else if (percentRemaining <= 25) {
            setStatus('warning')
          } else {
            setStatus('active')
          }
        }, 1000)

        return () => clearInterval(timer)
      }
    } else {
      const timer = setInterval(() => {
        const now = new Date()
        const remaining = Math.max(0, endTime.getTime() - now.getTime())
        const seconds = Math.floor(remaining / 1000)
        setTimeRemaining(seconds)

        // Set status based on remaining time
        const percentRemaining = (remaining / (totalMinutes * 60 * 1000)) * 100
        if (seconds === 0) {
          setStatus('ended')
        } else if (percentRemaining <= 10) {
          setStatus('critical')
        } else if (percentRemaining <= 25) {
          setStatus('warning')
        } else {
          setStatus('active')
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [startTime, endTime, totalMinutes])

  if (timeRemaining === null) {
    return null
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const statusColors = {
    active: 'bg-green-100 text-green-900 border-green-300',
    warning: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    critical: 'bg-red-100 text-red-900 border-red-300',
    ended: 'bg-gray-100 text-gray-900 border-gray-300',
  }

  return (
    <div className={`rounded-xl p-6 border-2 ${statusColors[status]}`}>
      <div className="text-center">
        <p className="text-sm font-medium opacity-75 mb-2">Temps restant</p>
        <div className="text-5xl font-bold font-mono tracking-wider">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p className="text-xs mt-3 opacity-75">
          {status === 'ended'
            ? "Temps finalitzat!"
            : status === 'critical'
              ? 'Fase crítica!'
              : status === 'warning'
                ? 'Últims 15 minuts'
                : 'En joc'}
        </p>
      </div>
    </div>
  )
}
