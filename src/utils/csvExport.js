/**
 * csvExport.js
 * Exports table data as a downloadable CSV file.
 * Handles special characters, quotes, and commas in cell values.
 */

/**
 * Escapes a single cell value for CSV format.
 * Wraps in quotes if contains comma, quote, or newline.
 */
const escapeCell = (value) => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

/**
 * Converts table data to a CSV string and triggers a download.
 * @param {string[]} headers - Column header labels
 * @param {Array<Array<string>>} rows - 2D array of cell data
 * @param {string} pageName - Used to generate the filename
 */
export const exportToCSV = (headers, rows, pageName) => {
    const headerRow = headers.map(escapeCell).join(',');
    const dataRows = rows.map((row) => row.map(escapeCell).join(','));
    const csvContent = [headerRow, ...dataRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const safeName = pageName.replace(/[^a-zA-Z0-9\-_]/g, '-').toLowerCase();
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `jadwalku-${safeName}-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
