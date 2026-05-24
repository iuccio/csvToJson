"use strict";

/**
 * CSV to JSON Demo Application
 * Interactive web interface for converting CSV data to JSON
 */

// Constants
const CONSTANTS = {
    MAX_ROWS_DISPLAY: 2000,
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
        if (element) {
            element.classList.remove(CONSTANTS.CLASSES.HIDDEN);
            try {
                element.style.display = '';
            } catch (e) {
                // ignore
            }
        }
    }

    hideElement(element) {
        if (element) {
            element.classList.add(CONSTANTS.CLASSES.HIDDEN);
            try {
                element.style.display = 'none';
            } catch (e) {
                // ignore
            }
        }
    }

    setElementText(element, text) {
        if (element) element.textContent = text;
    }

    setElementHTML(element, html) {
        if (element) element.innerHTML = html;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

        // Toggle output container min-height based on active tab
        if (tabName === 'file') {
            document.body.classList.add('file-tab-active');
        } else {
            document.body.classList.remove('file-tab-active');
        }

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
            this.setElementHTML(fileInfo, `<b>Selected file</b>: ${this.escapeHtml(file.name)} (${size} MB)`);
            // Ensure the stats container is visible and show file info inside it
            const statsContainer = this.getElement('stats-output-container');
            if (statsContainer) this.showElement(statsContainer);
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
            <div class="spinner-container rounded-3xl bg-white/90 p-6 border border-outline-variant/10 flex items-center gap-4">
                <div class="spinner" aria-hidden="true"></div>
                <div>
                    <p class="text-sm font-semibold text-on-surface">Parsing file…</p>
                    <p class="text-sm text-secondary">Please wait while your CSV data is processed.</p>
                </div>
            </div>
        `;
        output.insertBefore(progressDiv, output.firstChild);
    }

    updateProgress(percent) {
        // Spinner-only loading state; progress percent is not displayed.
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
            // keep STATS_OUTPUT so file-info remains visible during processing
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
        const statsContainer = this.getElement('stats-output-container');
        if (statsContainer) {
            this.hideElement(statsContainer);
        }
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
        const ignoreColumnIndexes = document.getElementById('ignore-column-indexes').value;

        this.csvToJson.formatValueByType(formatValues);
        this.csvToJson.supportQuotedField(quotedFields);
        this.csvToJson.fieldDelimiter(delimiter);
        this.csvToJson.indexHeader(headerIndex);
        this.csvToJson.ignoreColumnIndexes(this.parseIgnoreColumnIndexes(ignoreColumnIndexes));

        this.updateStreamingOptions();
    }

    parseIgnoreColumnIndexes(value) {
        if (!value || !value.trim()) {
            return [];
        }

        return value.split(',')
            .map(item => item.trim())
            .filter(item => item !== '')
            .map(item => parseInt(item, 10))
            .filter(index => Number.isInteger(index) && index >= 0);
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
            this.processFile(file);
        }
    }

    processFile(file) {
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
                html += `<th>${this.uiManager.escapeHtml(key)}</th>`;
            });
            html += '</tr></thead>';
        }

        // Body
        html += '<tbody>';
        displayData.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(value => {
                html += `<td>${this.uiManager.escapeHtml(String(value))}</td>`;
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
                `<p><b>Showing first ${CONSTANTS.MAX_ROWS_DISPLAY} rows only. Full data is available in JSON View for files containing less than 2,000 lines. For bigger files click the Download JSON button.</b></p>`
            );
        } else {
            this.uiManager.setElementHTML(tableTitle, '');
        }
    }

    displayStats(data) {
        const statsOutput = this.uiManager.getElement(CONSTANTS.ELEMENTS.STATS_OUTPUT);
        const rowCount = data ? data.length : 0;
        const colCount = data && data.length > 0 ? Object.keys(data[0]).length : 0;

        // Preserve existing file-info (if any) inside the stats output
        const fileInfoEl = statsOutput ? statsOutput.querySelector('#file-info') : null;
        const fileInfoHTML = fileInfoEl ? fileInfoEl.outerHTML : '';

        this.uiManager.setElementHTML(statsOutput,
            fileInfoHTML + `
            <div><strong>Rows:</strong> ${rowCount}</div>
            <div><strong>Columns:</strong> ${colCount}</div>
        `
        );

        // Ensure the stats container wrapper is visible
        const statsContainer = this.uiManager.getElement('stats-output-container');
        if (statsContainer) {
            this.uiManager.showElement(statsContainer);
        }

        this.updateJSONTabAvailability(rowCount);
    }

    updateJSONTabAvailability(rowCount) {
        const jsonTab = this.uiManager.getElement(CONSTANTS.ELEMENTS.OUTPUT_TAB_JSON);
        if (rowCount > CONSTANTS.MAX_ROWS_DISPLAY) {
            this.uiManager.setDisabled(jsonTab, true);
            jsonTab.title = "JSON preview is only available for files with fewer than 2,000 lines. Click the Download JSON button to view the result in JSON format.";
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

        // Make sure the stats container is visible when adding processing time
        const statsContainer = this.uiManager.getElement('stats-output-container');
        if (statsContainer) {
            this.uiManager.showElement(statsContainer);
        }
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
        ['format-values', 'quoted-fields', 'delimiter', 'header-index', 'ignore-column-indexes', 'use-streaming'].forEach(id => {
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
        const csvFileInput = this.uiManager.getElement(CONSTANTS.ELEMENTS.CSV_FILE);
        const dropZone = document.getElementById('drop-zone');

        csvFileInput.addEventListener('change', (event) => {
            this.uiManager.clearOutput();
            this.configManager.handleFileSelect(event);
            this.uiManager.updateFileInfo(event.target.files[0]);
        });

        // Drag and drop handlers
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const file = files[0];
                    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                        csvFileInput.files = files;
                        this.uiManager.clearOutput();
                        this.configManager.handleFileSelect({ target: { files: files } });
                        this.uiManager.updateFileInfo(file);
                    } else {
                        alert('Please drop a CSV file.');
                    }
                }
            });
        }

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

        this.configManager.updateOptions();
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
