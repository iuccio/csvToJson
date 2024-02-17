/** @type {import('jest').Config} */
const config = {

    coverageReporters: ['clover', 'html' ,'json', 'lcov', ['text', {skipFull: true}]],
    collectCoverage: true
    
};

module.exports = config;