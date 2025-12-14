import { forwardRef } from 'react'
import { cn } from '../../utils/utils'

const Input = forwardRef(function Input(
  { className, type = 'text', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 text-sm',
        'placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/80',
        'disabled:cursor-not-allowed disabled:opacity-50 input-soft'
      , className)}
      {...props}
    />
  )
})

export { Input }
export default Input
