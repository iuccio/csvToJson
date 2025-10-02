'use strict'

if (process.versions.node.split('.')[0] >= 20) {
    module.exports = require('node:test');
    return
}

// Simple api-compatible to nodes own testrunner as fallback

const assert = require('node:assert');

const hookStack = [];

/**
 * @param {string} name 
 * @param {() => void} fn 
 */
function describe(name, fn) {
    console.group(name);

    // Push new hook context for this describe block
    hookStack.push({
        beforeEachHooks: [],
        afterEachHooks: []
    });

    fn();

    // Pop hook context when exiting describe block
    hookStack.pop();

    console.groupEnd(name);
}

/** @param {() => void} fn */
function beforeEach(fn) {
    if (hookStack.length === 0) {
        throw new Error('beforeEach must be called inside a describe block');
    }
    const currentContext = hookStack[hookStack.length - 1];
    currentContext.beforeEachHooks.push(fn);
}

/** @param {() => void} fn */
function afterEach(fn) {
    if (hookStack.length === 0) {
        throw new Error('afterEach must be called inside a describe block');
    }
    const currentContext = hookStack[hookStack.length - 1];
    currentContext.afterEachHooks.push(fn);
}

/** 
 * @typedef {object} TextContext
 * @property {object} assert
 * @property {(actual: unknown, expected: any, message?: string) => void} assert.strictEqual
 * @property {(actual: unknown, expected: any, message?: string) => void} assert.notStrictEqual
 * @property {(actual: unknown, expected: any, message?: string) => void} assert.deepStrictEqual
 * @property {(value: any, message?: string) => void} assert.ok
 * @property {(actual: unknown, expected: any, message?: string) => void} assert.equal
 * @property {(actual: unknown, expected: any, message?: string) => void} assert.notEqual
 * @property {(block: (...args: any[]) => any, expectedError: any, message?: string) => void} assert.throws
 * @property {(block: (...args: any[]) => any, message?: string) => void} assert.doesNotThrow
 * @property {(message?: string | Error) => never} assert.fail
 * @property {(value: string, regExp: RegExp, message?: string) => void} assert.match
 * @property {(value: string, regExp: RegExp, message?: string) => void} assert.doesNotMatch
 * @property {(value: unknown) => asserts value is (null|undefined)} assert.ifError
 * @property {(block: () => Promise<unknown>, error: any, message?: string) => void} assert.rejects
 * @property {(block: Promise<unknown>, message?: string) => void} assert.doesNotReject
 */

/** @returns {TextContext} */
function testContext() {
    return {
        assert: {
            strictEqual: assert.strictEqual,
            notStrictEqual: assert.notStrictEqual,
            deepStrictEqual: assert.deepStrictEqual,
            ok: assert.ok,
            equal: assert.equal,
            notEqual: assert.notEqual,
            throws: assert.throws,
            doesNotThrow: assert.doesNotThrow,
            fail: assert.fail,
            match: assert.match,
            doesNotMatch: assert.doesNotMatch,
            ifError: assert.ifError,
            rejects: assert.rejects,
            doesNotReject: assert.doesNotReject,
        }
    }
}

/**
 * @param {string} msg 
 * @param {(t: TextContext) => (void)} fn 
 */
function it(msg, fn) {
    try {
        // Run all beforeEach hooks from all parent describes
        for (const context of hookStack) {
            for (const hook of context.beforeEachHooks) {
                hook();
            }
        }

        // Run the test
        fn(testContext());

        // Run all afterEach hooks from all parent describes (in reverse order)
        for (let i = hookStack.length - 1; i >= 0; i--) {
            for (const hook of hookStack[i].afterEachHooks) {
                hook();
            }
        }

        console.log('  \x1b[32m\u2713\x1b[0m', msg);
    } catch (err) {
        // Still run afterEach hooks even if test fails
        try {
            for (let i = hookStack.length - 1; i >= 0; i--) {
                for (const hook of hookStack[i].afterEachHooks) {
                    hook();
                }
            }
        } catch (cleanupErr) {
            console.error('Error in afterEach hook:', cleanupErr);
        }

        console.log('  \x1b[31m\u2717\x1b[0m', msg);
        console.error(err);
    }
}

module.exports = {
    describe,
    it,
    beforeEach,
    afterEach
};
