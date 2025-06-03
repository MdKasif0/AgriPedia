const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(lucide-react|@radix-ui|@floating-ui|@radix-ui/react-icons|@radix-ui/react-primitives|@radix-ui/react-slot|@radix-ui/react-dialog|@radix-ui/react-popover|@radix-ui/react-select|@radix-ui/react-tabs|@radix-ui/react-toast|@radix-ui/react-tooltip|@radix-ui/react-accordion|@radix-ui/react-alert-dialog|@radix-ui/react-aspect-ratio|@radix-ui/react-avatar|@radix-ui/react-checkbox|@radix-ui/react-collapsible|@radix-ui/react-context-menu|@radix-ui/react-dropdown-menu|@radix-ui/react-hover-card|@radix-ui/react-label|@radix-ui/react-menubar|@radix-ui/react-navigation-menu|@radix-ui/react-progress|@radix-ui/react-radio-group|@radix-ui/react-scroll-area|@radix-ui/react-separator|@radix-ui/react-slider|@radix-ui/react-switch|@radix-ui/react-toggle|@radix-ui/react-toggle-group|@radix-ui/react-toolbar|@radix-ui/react-utils|@radix-ui/react-visually-hidden|@radix-ui/react-arrow|@radix-ui/react-dismissable-layer|@radix-ui/react-focus-guards|@radix-ui/react-focus-scope|@radix-ui/react-id|@radix-ui/react-live-region|@radix-ui/react-portal|@radix-ui/react-primitive|@radix-ui/react-roving-focus|@radix-ui/react-use-controllable-state|@radix-ui/react-use-callback-ref|@radix-ui/react-use-escape-keydown|@radix-ui/react-use-event-listener|@radix-ui/react-use-focus-guards|@radix-ui/react-use-focus-scope|@radix-ui/react-use-id|@radix-ui/react-use-live-region|@radix-ui/react-use-previous|@radix-ui/react-use-rect|@radix-ui/react-use-size|@radix-ui/react-use-state-machine|@radix-ui/react-use-trigger|@radix-ui/react-use-viewport-size|@radix-ui/react-use-callback-ref|@radix-ui/react-use-controllable-state|@radix-ui/react-use-event-listener|@radix-ui/react-use-focus-guards|@radix-ui/react-use-focus-scope|@radix-ui/react-use-id|@radix-ui/react-use-live-region|@radix-ui/react-use-previous|@radix-ui/react-use-rect|@radix-ui/react-use-size|@radix-ui/react-use-state-machine|@radix-ui/react-use-trigger|@radix-ui/react-use-viewport-size)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig); 