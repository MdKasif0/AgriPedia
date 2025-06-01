module.exports = {
  // preset: 'ts-jest', // Removing preset to rely solely on explicit transform
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', { // Let ts-jest handle js/jsx as well, assuming allowJs in tsconfig
      tsconfig: 'tsconfig.json',
      jsx: 'react-jsx',
      babelConfig: false,
    }],
  },
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/context/(.*)$': '<rootDir>/src/context/$1',
    // Mock CSS Modules (if you use them, though current setup uses Tailwind)
    '\\.module\\.css$': 'identity-obj-proxy',
    // Mock static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};
