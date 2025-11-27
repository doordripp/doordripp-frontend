import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/Input'

export default function Searchbar({ 
  placeholder = 'Search for products...', 
  className = '',
  onSearch 
}) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch && query.trim()) {
      onSearch(query)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400 z-10" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-10 pr-4 py-3 bg-gray-100 border-0 focus-visible:ring-0 focus-visible:border-0 transition-all duration-200 rounded-full text-gray-600 placeholder:text-gray-400 h-11 w-full"
      />
    </form>
  )
}

