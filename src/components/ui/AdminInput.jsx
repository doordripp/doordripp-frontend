import React from 'react';

/**
 * AdminInput - A styled input with a floating label.
 * The label starts in the middle and moves to the border on focus or when content is present.
 */
export default function AdminInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = ' ', // Required for peer-placeholder-shown to work
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="peer block w-full rounded-lg border border-gray-300 bg-transparent px-3 pb-2.5 pt-4 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-0 appearance-none"
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute left-3 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text bg-white px-1 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-1 peer-focus:text-black"
      >
        {label}
      </label>
    </div>
  );
}