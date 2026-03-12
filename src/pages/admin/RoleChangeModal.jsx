import React, { useMemo, useState } from 'react'
import { X, Shield, AlertCircle, Check } from 'lucide-react'
import { MANAGED_ROLE_OPTIONS, getDisplayRoles, getRoleMeta, normalizeManagedRoles } from './userRolesConfig'

export default function RoleChangeModal({ user, onSubmit, onClose }) {
  const [selectedRoles, setSelectedRoles] = useState(normalizeManagedRoles(user.roles || []))
  const [loading, setLoading] = useState(false)

  const displayRoles = useMemo(() => getDisplayRoles(selectedRoles), [selectedRoles])

  const handleRoleToggle = (roleId) => {
    setSelectedRoles((current) => (
      current.includes(roleId)
        ? current.filter((role) => role !== roleId)
        : [...current, roleId]
    ))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await onSubmit(user._id || user.id, selectedRoles)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gray-100 p-3 text-gray-900">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Manage User Access</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Customer access is automatic. Select only the additional control roles for this account.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-2xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="space-y-6 px-8 py-7">
          <div className="rounded-3xl border border-gray-100 bg-gray-50 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Editing Account</p>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Role changes update panel access immediately.</p>
              <p className="mt-1 text-sm text-amber-800">
                Remove every elevated role to leave the account as a normal customer-only user.
              </p>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Elevated Roles</h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {selectedRoles.length} selected
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {MANAGED_ROLE_OPTIONS.map((role) => {
                const selected = selectedRoles.includes(role.id)
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleToggle(role.id)}
                    className={`rounded-3xl border px-5 py-5 text-left transition ${selected ? role.cardClass : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold">{role.name}</p>
                        <p className={`mt-2 text-sm ${selected ? 'text-gray-100' : 'text-gray-500'}`}>{role.description}</p>
                      </div>
                      <div className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-white/40 bg-white/15' : 'border-gray-300 bg-white'}`}>
                        {selected && <Check className="h-4 w-4" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-semibold text-gray-900">Effective access</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {displayRoles.map((roleId) => {
                const role = getRoleMeta(roleId)
                return (
                  <span key={roleId} className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${role.badgeClass}`}>
                    {role.name}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-8 py-5">
          <button
            onClick={onClose}
            className="rounded-2xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-2xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Update Roles'}
          </button>
        </div>
      </div>
    </div>
  )
}
