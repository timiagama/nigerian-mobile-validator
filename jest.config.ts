import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.spec.ts"], // Only match test files

    // Add coverage settings
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["lcov", "text", "html"],
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
        "!src/**/*.spec.ts",
        "!src/**/*.test.ts",
        "!src/**/index.ts" // Exclude barrel files if needed
    ],
};

export default config;
