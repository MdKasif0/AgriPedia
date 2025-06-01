// __mocks__/lucide-react.js
import React from 'react';

const createLucideIcon = (iconName) => {
  const MockIcon = ({ size, color, ...props }) => (
    <svg data-lucide={iconName} width={size || 24} height={size || 24} fill="none" stroke={color || 'currentColor'} {...props}>
      {/* Basic representation, or just an empty svg for simplicity */}
      <title>{iconName}</title>
    </svg>
  );
  MockIcon.displayName = iconName;
  return MockIcon;
};

// Mock all icons that are used in the components.
// It's often easier to mock them as they are encountered or use a Proxy for a generic mock.
// For now, let's create a generic proxy to mock any icon.
const LucideIcons = new Proxy({}, {
  get: (target, prop) => {
    if (prop === '__esModule') {
      return true;
    }
    // Return a simple component for any icon requested
    return createLucideIcon(String(prop));
  }
});

module.exports = LucideIcons;
