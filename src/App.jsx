import { useState, useEffect, useCallback } from 'react'

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?from=GBP&to=NZD'

function App() {
  const [rate, setRate] = useState(null)
  const [date, setDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(FRANKFURTER_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setRate(data.rates.NZD)
      setDate(data.date)
    } catch (err) {
      setError('Failed to fetch exchange rate. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRate()
  }, [fetchRate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-sm p-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Exchange Rate</p>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">GBP / NZD</h1>
        </div>

        <div className="flex flex-col items-center gap-2 min-h-[80px] justify-center">
          {loading && (
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          )}

          {!loading && error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {!loading && !error && rate !== null && (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900 tabular-nums">
                  {rate.toFixed(4)}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                1 GBP = {rate.toFixed(4)} NZD
              </p>
              <p className="text-xs text-gray-400">
                as of {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </>
          )}
        </div>

        <button
          onClick={fetchRate}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Fetching…' : 'Refresh'}
        </button>
      </div>
    </div>
  )
}

export default App
