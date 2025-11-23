/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
    coverageReporters: ['clover', 'html' ,'json', 'lcov', ['text', {skipFull: true}]],
    collectCoverage: true
};

module.exports = config;