module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
      'ts-jest': {
        tsConfig: {
          target: 'ES2019'
        },
        //babelConfig: '.babelrc',
      }
    },
    roots: [
      "<rootDir>/src"
    ],
    testMatch: [
      "**/__tests__/**/*.+(ts|tsx|js)",
      "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    transform: {
      "^.+\\.vue$": "vue-jest",
      "^.+\\js$": "babel-jest",
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
    globals: {
      "window": {}
    },
    resetMocks: false,
    setupFiles: ["jest-localstorage-mock"]
    //setupFilesAfterEnv: ['./src/storage-mock.js'],
  };