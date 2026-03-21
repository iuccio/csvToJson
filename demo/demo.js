// Demo application for CSV to JSON converter
// This will be bundled with the library using browserify

const csvToJson = require('../src/browserApi');

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        setupEventListeners();
    });

    function setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                showTab(this.getAttribute('data-tab'));
            });
        });

        // Output tab switching
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                showOutputTab(this.getAttribute('data-output'));
            });
        });

        // Convert button
        document.getElementById('convert-btn').addEventListener('click', convert);

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', clearAll);

        // Options change listeners
        document.getElementById('format-values').addEventListener('change', updateOptions);
        document.getElementById('quoted-fields').addEventListener('change', updateOptions);
        document.getElementById('delimiter').addEventListener('input', updateOptions);
        document.getElementById('header-index').addEventListener('input', updateOptions);

        // File input change
        document.getElementById('csv-file').addEventListener('change', handleFileSelect);

        // Sample data buttons
        document.querySelectorAll('.sample-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                loadSample(this.getAttribute('data-sample'));
            });
        });
    }

    function showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName + '-tab').classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    function showOutputTab(tabName) {
        // Hide all output tabs
        document.querySelectorAll('.output-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelectorAll('.output-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected output tab
        document.getElementById(tabName + '-content').classList.add('active');
        document.querySelector(`[data-output="${tabName}"]`).classList.add('active');
    }

    function updateOptions() {
        const formatValues = document.getElementById('format-values').checked;
        const quotedFields = document.getElementById('quoted-fields').checked;
        const delimiter = document.getElementById('delimiter').value;
        const headerIndex = parseInt(document.getElementById('header-index').value) || 0;

        csvToJson.formatValueByType(formatValues);
        csvToJson.supportQuotedField(quotedFields);
        csvToJson.fieldDelimiter(delimiter);
        csvToJson.indexHeader(headerIndex);
    }

    async function convert() {
        const output = document.getElementById('output');
        const convertBtn = document.getElementById('convert-btn');

        // Clear previous output
        clearOutput();

        // Disable button during conversion
        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';

        try {
            let result;

            // Check which tab is active
            const activeTab = document.querySelector('.tab-content.active').id;
            if (activeTab === 'text-tab') {
                // Text input
                const csvText = document.getElementById('csv-input').value;
                if (!csvText.trim()) {
                    throw new Error('Please enter CSV text');
                }
                result = csvToJson.csvStringToJson(csvText);
            } else {
                // File input
                const fileInput = document.getElementById('csv-file');
                if (!fileInput.files[0]) {
                    throw new Error('Please select a CSV file');
                }
                result = await csvToJson.parseFile(fileInput.files[0]);
            }

            // Display result
            displayResult(result);

        } catch (error) {
            displayError(error);
        } finally {
            // Re-enable button
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to JSON';
        }
    }

    function displayResult(result) {
        const output = document.getElementById('output');
        const jsonOutput = document.getElementById('json-output');
        const tableOutput = document.getElementById('table-output');
        const statsOutput = document.getElementById('stats-output');

        // Show results container
        output.classList.remove('hidden');

        // JSON output
        jsonOutput.textContent = JSON.stringify(result, null, 2);

        // Table output
        displayTable(result);

        // Stats
        displayStats(result);

        // Switch to table view by default
        showOutputTab('table');
    }

    function displayTable(data) {
        const tableOutput = document.getElementById('table-output');
        if (!data || data.length === 0) {
            tableOutput.innerHTML = '<p>No data to display</p>';
            return;
        }

        let html = '<table><thead><tr>';
        // Headers
        Object.keys(data[0]).forEach(key => {
            html += `<th>${escapeHtml(key)}</th>`;
        });
        html += '</tr></thead><tbody>';

        // Rows
        data.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(value => {
                html += `<td>${escapeHtml(String(value))}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        tableOutput.innerHTML = html;
    }

    function displayStats(data) {
        const statsOutput = document.getElementById('stats-output');
        if (!data || data.length === 0) {
            statsOutput.innerHTML = '<p>No data</p>';
            return;
        }

        const numRows = data.length;
        const numCols = Object.keys(data[0]).length;
        const size = JSON.stringify(data).length;

        statsOutput.innerHTML = `
            <div><strong>Rows:</strong> ${numRows}</div>
            <div><strong>Columns:</strong> ${numCols}</div>
            <div><strong>JSON Size:</strong> ${size} characters</div>
        `;
    }

    function displayError(error) {
        const output = document.getElementById('output');
        const errorOutput = document.getElementById('error-output');

        output.classList.remove('hidden');
        errorOutput.textContent = error.message;
        errorOutput.classList.remove('hidden');
    }

    function clearOutput() {
        const output = document.getElementById('output');
        const errorOutput = document.getElementById('error-output');

        output.classList.add('hidden');
        errorOutput.classList.add('hidden');
        errorOutput.textContent = '';
    }

    function clearAll() {
        document.getElementById('csv-input').value = '';
        document.getElementById('csv-file').value = '';
        clearOutput();
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            // Show file info
            const fileInfo = document.getElementById('file-info');
            fileInfo.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
            fileInfo.classList.remove('hidden');
        }
    }

    function loadSample(sampleName) {
        const samples = {
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
        };

        document.getElementById('csv-input').value = samples[sampleName] || '';
        showTab('text');
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function downloadJSON() {
        const jsonOutput = document.getElementById('json-output');
        const data = jsonOutput.textContent;
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Make functions globally available for inline event handlers
    window.showTab = showTab;
    window.convert = convert;
    window.clearAll = clearAll;
    window.downloadJSON = downloadJSON;
})();