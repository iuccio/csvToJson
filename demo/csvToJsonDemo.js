"use strict";

/**
 * CSV to JSON Demo Application
 * Interactive web interface for converting CSV data to JSON
 */

// Constants
const CONSTANTS = {
    MAX_ROWS_DISPLAY: 1000,
    LARGE_FILE_THRESHOLD: 1000000,
    DEFAULT_CHUNK_SIZE: 1000,
    PROGRESS_UPDATE_INTERVAL: 1500,

    // DOM IDs
    ELEMENTS: {
        CSV_INPUT: 'csv-input',
        CSV_FILE: 'csv-file',
        FILE_INFO: 'file-info',
        CONVERT_BTN: 'convert-btn',
        CLEAR_BTN: 'clear-btn',
        OUTPUT: 'output',
        JSON_OUTPUT: 'json-output',
        TABLE_OUTPUT: 'table-output',
        STATS_OUTPUT: 'stats-output',
        ERROR_OUTPUT: 'error-output',
        DOWNLOAD_BTN: 'download-json-btn',
        PROGRESS_FILL: 'progress-fill',
        OUTPUT_TAB_JSON: 'output-tab-json',
        TABLE_TITLE: 'table-title'
    },

    // CSS Classes
    CLASSES: {
        ACTIVE: 'active',
        HIDDEN: 'hidden',
        DOWNLOAD_BTN: 'download-btn',
        DOWNLOAD_BTN_HIDDEN: 'download-btn-hidden'
    },

    // Sample data
    SAMPLES: {
        basic: `name,age,city
John,25,New York
Jane,30,London
Bob,35,Paris`,

        quoted: `"name","age","description"
"John Doe","25","Software Engineer"
"Jane Smith","30","Product Manager"`,

        numbers: `product,price,quantity
Widget A,19.99,100
Widget B,29.99,50
Widget C,9.99,200`,

        dates: `event,date,attendees
Conference,2024-01-15,150
Workshop,2024-02-20,75
Seminar,2024-03-10,200`
    }
};

/**
 * UI Manager - Handles all DOM operations and user interface updates
 */
class UIManager {
    constructor() {
        this.elements = this.cacheElements();
    }

    cacheElements() {
        const elements = {};
        Object.values(CONSTANTS.ELEMENTS).forEach(id => {
            elements[id] = document.getElementById(id);
        });
        return elements;
    }

    getElement(id) {
        return this.elements[id] || document.getElementById(id);
    }

    showElement(element) {
        if (element) element.classList.remove(CONSTANTS.CLASSES.HIDDEN);
    }

    hideElement(element) {
        if (element) element.classList.add(CONSTANTS.CLASSES.HIDDEN);
    }

    setElementText(element, text) {
        if (element) element.textContent = text;
    }

    setElementHTML(element, html) {
        if (element) element.innerHTML = html;
    }

    addClass(element, className) {
        if (element) element.classList.add(className);
    }

    removeClass(element, className) {
        if (element) element.classList.remove(className);
    }

    toggleClass(element, className, condition) {
        if (element) {
            element.classList.toggle(className, condition);
        }
    }

    setDisabled(element, disabled) {
        if (element) element.disabled = disabled;
    }

    setButtonText(button, text) {
        if (button) button.textContent = text;
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(content => {
            this.removeClass(content, CONSTANTS.CLASSES.ACTIVE);
        });
        document.querySelectorAll('.tab').forEach(tab => {
            this.removeClass(tab, CONSTANTS.CLASSES.ACTIVE);
        });

        // Show selected tab
        const tabContent = this.getElement(tabName + '-tab');
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);

        this.addClass(tabContent, CONSTANTS.CLASSES.ACTIVE);
        this.addClass(tabButton, CONSTANTS.CLASSES.ACTIVE);

        // Toggle file-only options visibility
        this.toggleFileOnlyOptions();
    }

    toggleFileOnlyOptions() {
        const activeTab = document.querySelector('.tab-content.active');
        const fileOnlyOptions = document.getElementById('file-only-options');

        if (activeTab && fileOnlyOptions) {
            const isFileTab = activeTab.id === 'file-tab';
            fileOnlyOptions.style.display = isFileTab ? 'block' : 'none';
        }
    }

    showOutputTab(tabName) {
        // Hide all output tabs
        document.querySelectorAll('.output-content').forEach(content => {
            this.removeClass(content, CONSTANTS.CLASSES.ACTIVE);
        });
        document.querySelectorAll('.output-tab').forEach(tab => {
            this.removeClass(tab, CONSTANTS.CLASSES.ACTIVE);
        });

        // Show selected output tab
        const outputContent = this.getElement(tabName + '-content');
        const outputTab = document.querySelector(`[data-output="${tabName}"]`);

        this.addClass(outputContent, CONSTANTS.CLASSES.ACTIVE);
        this.addClass(outputTab, CONSTANTS.CLASSES.ACTIVE);
    }

    updateFileInfo(file) {
        const fileInfo = this.getElement(CONSTANTS.ELEMENTS.FILE_INFO);
        if (file && fileInfo) {
            const size = (file.size / 1024 / 1024).toFixed(2);
            this.setElementHTML(fileInfo, `Selected file: ${file.name} (${size} MB)`);
            this.showElement(fileInfo);
        }
    }

    clearFileInfo() {
        const fileInfo = this.getElement(CONSTANTS.ELEMENTS.FILE_INFO);
        if (fileInfo) {
            fileInfo.style.display = 'none';
        }
    }

    initProgressDisplay() {
        this.removeProgressDisplay();

        const output = this.getElement(CONSTANTS.ELEMENTS.OUTPUT);
        if (!output) return;

        const progressDiv = document.createElement('div');
        progressDiv.id = 'progress-display';
        progressDiv.innerHTML = `
            <h5>Processing large file...</h5>
            <div id="progress-bar" style="width: 100%; background: #f0f0f0; height: 20px; border-radius: 10px; margin: 10px 0;">
                <div id="${CONSTANTS.ELEMENTS.PROGRESS_FILL}" style="width: 0%; height: 100%; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border-radius: 10px; transition: width 0.5s;"></div>
            </div>
        `;
        output.insertBefore(progressDiv, output.firstChild);
    }

    updateProgress(percent) {
        const progressFill = this.getElement(CONSTANTS.ELEMENTS.PROGRESS_FILL);
        if (progressFill) {
            progressFill.style.width = percent + '%';
        }
    }

    removeProgressDisplay() {
        const progressDisplay = document.getElementById('progress-display');
        if (progressDisplay) {
            progressDisplay.remove();
        }
    }

    showDownloadButton() {
        const downloadButton = this.getElement(CONSTANTS.ELEMENTS.DOWNLOAD_BTN);
        if (downloadButton) {
            this.removeClass(downloadButton, CONSTANTS.CLASSES.HIDDEN);
            this.removeClass(downloadButton, CONSTANTS.CLASSES.DOWNLOAD_BTN_HIDDEN);
            this.addClass(downloadButton, CONSTANTS.CLASSES.DOWNLOAD_BTN);
        }
    }

    hideDownloadButton() {
        const downloadButton = this.getElement(CONSTANTS.ELEMENTS.DOWNLOAD_BTN);
        if (downloadButton) {
            this.addClass(downloadButton, CONSTANTS.CLASSES.HIDDEN);
            this.addClass(downloadButton, CONSTANTS.CLASSES.DOWNLOAD_BTN_HIDDEN);
            this.removeClass(downloadButton, CONSTANTS.CLASSES.DOWNLOAD_BTN);
        }
    }

    displayError(error) {
        const output = this.getElement(CONSTANTS.ELEMENTS.OUTPUT);
        const errorOutput = this.getElement(CONSTANTS.ELEMENTS.ERROR_OUTPUT);

        this.showElement(output);
        this.setElementText(errorOutput, `Error: ${error.message}`);
        this.showElement(errorOutput);
    }

    clearOutput() {
        this.removeProgressDisplay();

        const elements = [
            CONSTANTS.ELEMENTS.JSON_OUTPUT,
            CONSTANTS.ELEMENTS.TABLE_OUTPUT,
            CONSTANTS.ELEMENTS.STATS_OUTPUT,
            CONSTANTS.ELEMENTS.ERROR_OUTPUT
        ];

        elements.forEach(id => {
            const element = this.getElement(id);
            if (id === CONSTANTS.ELEMENTS.ERROR_OUTPUT) {
                this.hideElement(element);
            } else if (id === CONSTANTS.ELEMENTS.TABLE_OUTPUT) {
                this.setElementHTML(element, '');
            } else {
                this.setElementText(element, '');
            }
        });
    }

    clearAll() {
        this.clearOutput();
        this.hideElement(this.getElement(CONSTANTS.ELEMENTS.OUTPUT));
        this.getElement(CONSTANTS.ELEMENTS.CSV_INPUT).value = '';
        this.getElement(CONSTANTS.ELEMENTS.CSV_FILE).value = '';
        this.clearFileInfo();
        this.hideDownloadButton();
    }
}

/**
 * Configuration Manager - Handles CSV parsing options
 */
class ConfigManager {
    constructor(csvToJson) {
        this.csvToJson = csvToJson;
    }

    updateOptions() {
        const formatValues = document.getElementById('format-values').checked;
        const quotedFields = document.getElementById('quoted-fields').checked;
        const delimiter = document.getElementById('delimiter').value;
        const headerIndex = parseInt(document.getElementById('header-index').value) || 0;

        this.csvToJson.formatValueByType(formatValues);
        this.csvToJson.supportQuotedField(quotedFields);
        this.csvToJson.fieldDelimiter(delimiter);
        this.csvToJson.indexHeader(headerIndex);

        this.updateStreamingOptions();
    }

    updateStreamingOptions() {
        const useStreaming = document.getElementById('use-streaming');
        const useChunk = document.getElementById('use-chunked');

        if (useStreaming.checked) {
            useChunk.disabled = false;
        } else {
            useChunk.disabled = true;
            useChunk.checked = false;
        }
    }

    toggleChunkedOptions() {
        const useChunked = document.getElementById('use-chunked').checked;
        const chunkedOptions = document.getElementById('chunked-options');
        if (chunkedOptions) {
            chunkedOptions.style.display = useChunked ? 'block' : 'none';
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const useStreaming = document.getElementById('use-streaming');
            const useChunked = document.getElementById('use-chunked');

            if (file.size > CONSTANTS.LARGE_FILE_THRESHOLD) {
                useStreaming.checked = true;
                useStreaming.disabled = true;
                useChunked.disabled = false;
            } else {
                useStreaming.checked = false;
                useStreaming.disabled = false;
                useChunked.checked = false;
                useChunked.disabled = true;
            }

            this.updateOptions();
        }
    }
}

/**
 * Result Display Manager - Handles displaying conversion results
 */
class ResultDisplayManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }

    displayResult(result) {
        this.uiManager.showElement(this.uiManager.getElement(CONSTANTS.ELEMENTS.OUTPUT));

        this.displayJSON(result);
        this.displayTable(result);
        this.displayStats(result);
        this.uiManager.showDownloadButton();
        this.uiManager.showOutputTab('table');
    }

    displayJSON(result) {
        const jsonOutput = this.uiManager.getElement(CONSTANTS.ELEMENTS.JSON_OUTPUT);
        this.uiManager.setElementText(jsonOutput, JSON.stringify(result, null, 2));
    }

    displayTable(data) {
        const tableOutput = this.uiManager.getElement(CONSTANTS.ELEMENTS.TABLE_OUTPUT);

        if (!data || data.length === 0) {
            this.uiManager.setElementHTML(tableOutput, '<p>No data to display</p>');
            return;
        }

        const displayData = data.length > CONSTANTS.MAX_ROWS_DISPLAY
            ? data.slice(0, CONSTANTS.MAX_ROWS_DISPLAY)
            : data;

        let html = '<table><thead><tr>';

        // Header
        if (displayData.length > 0) {
            Object.keys(displayData[0]).forEach(key => {
                html += `<th>${key}</th>`;
            });
            html += '</tr></thead>';
        }

        // Body
        html += '<tbody>';
        displayData.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(value => {
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        this.uiManager.setElementHTML(tableOutput, html);
        this.displayTableTitle(data);
    }

    displayTableTitle(data) {
        const tableTitle = this.uiManager.getElement(CONSTANTS.ELEMENTS.TABLE_TITLE);
        if (data.length > CONSTANTS.MAX_ROWS_DISPLAY) {
            this.uiManager.setElementHTML(tableTitle,
                `<p><b>Showing first ${CONSTANTS.MAX_ROWS_DISPLAY} rows only. Full data is available in JSON View for files containing less than 1,000 lines. For bigger files click to the Download JSON button.</b></p>`
            );
        } else {
            this.uiManager.setElementHTML(tableTitle, '');
        }
    }

    displayStats(data) {
        const statsOutput = this.uiManager.getElement(CONSTANTS.ELEMENTS.STATS_OUTPUT);
        const rowCount = data ? data.length : 0;
        const colCount = data && data.length > 0 ? Object.keys(data[0]).length : 0;

        this.uiManager.setElementHTML(statsOutput, `
            <div><strong>Rows:</strong> ${rowCount}</div>
            <div><strong>Columns:</strong> ${colCount}</div>
        `);

        this.updateJSONTabAvailability(rowCount);
    }

    updateJSONTabAvailability(rowCount) {
        const jsonTab = this.uiManager.getElement(CONSTANTS.ELEMENTS.OUTPUT_TAB_JSON);
        if (rowCount > CONSTANTS.MAX_ROWS_DISPLAY) {
            this.uiManager.setDisabled(jsonTab, true);
            jsonTab.title = "JSON preview is only available for files with fewer than 1,000 lines. Click the Download JSON button to view the result in JSON format.";
        } else {
            this.uiManager.setDisabled(jsonTab, false);
            jsonTab.title = "";
        }
    }

    displayProcessingTime(startTime, endTime) {
        const takenTimeInMs = Math.floor(endTime - startTime);
        const takenTimeInSeconds = (takenTimeInMs / 1000).toFixed(2);
        const statsOutput = this.uiManager.getElement(CONSTANTS.ELEMENTS.STATS_OUTPUT);

        const existingHTML = statsOutput.innerHTML;
        this.uiManager.setElementHTML(statsOutput,
            existingHTML + `<div><strong>Processed:</strong> in ${takenTimeInSeconds} seconds (${takenTimeInMs} milliseconds)</div>`
        );
    }
}

/**
 * File Processor - Handles file processing operations
 */
class FileProcessor {
    constructor(csvToJson, uiManager, resultDisplayManager) {
        this.csvToJson = csvToJson;
        this.uiManager = uiManager;
        this.resultDisplayManager = resultDisplayManager;
    }

    async processTextInput(csvText) {
        if (!csvText.trim()) {
            throw new Error('Please enter CSV text');
        }
        const result = this.csvToJson.csvStringToJson(csvText);
        this.resultDisplayManager.displayResult(result);
    }

    async processFile(file, useStreaming, useChunked, chunkSize) {
        if (!file) {
            throw new Error('Please select a CSV file');
        }

        if (useChunked) {
            await this.processFileInChunks(file, chunkSize);
        } else if (useStreaming) {
            await this.processFileStreaming(file);
        } else {
            const result = await this.csvToJson.parseFile(file);
            this.resultDisplayManager.displayResult(result);
        }
    }

    async processFileStreaming(file) {
        const output = this.uiManager.getElement(CONSTANTS.ELEMENTS.OUTPUT);
        this.uiManager.showElement(output);
        this.uiManager.initProgressDisplay();

        const startTime = performance.now();
        const result = await this.csvToJson.getJsonFromFileStreamingAsync(file);
        const endTime = performance.now();

        this.resultDisplayManager.displayResult(result);
        this.resultDisplayManager.displayProcessingTime(startTime, endTime);
        this.uiManager.updateProgress(100);

        setTimeout(() => {
            this.uiManager.removeProgressDisplay();
        }, CONSTANTS.PROGRESS_UPDATE_INTERVAL);
    }

    async processFileInChunks(file, chunkSize) {
        const output = this.uiManager.getElement(CONSTANTS.ELEMENTS.OUTPUT);
        const jsonOutput = this.uiManager.getElement(CONSTANTS.ELEMENTS.JSON_OUTPUT);

        this.uiManager.showElement(output);
        this.uiManager.clearOutput();
        this.uiManager.initProgressDisplay();

        let allRows = [];
        let totalProcessed = 0;

        try {
            await this.csvToJson.getJsonFromFileStreamingAsyncWithCallback(file, {
                chunkSize: chunkSize,
                onChunk: (rows, processed, total) => {
                    allRows.push(...rows);
                    totalProcessed = processed;

                    const progressPercent = total
                        ? Math.round((processed / total) * 100)
                        : Math.min(Math.round((processed / 10000) * 100), 95);

                    this.uiManager.updateProgress(progressPercent);

                    if (allRows.length <= CONSTANTS.MAX_ROWS_DISPLAY) {
                        this.resultDisplayManager.displayTable(allRows);
                    }
                },
                onComplete: (allRowsComplete) => {
                    allRows = allRowsComplete;
                    this.uiManager.updateProgress(100);

                    this.uiManager.setElementText(jsonOutput, JSON.stringify(allRows, null, 2));
                    this.resultDisplayManager.displayStats(allRows);
                    this.resultDisplayManager.displayTable(allRows);
                    this.uiManager.showDownloadButton();
                    this.uiManager.showOutputTab('table');
                },
                onError: (error) => {
                    console.error('Chunk processing error:', error);
                    this.uiManager.displayError(error);
                    this.uiManager.removeProgressDisplay();
                }
            });
        } catch (error) {
            console.error('File processing error:', error);
            this.uiManager.displayError(error);
            this.uiManager.removeProgressDisplay();
        }
    }
}

/**
 * Sample Data Manager - Handles loading sample CSV data
 */
class SampleDataManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }

    loadSample(sampleName) {
        const csvInput = this.uiManager.getElement(CONSTANTS.ELEMENTS.CSV_INPUT);
        const sampleData = CONSTANTS.SAMPLES[sampleName];

        if (csvInput && sampleData) {
            csvInput.value = sampleData;
            this.uiManager.showTab('text');
        }
    }
}

/**
 * Download Manager - Handles JSON download functionality
 */
class DownloadManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }

    downloadJSON() {
        const jsonOutput = this.uiManager.getElement(CONSTANTS.ELEMENTS.JSON_OUTPUT);
        const data = jsonOutput ? jsonOutput.textContent : '';

        if (!data) return;

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }
}

/**
 * Main Application Controller
 */
class CsvToJsonDemo {
    constructor() {
        this.csvToJson = window.csvToJson;
        this.uiManager = new UIManager();
        this.configManager = new ConfigManager(this.csvToJson);
        this.resultDisplayManager = new ResultDisplayManager(this.uiManager);
        this.fileProcessor = new FileProcessor(this.csvToJson, this.uiManager, this.resultDisplayManager);
        this.sampleDataManager = new SampleDataManager(this.uiManager);
        this.downloadManager = new DownloadManager(this.uiManager);

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.uiManager.showTab(tab.getAttribute('data-tab'));
            });
        });

        // Output tab switching
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.uiManager.showOutputTab(tab.getAttribute('data-output'));
            });
        });

        // Convert button
        this.uiManager.getElement(CONSTANTS.ELEMENTS.CONVERT_BTN).addEventListener('click', () => {
            this.convert();
        });

        // Clear button
        this.uiManager.getElement(CONSTANTS.ELEMENTS.CLEAR_BTN).addEventListener('click', () => {
            this.clearAll();
        });

        // Options change listeners
        ['format-values', 'quoted-fields', 'delimiter', 'header-index', 'use-streaming'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.configManager.updateOptions();
            });
        });

        document.getElementById('delimiter').addEventListener('input', () => {
            this.configManager.updateOptions();
        });

        document.getElementById('header-index').addEventListener('input', () => {
            this.configManager.updateOptions();
        });

        document.getElementById('use-chunked').addEventListener('change', () => {
            this.configManager.toggleChunkedOptions();
        });

        // File input
        this.uiManager.getElement(CONSTANTS.ELEMENTS.CSV_FILE).addEventListener('change', (event) => {
            this.configManager.handleFileSelect(event);
            this.uiManager.updateFileInfo(event.target.files[0]);
        });

        // Sample data buttons
        document.querySelectorAll('.sample-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.sampleDataManager.loadSample(btn.getAttribute('data-sample'));
            });
        });

        // Download button
        this.uiManager.getElement(CONSTANTS.ELEMENTS.DOWNLOAD_BTN).addEventListener('click', () => {
            this.downloadManager.downloadJSON();
        });
    }

    async convert() {
        const convertBtn = this.uiManager.getElement(CONSTANTS.ELEMENTS.CONVERT_BTN);

        this.uiManager.clearOutput();
        this.uiManager.setDisabled(convertBtn, true);
        this.uiManager.setButtonText(convertBtn, 'Converting...');

        try {
            const activeTab = document.querySelector('.tab-content.active').id;
            const useStreaming = document.getElementById('use-streaming').checked;
            const useChunked = document.getElementById('use-chunked').checked;
            const chunkSize = parseInt(document.getElementById('chunk-size').value) || CONSTANTS.DEFAULT_CHUNK_SIZE;

            if (activeTab === 'text-tab') {
                const csvText = this.uiManager.getElement(CONSTANTS.ELEMENTS.CSV_INPUT).value;
                await this.fileProcessor.processTextInput(csvText);
            } else {
                const fileInput = this.uiManager.getElement(CONSTANTS.ELEMENTS.CSV_FILE);
                await this.fileProcessor.processFile(fileInput.files[0], useStreaming, useChunked, chunkSize);
            }
        } catch (error) {
            this.uiManager.displayError(error);
        } finally {
            this.uiManager.setDisabled(convertBtn, false);
            this.uiManager.setButtonText(convertBtn, 'Convert to JSON');

            setTimeout(() => {
                this.uiManager.removeProgressDisplay();
            }, CONSTANTS.PROGRESS_UPDATE_INTERVAL);
        }
    }

    clearAll() {
        this.uiManager.clearAll();
        this.configManager.updateOptions();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CsvToJsonDemo();
});
