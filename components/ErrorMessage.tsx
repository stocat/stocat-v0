"use client"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 text-center">
      <p className="text-red-400 mb-2">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-blue-400 hover:text-blue-300 underline">
          다시 시도
        </button>
      )}
    </div>
  )
}
