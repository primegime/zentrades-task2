// Global variable to set the maximum displayed rows
var displayedRows = 10;

// Function to handle file upload
function handleFileUpload() {
    // Get elements
    var fileInput = document.getElementById('fileInput');
    var fileInfo = document.getElementById('fileInfoSection');

    // Get selected file type and encoding
    var fileType = document.getElementById('formatDropdown').options[document.getElementById('formatDropdown').selectedIndex].value;
    var encodingType = document.getElementById('encodingDropdown').options[document.getElementById('encodingDropdown').selectedIndex].value;

    // Get the selected file
    var file = fileInput.files[0];

    // Check if selected file type matches the actual file type
    if (fileType !== fileInput.files[0].type.split('/')[1]) {
        return alert('Select correct file format, refresh and then choose the file again.');
    }

    if (file) {
        // Create a FileReader to read the content of the file
        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var fileContent = e.target.result;
                if (file.type === 'application/json') {
                    // If JSON file, parse and handle data
                    var jsonData = JSON.parse(fileContent);
                    fillColumnSelector(jsonData);
                    displaySelectedColumns(jsonData);
                } else if (file.type === 'text/csv') {
                    // If CSV file, handle data
                    handleCSVContent(fileContent);
                }
            } catch (error) {
                console.error('Error reading file:', error);
            }
        };

        // Read the file content
        if (file.type === 'application/json') {
            reader.readAsText(file);
        } else if (file.type === 'text/csv') {
            reader.readAsText(file, encodingType);
        }

        // Display file information
        fileInfo.innerHTML = '<strong>File Info:</strong><br>';
        fileInfo.innerHTML += 'Name: ' + file.name + '<br>';
        fileInfo.innerHTML += 'Size: ' + file.size + ' bytes<br>';
        fileInfo.innerHTML += 'Type: ' + file.type;
    } else {
        fileInfo.innerHTML = 'Please select a file.';
    }
}

// Function to fill the column selector with checkboxes based on JSON data
function fillColumnSelector(jsonData) {
    var columnSelector = document.getElementById('columnSelector');
    columnSelector.innerHTML = '<h2>Select Columns</h2>';

    // Get columns from the first object in JSON data
    var columns = Object.keys(jsonData.products[Object.keys(jsonData.products)[0]]);

    // Iterate through columns and create checkboxes
    columns.forEach(function (column) {
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'checkbox_' + column;
        checkbox.value = column;
        checkbox.checked = true;

        var label = document.createElement('label');
        label.htmlFor = 'checkbox_' + column;
        label.appendChild(document.createTextNode(column));

        // Append checkbox and label to the column selector
        columnSelector.appendChild(checkbox);
        columnSelector.appendChild(label);
        columnSelector.appendChild(document.createElement('br'));

        // Add event listener to checkboxes to update displayed columns
        checkbox.addEventListener('change', function () {
            displaySelectedColumns(jsonData);
        });
    });
}

// Function to capitalize the first letter of each word in a string
function capitalizeFirstLetter(string) {
    return string
        .split(/[\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Function to display selected columns in a table
function displaySelectedColumns(jsonData) {
    var selectedColumnsTable = document.getElementById('selectedColumnsTable');
    selectedColumnsTable.innerHTML = '<h2>Selected Columns</h2>';

    var columnSelector = document.getElementById('columnSelector');
    var checkboxes = columnSelector.querySelectorAll('input[type="checkbox"]');

    if (!jsonData || Object.keys(jsonData.products).length === 0) {
        selectedColumnsTable.innerHTML += 'No product data available.';
        return;
    }

    // Sort data based on popularity in descending order
    var sortedData = Object.keys(jsonData.products).sort(function (a, b) {
        return jsonData.products[b].popularity - jsonData.products[a].popularity;
    });

    // Create a table and header row
    var table = document.createElement('table');
    var headerRow = table.insertRow(0);

    checkboxes.forEach(function (checkbox) {
        var columnName = checkbox.value;
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = columnName;
        headerCell.style.display = checkbox.checked ? 'table-cell' : 'none';
    });

    // Add data rows (limited to the maximum displayed rows)
    var rowCount = 0;
    sortedData.forEach(function (productId) {
        var productData = jsonData.products[productId];
        var row = table.insertRow();

        checkboxes.forEach(function (checkbox) {
            var columnName = checkbox.value;
            var cellValue = productData[columnName];
            var cell = row.insertCell();
            cell.innerHTML = columnName === 'subcategory' ? capitalizeFirstLetter(cellValue) : cellValue;
            cell.style.display = checkbox.checked ? 'table-cell' : 'none';
        });

        rowCount++;

        if (rowCount >= displayedRows) {
            return; // Stop adding rows after reaching the limit
        }
    });

    // Append the table to the selected columns display
    selectedColumnsTable.appendChild(table);
}

// Function to handle CSV content
function handleCSVContent(csvContent) {
    var rows = csvContent.trim().split('\n');
    var delimiterType = document.getElementById('delimiterDropdown').options[document.getElementById('delimiterDropdown').selectedIndex].value;
    var columns = rows[0].split(delimiterType);

    var columnSelector = document.getElementById('columnSelector');
    columnSelector.innerHTML = '<h2>Select Columns</h2>';

    // Iterate through columns and create checkboxes
    columns.forEach(function (column) {
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'checkbox_' + column;
        checkbox.value = column;
        checkbox.checked = true;

        var label = document.createElement('label');
        label.htmlFor = 'checkbox_' + column;
        label.appendChild(document.createTextNode(column));

        // Append checkbox and label to the column selector
        columnSelector.appendChild(checkbox);
        columnSelector.appendChild(label);
        columnSelector.appendChild(document.createElement('br'));

        // Add event listener to checkboxes to update displayed columns
        checkbox.addEventListener('change', function () {
            displaySelectedColumnsCSV(columns, rows);
        });
    });

    // Display selected columns for CSV data
    displaySelectedColumnsCSV(columns, rows);
}

// Function to display selected columns for CSV data
function displaySelectedColumnsCSV(columns, rows) {
    var selectedColumnsTable = document.getElementById('selectedColumnsTable');
    selectedColumnsTable.innerHTML = '<h2>Selected Columns</h2>';

    var columnSelector = document.getElementById('columnSelector');
    var checkboxes = columnSelector.querySelectorAll('input[type="checkbox"]');

    // Create a table and header row
    var table = document.createElement('table');
    var headerRow = table.insertRow(0);

    checkboxes.forEach(function (checkbox) {
        var columnName = checkbox.value;
        var headerCell = headerRow.insertCell();
        headerCell.innerHTML = columnName;
        headerCell.style.display = checkbox.checked ? 'table-cell' : 'none';
    });

    // Add data rows (limited to the maximum displayed rows)
    for (var i = 1; i < 11 && i < rows.length; i++) {
        var rowData = rows[i].split(',');
        var row = table.insertRow();

        checkboxes.forEach(function (checkbox) {
            var columnName = checkbox.value;
            var columnIndex = columns.indexOf(columnName);
            if (columnIndex !== -1) {
                var cellValue = rowData[columnIndex];
                var cell = row.insertCell();
                cell.innerHTML = cellValue;
                cell.style.display = checkbox.checked ? 'table-cell' : 'none';
            }
        });
    }

    // Append the table to the selected columns display
    selectedColumnsTable.appendChild(table);
}
