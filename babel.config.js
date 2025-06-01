module.exports = {
  presets: [
    '@babel/preset-env', // For compiling modern JavaScript down to ES5
    ['@babel/preset-react', { runtime: 'automatic' }], // For JSX and React features
    '@babel/preset-typescript', // For TypeScript
  ],
};
