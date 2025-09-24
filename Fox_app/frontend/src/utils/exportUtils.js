const stripPrefix = (s) => String(s).replace(/^[\uFEFF\u200B\s]+/, '');

const sanitizeCSVCell = (value) => {
  if (value === null || value === undefined) {return '';}
  let cellValue = String(value);
  // Remove or escape dangerous formula characters
  // Characters that can start formulas: =, +, -, @, \t, \r
  let stripped = stripPrefix(cellValue);
  if (/^[=+\-@]/.test(stripped)) {
    cellValue = "'" + cellValue;
  }
  
  // Handle quotes and newlines
  if (cellValue.includes('"') || cellValue.includes(',') || cellValue.includes('\n')) {
    // Escape existing quotes by doubling them
    cellValue = cellValue.replace(/"/g, '""');
    // Wrap in quotes
    cellValue = `"${cellValue}"`;
  }
  return cellValue;
};
// Validates data before export to prevent malicious content
const validateExportData = (data) => {
  return data
    .filter(row=>Array.isArray(row) && row.length >0)
    .map(row => {
      return row.map(cell => {
        const cellStr = String(cell);
        // Check for suspicious patterns
        const suspiciousPatterns = [
          /cmd/i,                    // Command execution
          /powershell/i,             // PowerShell execution
          /javascript:/i,            // JavaScript URLs
          /data:text\/html/i,        // Data URLs
          /vbscript:/i,              // VBScript URLs
          /<script/i,                // Script tags
          /document\.cookie/i,       // Cookie theft
          /window\.location/i,       // Redirection
        ];
        
        const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(cellStr));
        
        if (hasSuspiciousContent) {
          console.warn('Suspicious content detected and sanitized:', cellStr);
          // Replace with safe placeholder
          return '[CONTENT_SANITIZED]';
        }
        
        return sanitizeCSVCell(cell);
      });
    }
  );
};
// Secure CSV export
export function exportSecureCSV  (data, headers, filename) {
  try {
    // Validate and sanitize all data
    const sanitizedHeaders = headers.map(header => sanitizeCSVCell(header));
    const sanitizedData = validateExportData(data);
    
    // Create CSV content
    const csvRows = [sanitizedHeaders, ...sanitizedData];
    const csvContent = csvRows
      .map(row => row.join(','))
      .join('\n');
    
    // Add BOM for Excel compatibility (optional)
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    // Create and download file
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    let safename = sanitizeFilename(filename);
    if(!safename.toLowerCase().endsWith('.csv')) safename += '.csv';

    link.href = url;
    link.setAttribute('download', safename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    URL.revokeObjectURL(url);
    
    console.log('CSV exported successfully:', filename);
    
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export CSV file');
  }
};
// Sanitizes filename to prevent directory traversal
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^\w\s.-]/gi, '_') // Replace special chars with underscore
    .replace(/\s+/g, '_')        // Replace spaces with underscore
    .replace(/_{2,}/g, '_')      // Replace multiple underscores with single
    .substring(0, 255);          // Limit length
};

export function jsonExport(val, rep, spa, filename){
  try{
    const blob = new Blob([JSON.stringify(val, rep, spa)], {
        type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log("Json successfully downloaded")
  } 
  catch(err){
    console.error('Error exporting json:', err);
    throw new Error('Failed to export json file');
  }
}