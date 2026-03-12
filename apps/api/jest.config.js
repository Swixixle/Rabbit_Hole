module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@rabbit-hole/contracts$': '<rootDir>/../../packages/contracts/src/index.ts',
  },
};
