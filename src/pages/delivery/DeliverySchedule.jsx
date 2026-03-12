import React, { useEffect, useState } from 'react'
import managerAPI from '../../services/managerAPI'
import { useAuth } from '../../context/AuthContext'
import { CalendarClock, Clock, Loader2, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'

const SLOT_OPTIONS = ['Morning 9-12', 'Afternoon 12-4', 'Evening 4-8']

export default function DeliverySchedule() {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState({
    workingHours: '9 AM - 5 PM',
    maxOrdersPerSlot: 10,
    currentLoad: 0,
    availabilitySlots: [...SLOT_OPTIONS]
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    managerAPI.getMySchedule()
      .then(data => {
        if (data.deliveryPartner) {
          setSchedule({
            workingHours: data.deliveryPartner.workingHours || '9 AM - 5 PM',
            maxOrdersPerSlot: data.deliveryPartner.maxOrdersPerSlot || 10,
            currentLoad: data.deliveryPartner.currentLoad || 0,
            availabilitySlots: data.deliveryPartner.availabilitySlots || [...SLOT_OPTIONS]
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleSlot = (slot) => {
    setSchedule(prev => ({
      ...prev,
      availabilitySlots: prev.availabilitySlots.includes(slot)
        ? prev.availabilitySlots.filter(s => s !== slot)
        : [...prev.availabilitySlots, slot]
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await managerAPI.updateMySchedule({
        workingHours: schedule.workingHours,
        maxOrdersPerSlot: schedule.maxOrdersPerSlot,
        availabilitySlots: schedule.availabilitySlots
      })
      toast.success('Schedule updated successfully')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to update schedule')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-500 mt-1">Manage your availability and work preferences</p>
      </div>

      {/* Current Load */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={20} />
          Current Status
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Current Load</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {schedule.currentLoad} <span className="text-lg text-gray-400">/ {schedule.maxOrdersPerSlot}</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Working Hours</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{schedule.workingHours}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CalendarClock size={20} />
          Schedule Settings
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
          <input
            type="text"
            value={schedule.workingHours}
            onChange={e => setSchedule(p => ({...p, workingHours: e.target.value}))}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Orders Per Slot</label>
          <input
            type="number"
            min={1}
            max={20}
            value={schedule.maxOrdersPerSlot}
            onChange={e => setSchedule(p => ({...p, maxOrdersPerSlot: Math.max(parseInt(e.target.value) || 10, 10)}))}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Availability Slots</label>
          <div className="flex flex-wrap gap-3">
            {SLOT_OPTIONS.map(slot => {
              const active = schedule.availabilitySlots.includes(slot)
              return (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    active
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  )
}
