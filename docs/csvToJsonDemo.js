// Demo JavaScript code
csvToJson = window.csvToJson;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            showTab(this.getAttribute('data-tab'));
        });
    });

    // Output tab switching
    document.querySelectorAll('.output-tab').forEach(tab => {
        tab.addEventListener('click', function () {
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
    document.getElementById('use-streaming').addEventListener('change', updateOptions);
    document.getElementById('use-chunked').addEventListener('change', toggleChunkedOptions);


    // File input change
    document.getElementById('csv-file').addEventListener('change', handleFileSelect);

    // Ensure file-only options are hidden on initial load
    toggleFileOnlyOptions();

    // Sample data buttons
    document.querySelectorAll('.sample-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            loadSample(this.getAttribute('data-sample'));
        });
    });
});

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

    // Toggle file-only options visibility when switching tabs
    toggleFileOnlyOptions();
}

function toggleFileOnlyOptions() {
    const activeTab = document.querySelector('.tab-content.active').id;
    const fileOnlyOptions = document.getElementById('file-only-options');
    if (!fileOnlyOptions) return;

    if (activeTab === 'file-tab') {
        fileOnlyOptions.style.display = 'block';
    } else {
        fileOnlyOptions.style.display = 'none';
    }
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

    if (parseSubarray) {
        csvToJson.parseSubArray('*', ',');
    }

    if (mapRows) {
        // Add mapping function if needed
    }
}

function toggleChunkedOptions() {
    const useChunked = document.getElementById('use-chunked').checked;
    const chunkedOptions = document.getElementById('chunked-options');
    if (useChunked) {
        chunkedOptions.style.display = 'block';
    } else {
        chunkedOptions.style.display = 'none';
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const fileInfo = document.getElementById('file-info');
        const size = (file.size / 1024 / 1024).toFixed(2);
        fileInfo.innerHTML = `Selected file: ${file.name} (${size} MB)`;
        fileInfo.style.display = 'block';
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
Seminar,2024-03-10,200`,
    };

    document.getElementById('csv-input').value = samples[sampleName] || '';
    showTab('text');
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
        const useStreaming = document.getElementById('use-streaming').checked;

        if (activeTab === 'text-tab') {
            // Text input
            const csvText = document.getElementById('csv-input').value;
            if (!csvText.trim()) {
                throw new Error('Please enter CSV text');
            }
            result = csvToJson.csvStringToJson(csvText);
            displayResult(result);
        } else {
            // File input
            const fileInput = document.getElementById('csv-file');
            if (!fileInput.files[0]) {
                throw new Error('Please select a CSV file');
            }

            const useChunked = document.getElementById('use-chunked').checked;

            if (useChunked) {
                // Use chunked processing for large files
                const chunkSize = parseInt(document.getElementById('chunk-size').value) || 1000;
                await processFileInChunks(fileInput.files[0], chunkSize);
            } else if (useStreaming) {
                // Use streaming API
                result = await csvToJson.getJsonFromFileStreamingAsync(fileInput.files[0]);
                displayResult(result);
            } else {
                // Use regular file parsing
                result = await csvToJson.parseFile(fileInput.files[0]);
                displayResult(result);
            }
        }
    } catch (error) {
        displayError(error);
    } finally {
        // Re-enable button
        convertBtn.disabled = false;
        convertBtn.textContent = 'Convert to JSON';
    }
}

async function processFileInChunks(file, chunkSize) {
    const output = document.getElementById('output');
    const jsonOutput = document.getElementById('json-output');
    const tableOutput = document.getElementById('table-output');
    const statsOutput = document.getElementById('stats-output');

    // Show results container
    output.classList.remove('hidden');
    clearOutput();

    // Initialize progress tracking
    let allRows = [];
    let totalProcessed = 0;

    // Create progress display
    const progressDiv = document.createElement('div');
    progressDiv.id = 'progress-display';
    progressDiv.innerHTML = '<h4>Processing large file...</h4><div id="progress-bar" style="width: 100%; background: #f0f0f0; height: 20px; border-radius: 10px; margin: 10px 0;"><div id="progress-fill" style="width: 0%; height: 100%; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border-radius: 10px; transition: width 0.3s;"></div></div><div id="progress-text">Initializing...</div>';
    output.insertBefore(progressDiv, output.firstChild);

    try {
        await csvToJson.getJsonFromFileStreamingAsyncWithCallback(file, {
            chunkSize: chunkSize,
            onChunk: (rows, processed, total) => {
                console.log('onChunk called', rows.length, processed, total);
                // Accumulate rows
                allRows.push(...rows);
                totalProcessed = processed;

                // Update progress
                const progressPercent = total ? Math.round((processed / total) * 100) : Math.min(Math.round((processed / 10000) * 100), 95);
                document.getElementById('progress-fill').style.width = progressPercent + '%';
                document.getElementById('progress-text').textContent = `Processed ${processed} rows...`;

                // For very large files, show the first 1000 rows only
                if (allRows.length <= 1000) {
                    displayTable(allRows);
                } else if (allRows.length === 1001) {
                    displayTable(allRows);
                }
            },
            onComplete: (allRowsComplete) => {
                console.log('onComplete called', allRowsComplete.length);
                allRows = allRowsComplete;

                // Update progress to 100%
                document.getElementById('progress-fill').style.width = '100%';
                document.getElementById('progress-text').textContent = `Complete! Processed ${allRows.length} rows.`;

                // Display final results
                jsonOutput.textContent = JSON.stringify(allRows, null, 2);
                displayStats(allRows);
                displayTable(allRows);
                showOutputTab('table');

                // Remove progress after a delay
                setTimeout(() => {
                    const progressDisplay = document.getElementById('progress-display');
                    if (progressDisplay) progressDisplay.remove();
                }, 3000);
            },
            onError: (error) => {
                console.error('Error:', error);
                displayError(error);
                const progressDisplay = document.getElementById('progress-display');
                if (progressDisplay) progressDisplay.remove();
            }
        });
    } catch (error) {
        console.error('Catch error:', error);
        displayError(error);
        const progressDisplay = document.getElementById('progress-display');
        if (progressDisplay) progressDisplay.remove();
    }
}

function displayResult(result) {
    const output = document.getElementById('output');
    const jsonOutput = document.getElementById('json-output');
    const tableOutput = document.getElementById('table-output');
    const statsOutput = document.getElementById('stats-output');

    // Show results container
    output.classList.remove('hidden');

    // Display JSON
    jsonOutput.textContent = JSON.stringify(result, null, 2);

    // Display table
    displayTable(result);

    // Display stats
    displayStats(result);

    // Show table tab by default
    showOutputTab('table');
}

function displayTable(data) {
    const tableOutput = document.getElementById('table-output');
    if (!data || data.length === 0) {
        tableOutput.innerHTML = '<p>No data to display</p>';
        return;
    }

    const maxRows = 1000;
    const displayData = data.length > maxRows ? data.slice(0, maxRows) : data;
    let html = '<table>';

    // Header
    if (displayData.length > 0) {
        html += '<thead><tr>';
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

    if (data.length > maxRows) {
        html = `<p><b>Showing first ${maxRows} rows only. Full data is available in JSON view and row count is shown in stats.</h4></p>${html}`;
    }

    tableOutput.innerHTML = html;
}

function displayStats(data) {
    const statsOutput = document.getElementById('stats-output');
    const rowCount = data ? data.length : 0;
    const colCount = data && data.length > 0 ? Object.keys(data[0]).length : 0;

    statsOutput.innerHTML = `
                <div><strong>Rows:</strong> ${rowCount}</div>
                <div><strong>Columns:</strong> ${colCount}</div>
            `;

    if (rowCount > 1000) {
        document.getElementById('output-tab-json').disabled = true;
        document.getElementById('output-tab-json').title = "JSON preview is only available for files with fewer than 1,000 lines. Click the Download JSON button to view the result in JSON format.";
    } else {
        document.getElementById('output-tab-json').disabled = false;
    }
}

function displayError(error) {
    const output = document.getElementById('output');
    const errorOutput = document.getElementById('error-output');

    // Show results container
    output.classList.remove('hidden');

    // Display error
    errorOutput.textContent = `Error: ${error.message}`;
    errorOutput.classList.remove('hidden');
}

function clearOutput() {
    const output = document.getElementById('output');
    const jsonOutput = document.getElementById('json-output');
    const tableOutput = document.getElementById('table-output');
    const statsOutput = document.getElementById('stats-output');
    const errorOutput = document.getElementById('error-output');

    jsonOutput.textContent = '';
    tableOutput.innerHTML = '';
    statsOutput.innerHTML = '';
    errorOutput.textContent = '';
    errorOutput.classList.add('hidden');
}

function clearAll() {
    clearOutput();
    document.getElementById('output').classList.add('hidden');
    document.getElementById('csv-input').value = '';
    document.getElementById('csv-file').value = '';
    document.getElementById('file-info').style.display = 'none';
}

function downloadJSON() {
    const jsonOutput = document.getElementById('json-output');
    const data = jsonOutput.textContent;
    if (!data) return;

    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}