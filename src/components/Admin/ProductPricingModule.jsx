import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Zap, PenLine, AlertTriangle, Info } from 'lucide-react'

// ─── Rounding helpers ────────────────────────────────────────────────────────

/** Round UP to the nearest number ending in 49 or 99 */
function roundUpTo49or99(value) {
  const base = Math.floor(value / 100) * 100
  // Candidates in the current century: base+49 and base+99
  const candidate49 = base + 49
  const candidate99 = base + 99
  // Pick first one that is >= value
  if (value <= candidate49) return candidate49
  if (value <= candidate99) return candidate99
  // value is > base+99, go to next century
  return base + 149
}

/** Round UP to the nearest number ending in 99 */
function roundUpTo99(value) {
  const base = Math.floor(value / 100) * 100
  const candidate = base + 99
  if (value <= candidate) return candidate
  return base + 199
}

// ─── Calculation engines ──────────────────────────────────────────────────────

function calcAuto({ costPrice, profitPct, gstPct, deliveryCost, compareAtInput }) {
  if (!costPrice || costPrice <= 0) return null
  const cp = parseFloat(costPrice)
  const pp = parseFloat(profitPct) || 50
  const gp = parseFloat(gstPct) || 5
  const dc = parseFloat(deliveryCost) ?? 80

  const profit = cp * (pp / 100)
  const subtotal = cp + profit
  const gstPayable = subtotal * (gp / 100)
  const rawMRP = subtotal + gstPayable   // MRP before rounding
  const finalMRP = roundUpTo49or99(rawMRP)
  const customerPrice = finalMRP + dc

  let compareAt
  let isCompareAtLow = false
  if (compareAtInput && parseFloat(compareAtInput) > 0) {
    compareAt = parseFloat(compareAtInput)
    if (compareAt < finalMRP) {
      isCompareAtLow = true
    }
  } else {
    compareAt = roundUpTo99(finalMRP * 1.5)
  }

  return {
    costPrice: cp,
    profit,
    profitPct: pp,
    gstPayable,
    gstPct: gp,
    rawMRP,
    finalMRP,
    deliveryCost: dc,
    customerPrice,
    compareAt,
    isLoss: profit < 0,
    isLowProfit: pp > 0 && pp < 10,
    isCompareAtLow
  }
}

function calcManual({ costPrice, finalMRP, gstPct, deliveryCost, compareAtInput }) {
  if (!costPrice || costPrice <= 0 || !finalMRP || finalMRP <= 0) return null
  const cp = parseFloat(costPrice)
  const mrp = parseFloat(finalMRP)
  const gp = parseFloat(gstPct) || 5
  const dc = parseFloat(deliveryCost) ?? 80

  const priceBeforeGST = mrp / (1 + gp / 100)
  const profit = priceBeforeGST - cp
  const profitPct = cp > 0 ? (profit / cp) * 100 : 0
  const gstPayable = mrp - priceBeforeGST
  const customerPrice = mrp + dc

  let compareAt
  let isCompareAtLow = false
  if (compareAtInput && parseFloat(compareAtInput) > 0) {
    compareAt = parseFloat(compareAtInput)
    if (compareAt < mrp) {
      isCompareAtLow = true
    }
  } else {
    compareAt = roundUpTo99(mrp * 1.5)
  }

  return {
    costPrice: cp,
    profit,
    profitPct,
    gstPayable,
    gstPct: gp,
    finalMRP: mrp,
    deliveryCost: dc,
    customerPrice,
    compareAt,
    isLoss: profit < 0,
    isLowProfit: profit >= 0 && profitPct < 10,
    isCompareAtLow
  }
}

// ─── Currency formatter ───────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)

// ─── Input component ──────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, required, hint, prefix = '₹', type = 'number' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="ml-1 text-xs text-gray-400 font-normal">({hint})</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          step="0.01"
          min="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${prefix ? 'pl-7' : 'px-3'} pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm`}
        />
      </div>
    </div>
  )
}

// ─── Result row ───────────────────────────────────────────────────────────────
function ResultRow({ label, value, highlight, muted, strikethrough }) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${highlight ? 'font-semibold' : ''}`}>
      <span className={`text-sm ${muted ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
      <span className={`text-sm ${highlight ? 'text-gray-900 text-base' : muted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {strikethrough ? <s>{value}</s> : value}
      </span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductPricingModule({ initialValues = {}, onChange }) {
  const [mode, setMode] = useState(initialValues.pricingMode || 'auto')

  // Auto mode inputs
  const [costPrice, setCostPrice] = useState(initialValues.costPrice ? String(initialValues.costPrice) : '')
  const [profitPct, setProfitPct] = useState(
    initialValues.pricingMode === 'auto' && initialValues.costPrice && initialValues.price
      ? '' // will be recalculated if needed
      : '50'
  )
  const [gstPct, setGstPct] = useState(initialValues.gstRate ? String(initialValues.gstRate) : '5')
  const [deliveryCost, setDeliveryCost] = useState(
    initialValues.deliveryCost !== undefined ? String(initialValues.deliveryCost) : '80'
  )
  const [compareAtInput, setCompareAtInput] = useState(() => {
    if (!initialValues.originalPrice) return ''
    const defaultAuto = roundUpTo99(initialValues.price * 1.5)
    
    // Check old roundToNearest99 logic values as well
    const base = Math.round((initialValues.price * 1.5) / 100) * 100
    const oldAuto1 = base - 1
    const oldAuto2 = base + 99

    if (
      initialValues.originalPrice === defaultAuto ||
      initialValues.originalPrice === oldAuto1 ||
      initialValues.originalPrice === oldAuto2
    ) {
      return '' // Treat as auto-generated if it matches previous defaults
    }
    return String(initialValues.originalPrice)
  })

  // Manual mode extra input
  const [finalMRP, setFinalMRP] = useState(initialValues.price ? String(initialValues.price) : '')

  // Computed result
  const [result, setResult] = useState(null)

  // Keep onChange in a ref so it doesn't cause useCallback to re-run
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  const recalculate = useCallback(() => {
    let r = null
    if (mode === 'auto') {
      r = calcAuto({ costPrice, profitPct, gstPct, deliveryCost, compareAtInput })
    } else {
      r = calcManual({ costPrice, finalMRP, gstPct, deliveryCost, compareAtInput })
    }
    setResult(r)
    if (r && onChangeRef.current) {
      onChangeRef.current({
        price: r.finalMRP,
        originalPrice: r.compareAt,
        discount: r.compareAt > r.finalMRP
          ? Math.round(((r.compareAt - r.finalMRP) / r.compareAt) * 100)
          : 0,
        costPrice: r.costPrice,
        deliveryCost: r.deliveryCost,
        pricingMode: mode,
        gstRate: r.gstPct,
      })
    }
  }, [mode, costPrice, profitPct, gstPct, deliveryCost, compareAtInput, finalMRP])

  useEffect(() => {
    recalculate()
  }, [recalculate])

  const switchMode = (newMode) => {
    setMode(newMode)
    // When switching to manual, pre-fill finalMRP from current result
    if (newMode === 'manual' && result) {
      setFinalMRP(String(result.finalMRP))
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pricing Mode <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => switchMode('auto')}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
              mode === 'auto'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Zap size={18} className={mode === 'auto' ? 'text-blue-500' : 'text-gray-400'} />
            <div>
              <div className="font-semibold text-sm">Auto Pricing</div>
              <div className="text-xs opacity-70">Based on profit %</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => switchMode('manual')}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
              mode === 'manual'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <PenLine size={18} className={mode === 'manual' ? 'text-purple-500' : 'text-gray-400'} />
            <div>
              <div className="font-semibold text-sm">Manual Pricing</div>
              <div className="text-xs opacity-70">Enter MRP directly</div>
            </div>
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className={`rounded-xl border-2 p-4 space-y-3 ${
        mode === 'auto' ? 'border-blue-100 bg-blue-50/30' : 'border-purple-100 bg-purple-50/30'
      }`}>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Cost Price"
            value={costPrice}
            onChange={setCostPrice}
            placeholder="e.g. 250"
            required
            hint="your final cost"
          />
          {mode === 'auto' ? (
            <Field
              label="Profit %"
              value={profitPct}
              onChange={setProfitPct}
              placeholder="50"
              hint="default 50%"
              prefix="%"
            />
          ) : (
            <Field
              label="Final MRP"
              value={finalMRP}
              onChange={setFinalMRP}
              placeholder="e.g. 899"
              required
              hint="selling price"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="GST %"
            value={gstPct}
            onChange={setGstPct}
            placeholder="5"
            hint="default 5%"
            prefix="%"
          />
          <Field
            label="Delivery Cost"
            value={deliveryCost}
            onChange={setDeliveryCost}
            placeholder="80"
            hint="default ₹80"
          />
        </div>

        <Field
          label="Compare At Price"
          value={compareAtInput}
          onChange={setCompareAtInput}
          placeholder="Leave blank to auto-generate"
          hint="optional – shown as strikethrough"
        />
      </div>

      {/* Output card */}
      {result ? (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          {/* Warnings */}
          {(result.isLoss || result.isLowProfit || result.isCompareAtLow) && (
            <div className={`flex flex-col gap-1 px-4 py-2 text-sm font-medium border-b ${
              result.isLoss || result.isCompareAtLow ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
            }`}>
              {result.isLoss && (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={15} /> 🔴 Loss! Your cost price exceeds selling price.
                </div>
              )}
              {result.isLowProfit && !result.isLoss && (
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle size={15} /> ⚠️ Low profit margin (below 10%). Consider adjusting pricing.
                </div>
              )}
              {result.isCompareAtLow && (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={15} /> 🔴 Warning: Compare At price is less than Final MRP!
                </div>
              )}
            </div>
          )}

          <div className="p-4 space-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pricing Breakdown</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                result.isLoss ? 'bg-red-100 text-red-600' : result.isLowProfit ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
              }`}>
                {result.isLoss
                  ? `LOSS ${fmt(Math.abs(result.profit))}`
                  : `${result.profitPct.toFixed(1)}% margin`}
              </span>
            </div>

            <ResultRow label="Cost Price" value={fmt(result.costPrice)} />
            <ResultRow
              label={`Profit (${result.profitPct.toFixed(1)}%)`}
              value={result.isLoss ? `-${fmt(Math.abs(result.profit))}` : fmt(result.profit)}
            />
            <ResultRow label={`GST Payable (${result.gstPct}%)`} value={fmt(result.gstPayable)} muted />
            <div className="border-t border-dashed border-gray-200 my-2" />

            {/* Rounding rows — only in Auto mode */}
            {result.rawMRP !== undefined ? (
              <>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-gray-500">Price Before Rounding</span>
                  <span className="text-sm text-gray-500 line-through">{fmt(result.rawMRP)}</span>
                </div>
                <div className="flex justify-between items-center py-1 rounded-md bg-blue-50 px-2 -mx-2">
                  <span className="text-sm font-semibold text-blue-700">Price After Rounding ↑</span>
                  <span className="text-sm font-semibold text-blue-700">
                    {fmt(result.rawMRP)} → {fmt(result.finalMRP)}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 pl-1 -mt-0.5">
                  Rounded UP to nearest x49 / x99
                </div>
              </>
            ) : null}

            <ResultRow label="Final MRP" value={fmt(result.finalMRP)} highlight />
            <ResultRow label="Compare At (strikethrough)" value={fmt(result.compareAt)} strikethrough muted />
            <div className="border-t border-dashed border-gray-200 my-2" />
            <ResultRow label="Delivery Cost" value={fmt(result.deliveryCost)} />
            <div className="flex justify-between items-center py-2 bg-gray-50 -mx-4 px-4 mt-2 rounded-b-xl">
              <span className="text-sm font-bold text-gray-700">Final Customer Price</span>
              <span className="text-lg font-bold text-gray-900">{fmt(result.customerPrice)}</span>
            </div>
          </div>

        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 py-6 flex flex-col items-center gap-2 text-gray-400">
          <Info size={20} />
          <span className="text-sm">Enter cost price to see pricing breakdown</span>
        </div>
      )}
    </div>
  )
}
