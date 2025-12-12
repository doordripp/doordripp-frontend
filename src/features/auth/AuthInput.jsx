import { useState } from 'react'
import { Eye, EyeOff, Mail, Phone, User, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthInput({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  icon: Icon,
  error,
  required = false,
  disabled = false,
  name
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="space-y-2">
      <div className={`relative group ${error ? 'has-error' : ''}`}>
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
            focused ? 'text-black' : error ? 'text-red-500' : 'text-gray-400'
          }`} />
        )}
        
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full h-12 ${Icon ? 'pl-12' : 'pl-4'} ${
            type === 'password' ? 'pr-12' : 'pr-4'
          } border rounded-xl bg-white transition-all duration-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : focused
                ? 'border-black focus:border-black focus:ring-black/20'
                : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-500"></span>
          {error}
        </p>
      )}
    </div>
  )
}