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
    document.getElementById('use-chunked').disabled = true;

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
    const useStreaming = document.getElementById('use-streaming');
    const useChunk = document.getElementById('use-chunked');
    if (useStreaming.checked) {
        useChunk.disabled = false;
    } else {
        useChunk.disabled = true;
        useChunk.removeAttr('checked');
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
        const useStreaming = document.getElementById('use-streaming');
        if(file.size > 1000000){
            useStreaming.checked = true;
            useStreaming.disabled = true;
            updateOptions();
        }else {
            const useChecked = document.getElementById('use-chunked');
            useStreaming.checked = false;
            useStreaming.disabled = false;
            useChecked.checked = false;
            useChecked.disabled = true;
            updateOptions();
        }
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
                const output = document.getElementById('output');
                output.classList.remove('hidden');
                initProgressDisplay(output);
                const startTime = performance.now();
                result = await csvToJson.getJsonFromFileStreamingAsync(fileInput.files[0]);
                displayResult(result);
                const endTime = performance.now();
                const takenTimeInMs = Math.floor(endTime - startTime);
                const takenTimeInSeconds = ((takenTimeInMs)/1000).toFixed(2);
                document.getElementById('progress-fill').style.width = '100%';

                const statsOutput = document.getElementById('stats-output');

                statsOutput.innerHTML += `
                <div><strong>Processed:</strong> in ${takenTimeInSeconds} seconds (${takenTimeInMs} milliseconds)</div>
            `;

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
        setTimeout(()=> {
            removeProgressDisplay();
        }, 1500);

    }
}

function removeProgressDisplay() {
    const progressDisplay = document.getElementById('progress-display');
    if (progressDisplay) {
        progressDisplay.remove();
    }
}

function initProgressDisplay(output) {
    removeProgressDisplay();

    // Create progress display
    const progressDiv = document.createElement('div');
    progressDiv.id = 'progress-display';
    progressDiv.innerHTML = '<h5>Processing large file...</h5><div id="progress-bar" style="width: 100%; background: #f0f0f0; height: 20px; border-radius: 10px; margin: 10px 0;"><div id="progress-fill" style="width: 0%; height: 100%; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border-radius: 10px; transition: width 0.3s;"></div></div>';
    output.insertBefore(progressDiv, output.firstChild);
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

    initProgressDisplay(output);

    try {
        const startTime = performance.now();
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
                const endTime = performance.now();
                const takenTimeInMs = Math.floor(endTime - startTime);
                const takenTimeInSeconds = ((takenTimeInMs)/1000).toFixed(2);
                allRows = allRowsComplete;

                // Update progress to 100%
                document.getElementById('progress-fill').style.width = '100%';
                document.getElementById('progress-text').textContent = `Complete! Processed ${allRows.length} rows in ${takenTimeInSeconds} seconds (${takenTimeInMs} milliseconds)`;

                // Display final results
                jsonOutput.textContent = JSON.stringify(allRows, null, 2);
                displayStats(allRows);
                displayTable(allRows);
                displayDownloadButton();
                showOutputTab('table');
            },
            onError: (error) => {
                console.error('Error:', error);
                displayError(error);
                removeProgressDisplay();
            }
        });
    } catch (error) {
        console.error('Catch error:', error);
        displayError(error);
        removeProgressDisplay();
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
    displayDownloadButton();

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

    tableOutput.innerHTML = html;
    displayTableTitle(data);
}

function displayTableTitle(data) {
    const maxRows = 1000;
    const tableTitle = document.getElementById('table-title');
    if (data.length > maxRows) {
        tableTitle.innerHTML = `<p><b>Showing first ${maxRows} rows only. Full data is available in JSON View for files containing less than 1,000 lines. For bigger files click to the Download JSON button.</h4></p>`;
    }
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

function displayDownloadButton() {
    const downloadButton = document.getElementById('download-json-btn');
    downloadButton.classList.remove('hidden');
    downloadButton.classList.remove('download-btn-hidden');
    downloadButton.classList.add('download-btn');
}

function hideDownloadButton() {
    const downloadButton = document.getElementById('download-json-btn');
    downloadButton.classList.add('hidden');
    downloadButton.classList.add('download-btn-hidden');
    downloadButton.classList.remove('download-btn');
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
    removeProgressDisplay();
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
    document.getElementById('use-streaming').checked = false;
    document.getElementById('use-chunked').checked = false;
    toggleChunkedOptions();
    hideDownloadButton();
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