import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className={className}>
      <label htmlFor={props.id} className="block text-gray-400 mb-1 text-xs">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-0 py-1.5 bg-transparent border-0 border-b-2 border-medical-500 focus:ring-0 focus:border-medical-600 text-gray-700 placeholder-gray-300 transition-colors outline-none text-sm"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}