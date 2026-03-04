/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // find any *.test.ts file anywhere
  testMatch: ["**/?(*.)+(test).ts"],

  clearMocks: true,

  // ignore compiled files
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  moduleFileExtensions: ["ts", "js", "json"],

  // database tests need longer timeout
  testTimeout: 30000
};