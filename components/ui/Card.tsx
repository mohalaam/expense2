import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '', bodyClassName = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg dark:shadow-2xl rounded-xl p-6 ${className}`}>
      {title && <h3 className={`text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 ${titleClassName}`}>{title}</h3>}
      <div className={`text-gray-700 dark:text-gray-300 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};