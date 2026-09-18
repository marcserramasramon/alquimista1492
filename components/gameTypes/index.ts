/**
 * Game Component Props Interface
 * Shared interface for all game components
 */

export interface SubmitResult {
  correct: boolean
  message?: string
  score?: number
  xifra?: number
  evidence?: string
  bellSequence?: number[]
  sequence?: number[]
  epilogue?: string
  decisionPercentage?: {
    accept?: number
    reject?: number
    optionA?: number
    optionB?: number
  }
  giro?: boolean
  isGiro?: boolean
}

export interface GameProps {
  stationId: string
  content: Record<string, unknown> // Public station content (narrativa, dades públiques)
  sharedState: unknown // Shared state across team
  setSharedState: (state: unknown) => void
  submit: (answer: unknown) => Promise<SubmitResult>
  solved: boolean
}
