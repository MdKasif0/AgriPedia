'use client';
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface CollapsibleInfoSectionProps {
  title: string;
  icon?: React.ReactNode;
  items: string[];
  baseBgColor?: string;
  borderColor?: string;
  textColor?: string;
  itemTextColor?: string;
  className?: string;
  defaultOpen?: boolean;
}

const CollapsibleInfoSection: React.FC<CollapsibleInfoSectionProps> = ({
  title,
  icon,
  items,
  baseBgColor = 'bg-gray-100 dark:bg-gray-800',
  borderColor = 'border-gray-300 dark:border-gray-600',
  textColor = 'text-gray-800 dark:text-gray-100',
  itemTextColor,
  className = '',
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!items || items.length === 0) {
    return null;
  }

  // A more robust way to derive itemTextColor if not provided
  const effectiveItemTextColor = itemTextColor ||
    (textColor.includes('gray')
      ? 'text-gray-700 dark:text-gray-300 opacity-90'
      : textColor.replace(/(-[^-]+)$/, m => String(parseInt(m.replace('-',''),10) - 100 < 100 ? '-500' : `-${Math.max(100, parseInt(m.replace('-',''),10) - 200)}` ) + ' dark:opacity-80'
    );


  return (
    <div className={`mt-3 rounded-lg border ${baseBgColor} ${borderColor} ${className} overflow-hidden shadow-sm`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center p-3 font-semibold text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 dark:focus-visible:ring-offset-background ${isOpen ? 'border-b ' + borderColor : ''} ${textColor}`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          {icon && <span className="h-5 w-5 mr-2 flex items-center justify-center shrink-0">{icon}</span>}
          {title} ({items.length})
        </div>
        {isOpen ? <ChevronUpIcon className="h-5 w-5 shrink-0" /> : <ChevronDownIcon className="h-5 w-5 shrink-0" />}
      </button>
      {isOpen && (
        <div className="p-3 bg-white dark:bg-background/50">
          <ul className={`list-disc list-inside pl-1 space-y-1 text-sm ${effectiveItemTextColor}`}>
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CollapsibleInfoSection;
