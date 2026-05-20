import { useState, useEffect, useCallback } from 'react'

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?from=GBP&to=NZD'
const AMBER_MARGIN = 0.05

function getStatus(rate, target) {
  if (rate === null || target === null) return null
  if (rate >= target) return 'green'
  if (rate >= target - AMBER_MARGIN) return 'amber'
  return 'red'
}

const STATUS_STYLES = {
  green: { dot: 'bg-green-500', text: 'text-green-700 dark:text-green-400', label: 'Above target' },
  amber: { dot: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-400', label: 'Close to target' },
  red:   { dot: 'bg-red-500',   text: 'text-red-700 dark:text-red-400',     label: 'Below target' },
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M14 10.5A6.5 6.5 0 0 1 5.5 2a6.5 6.5 0 1 0 8.5 8.5z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" fill="currentColor" stroke="none" />
      <line x1="8" y1="1"     x2="8"     y2="3"     />
      <line x1="8" y1="13"    x2="8"     y2="15"    />
      <line x1="1" y1="8"     x2="3"     y2="8"     />
      <line x1="13" y1="8"    x2="15"    y2="8"     />
      <line x1="2.93" y1="2.93"   x2="4.34"  y2="4.34"  />
      <line x1="11.66" y1="11.66" x2="13.07" y2="13.07" />
      <line x1="13.07" y1="2.93"  x2="11.66" y2="4.34"  />
      <line x1="4.34"  y1="11.66" x2="2.93"  y2="13.07" />
    </svg>
  )
}

function App() {
  const [rate, setRate] = useState(null)
  const [date, setDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [targetInput, setTargetInput] = useState(
    () => localStorage.getItem('gbpnzd-target') ?? ''
  )
  const [dark, setDark] = useState(
    () => localStorage.getItem('gbpnzd-dark') === 'true'
  )
  const [savingsInput, setSavingsInput] = useState(
    () => localStorage.getItem('gbpnzd-savings') ?? '28000'
  )

  const targetNum = parseFloat(targetInput)
  const validTarget = !isNaN(targetNum) && targetNum > 0
  const status = getStatus(rate, validTarget ? targetNum : null)

  const savingsNum = parseFloat(savingsInput)
  const validSavings = !isNaN(savingsNum) && savingsNum > 0
  const nzdValue = validSavings && rate !== null
    ? new Intl.NumberFormat('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(savingsNum * rate)
    : null

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('gbpnzd-dark', dark)
  }, [dark])

  function handleSavingsChange(e) {
    const val = e.target.value
    setSavingsInput(val)
    if (val === '') {
      localStorage.removeItem('gbpnzd-savings')
    } else {
      localStorage.setItem('gbpnzd-savings', val)
    }
  }

  function handleTargetChange(e) {
    const val = e.target.value
    setTargetInput(val)
    if (val === '') {
      localStorage.removeItem('gbpnzd-target')
    } else {
      localStorage.setItem('gbpnzd-target', val)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-md w-full max-w-sm p-8 flex flex-col items-center gap-6">

        <button
          onClick={() => setDark(d => !d)}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">Exchange Rate</p>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">GBP / NZD</h1>
        </div>

        <div className="flex flex-col items-center gap-2 min-h-[80px] justify-center">
          {loading && (
            <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin" />
          )}

          {!loading && error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {!loading && !error && rate !== null && (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                  {rate.toFixed(4)}
                </span>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                1 GBP = {rate.toFixed(4)} NZD
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                as of {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </>
          )}
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Target rate
          </label>
          <input
            type="number"
            min="0"
            step="0.0001"
            placeholder="e.g. 2.10"
            value={targetInput}
            onChange={handleTargetChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
          />
        </div>

        {status && (() => {
          const s = STATUS_STYLES[status]
          return (
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
              <span className={`text-sm font-medium ${s.text}`}>{s.label}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">target {targetNum.toFixed(4)}</span>
            </div>
          )
        })()}

        <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">Historical context</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              { label: 'Long-term avg', value: '1.9984' },
              { label: '12-month avg',  value: '2.2889' },
              { label: '12-month high', value: '2.3472' },
              { label: '12-month low',  value: '2.2260' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-baseline gap-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-3">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">Savings</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 pointer-events-none select-none">£</span>
            <input
              type="number"
              min="0"
              step="1"
              value={savingsInput}
              onChange={handleSavingsChange}
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500"
            />
          </div>
          {nzdValue !== null && (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">in NZD today</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">NZ${nzdValue}</span>
            </div>
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
