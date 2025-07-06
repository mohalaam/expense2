import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <input
        id={id}
        className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 
                   focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                   dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm 
                   ${error ? 'border-red-500 dark:border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <textarea
        id={id}
        className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200
                   focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                   dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm 
                   ${error ? 'border-red-500 dark:border-red-400' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};