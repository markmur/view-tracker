module.exports = {
  transform: {
    '\\.js$': 'babel-jest',
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testMatch: ['**/?(*.)spec.js'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  roots: ['src/'],
  testURL: 'http://localhost/',
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90,
    },
  },
}
