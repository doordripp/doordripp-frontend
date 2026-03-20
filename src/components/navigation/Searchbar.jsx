import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'

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
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-5 pr-12 py-3 bg-gray-100 border-0 focus-visible:ring-0 focus-visible:border-0 transition-all duration-200 rounded-full text-gray-600 placeholder:text-gray-400 h-11 w-full"
      />
      <button
        type="submit"
        aria-label="Submit Search"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors z-10"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  )
}

