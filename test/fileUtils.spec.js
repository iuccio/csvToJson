'use strict';

const fs = require('fs');
const path = require('path');
const fileUtils = require('../src/util/fileUtils');

describe('FileUtils', () => {
    const testDir = path.join(__dirname, 'temp');
    const testFile = path.join(testDir, 'test.txt');
    const testContent = 'Hello, World!';
    const jsonContent = JSON.stringify({ hello: 'world' });

    beforeAll(() => {
        // Create test directory if it doesn't exist
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir);
        }
    });

    afterAll(() => {
        // Cleanup test directory
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    beforeEach(() => {
        // Create a test file before each test
        fs.writeFileSync(testFile, testContent);
    });

    afterEach(() => {
        // Clean up test files after each test
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
    });

    describe('Synchronous Operations', () => {
        describe('readFile', () => {
            it('should read file content synchronously', () => {
                const content = fileUtils.readFile(testFile);
                expect(content).toBe(testContent);
            });

            it('should read file with specified encoding', () => {
                const content = fileUtils.readFile(testFile, 'utf8');
                expect(content).toBe(testContent);
            });

            it('should throw error for non-existent file', () => {
                expect(() => {
                    fileUtils.readFile('nonexistent.txt');
                }).toThrow();
            });
        });

        describe('writeFile', () => {
            const outputFile = path.join(testDir, 'output.json');

            afterEach(() => {
                if (fs.existsSync(outputFile)) {
                    fs.unlinkSync(outputFile);
                }
            });

            it('should write JSON content to file', (done) => {
                fileUtils.writeFile(jsonContent, outputFile);
                
                // Since writeFile is async but doesn't return a promise,
                // we need to wait a bit before checking
                setTimeout(() => {
                    expect(fs.existsSync(outputFile)).toBe(true);
                    const content = fs.readFileSync(outputFile, 'utf8');
                    expect(content).toBe(jsonContent);
                    done();
                }, 100);
            });
        });
    });

    describe('Asynchronous Operations', () => {
        describe('readFileAsync', () => {
            it('should read file content asynchronously', async () => {
                const content = await fileUtils.readFileAsync(testFile);
                expect(content).toBe(testContent);
            });

            it('should read file with specified encoding', async () => {
                const content = await fileUtils.readFileAsync(testFile, 'utf8');
                expect(content).toBe(testContent);
            });

            it('should reject for non-existent file', async () => {
                await expect(fileUtils.readFileAsync('nonexistent.txt'))
                    .rejects.toThrow();
            });

            it('should handle large files efficiently', async () => {
                const largeContent = 'x'.repeat(1024 * 1024); // 1MB of data
                const largeFile = path.join(testDir, 'large.txt');
                fs.writeFileSync(largeFile, largeContent);

                try {
                    const content = await fileUtils.readFileAsync(largeFile);
                    expect(content.length).toBe(largeContent.length);
                } finally {
                    fs.unlinkSync(largeFile);
                }
            });
        });

        describe('writeFileAsync', () => {
            const outputFile = path.join(testDir, 'output-async.json');

            afterEach(() => {
                if (fs.existsSync(outputFile)) {
                    fs.unlinkSync(outputFile);
                }
            });

            it('should write JSON content to file asynchronously', async () => {
                await fileUtils.writeFileAsync(jsonContent, outputFile);
                expect(fs.existsSync(outputFile)).toBe(true);
                const content = fs.readFileSync(outputFile, 'utf8');
                expect(content).toBe(jsonContent);
            });

            it('should reject on invalid file path', async () => {
                const invalidPath = path.join(testDir, 'nonexistent', 'file.json');
                await expect(fileUtils.writeFileAsync(jsonContent, invalidPath))
                    .rejects.toThrow();
            });

            it('should handle large content efficiently', async () => {
                const largeJson = JSON.stringify({ data: 'x'.repeat(1024 * 1024) });
                await fileUtils.writeFileAsync(largeJson, outputFile);
                const content = fs.readFileSync(outputFile, 'utf8');
                expect(content).toBe(largeJson);
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty files', async () => {
                const emptyFile = path.join(testDir, 'empty.txt');
                fs.writeFileSync(emptyFile, '');
                
                try {
                    const content = await fileUtils.readFileAsync(emptyFile);
                    expect(content).toBe('');
                } finally {
                    fs.unlinkSync(emptyFile);
                }
            });

            it('should handle special characters in content', async () => {
                const specialChars = '¥€£¢©®™πøΩ∆∑∂ƒ∫√µ≤≥÷';
                const specialFile = path.join(testDir, 'special.txt');
                
                await fileUtils.writeFileAsync(specialChars, specialFile);
                const content = await fileUtils.readFileAsync(specialFile);
                expect(content).toBe(specialChars);
            });

            it('should handle files with only whitespace', async () => {
                const whitespaceFile = path.join(testDir, 'whitespace.txt');
                const whitespaceContent = '   \n\t   \r\n  ';
                
                await fileUtils.writeFileAsync(whitespaceContent, whitespaceFile);
                const content = await fileUtils.readFileAsync(whitespaceFile);
                expect(content).toBe(whitespaceContent);
            });

            it('should handle null bytes in content', async () => {
                const nullBytesFile = path.join(testDir, 'nullbytes.txt');
                const contentWithNull = 'Hello\0World\0!';
                
                await fileUtils.writeFileAsync(contentWithNull, nullBytesFile);
                const content = await fileUtils.readFileAsync(nullBytesFile);
                expect(content).toBe(contentWithNull);
            });
        });

        describe('Error Handling', () => {
            it('should handle file lock situations', async () => {
                const lockedFile = path.join(testDir, 'locked.txt');
                let fileHandle;
                let writeHandle;

                try {
                    // Create file first
                    await fs.promises.writeFile(lockedFile, 'initial content');
                    
                    // Open file with exclusive lock
                    fileHandle = await fs.promises.open(lockedFile, 'r');
                    writeHandle = await fs.promises.open(lockedFile, 'w');
                    
                    // Try to write while file is locked (should fail on Windows)
                    // On Unix-like systems, this might not fail due to different file locking semantics
                    const writePromise = fileUtils.writeFileAsync('test', lockedFile);
                    
                    // Close the file immediately to avoid hanging
                    await fileHandle.close();
                    await writeHandle.close();
                    
                    await writePromise; // Should succeed after file is closed
                } catch (error) {
                    // Both Windows and Unix behaviors are acceptable
                    expect(error.code).toMatch(/^(EBUSY|EACCES|EPERM)?$/);
                } finally {
                    if (fileHandle && !fileHandle.closed) await fileHandle.close();
                    if (writeHandle && !writeHandle.closed) await writeHandle.close();
                }
            });

            it('should handle permission errors', async () => {
                const restrictedFile = path.join(testDir, 'restricted.txt');
                
                // Create file with restricted permissions
                fs.writeFileSync(restrictedFile, 'test');
                fs.chmodSync(restrictedFile, 0o000);

                await expect(fileUtils.readFileAsync(restrictedFile))
                    .rejects.toThrow();

                // Restore permissions for cleanup
                fs.chmodSync(restrictedFile, 0o666);
            });

            it('should handle directory paths as file paths', async () => {
                await expect(fileUtils.readFileAsync(testDir))
                    .rejects.toThrow();
                
                await expect(fileUtils.writeFileAsync('test', testDir))
                    .rejects.toThrow();
            });
        });

        describe('Performance Tests', () => {
            it('should handle very large files efficiently', async () => {
                const largeFile = path.join(testDir, 'verylarge.txt');
                const size = 10 * 1024 * 1024; // 10MB
                const largeContent = Buffer.alloc(size, 'x').toString();

                const startWrite = Date.now();
                await fileUtils.writeFileAsync(largeContent, largeFile);
                const writeTime = Date.now() - startWrite;

                const startRead = Date.now();
                const content = await fileUtils.readFileAsync(largeFile);
                const readTime = Date.now() - startRead;

                expect(content.length).toBe(size);
                
                // Performance assertions (adjust thresholds as needed)
                expect(writeTime).toBeLessThan(1000); // Should write 10MB in less than 1s
                expect(readTime).toBeLessThan(1000); // Should read 10MB in less than 1s
            });

            it('should handle multiple concurrent operations', async () => {
                const operations = [];
                const numOperations = 10;

                // Create multiple concurrent read/write operations
                for (let i = 0; i < numOperations; i++) {
                    const file = path.join(testDir, `concurrent${i}.txt`);
                    operations.push(fileUtils.writeFileAsync(`content${i}`, file));
                }

                await expect(Promise.all(operations)).resolves.not.toThrow();
            });
        });

        describe('Encoding Tests', () => {
            const encodings = ['utf8', 'ascii', 'base64', 'hex'];
            
            encodings.forEach(encoding => {
                it(`should handle ${encoding} encoding`, async () => {
                    const encodingFile = path.join(testDir, `${encoding}.txt`);
                    const testContent = 'Hello World 123 !@#';

                    // Write content in UTF-8
                    await fileUtils.writeFileAsync(testContent, encodingFile);
                    
                    // Read with specific encoding
                    const content = await fileUtils.readFileAsync(encodingFile, encoding);
                    
                    // Convert back to UTF-8 for comparison
                    const buffer = Buffer.from(content, encoding);
                    expect(buffer.toString()).toBe(testContent);
                });
            });

            it('should handle UTF-16LE encoding specifically', async () => {
                const encodingFile = path.join(testDir, 'utf16le.txt');
                const testContent = 'Hello World 123';
                
                // Write content as UTF-16LE
                const buffer = Buffer.from(testContent, 'utf16le');
                await fs.promises.writeFile(encodingFile, buffer);
                
                // Read with UTF-16LE encoding
                const content = await fileUtils.readFileAsync(encodingFile, 'utf16le');
                expect(content).toBe(testContent);
            });

            it('should handle BOM in UTF-8 files', async () => {
                const bomFile = path.join(testDir, 'bom.txt');
                const testContent = 'Hello World';
                const contentWithBOM = Buffer.concat([
                    Buffer.from([0xEF, 0xBB, 0xBF]), // UTF-8 BOM
                    Buffer.from(testContent)
                ]);

                await fs.promises.writeFile(bomFile, contentWithBOM);
                const content = await fileUtils.readFileAsync(bomFile, 'utf8');
                // Node.js automatically strips the BOM when reading UTF-8
                expect(content.replace(/^\uFEFF/, '')).toBe(testContent);
            });
        });
    });
});