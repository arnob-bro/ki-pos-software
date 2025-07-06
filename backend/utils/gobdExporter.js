const fs = require('fs');
const path = require('path');

/**
 * Export data in GoBD compliant format
 * @param {Array} transactionData - Array of transaction data
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Object} Export result
 */
async function exportGoBD(transactionData, startDate, endDate) {
  try {
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `gobd-export-${startDate}-to-${endDate}-${timestamp}.csv`;
    const filePath = path.join(exportsDir, filename);

    // Generate GoBD compliant CSV content
    const csvContent = generateGoBDCSV(transactionData, startDate, endDate);
    
    // Write to file
    fs.writeFileSync(filePath, csvContent);

    return {
      success: true,
      filePath: filePath,
      filename: filename,
      recordCount: transactionData.length
    };
  } catch (error) {
    throw new Error(`GoBD export failed: ${error.message}`);
  }
}

/**
 * Generate GoBD compliant CSV content
 * @param {Array} transactionData - Array of transaction data
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {string} CSV content
 */
function generateGoBDCSV(transactionData, startDate, endDate) {
  // GoBD compliant headers
  const headers = [
    'Transaction_ID',
    'Date',
    'Time',
    'Total_Amount',
    'Payment_Method',
    'VAT_Rate',
    'Net_Amount',
    'VAT_Amount',
    'Gross_Amount',
    'Items_Count',
    'Items_Details'
  ];

  let csvContent = headers.join(',') + '\n';

  // Process each transaction
  transactionData.forEach(transaction => {
    const date = new Date(transaction.date);
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = date.toTimeString().split(' ')[0];
    
    // Calculate VAT and amounts
    let totalNet = 0;
    let totalVAT = 0;
    let itemsCount = 0;
    let itemsDetails = '';
    
    if (transaction.items && Array.isArray(transaction.items)) {
      itemsCount = transaction.items.length;
      itemsDetails = transaction.items.map(item => 
        `${item.name}:${item.qty}:${item.price}`
      ).join('|');
      
      // Calculate totals
      transaction.items.forEach(item => {
        const netAmount = item.price * item.qty;
        const vatAmount = netAmount * 0.19; // 19% VAT
        totalNet += netAmount;
        totalVAT += vatAmount;
      });
    }
    
    const grossAmount = totalNet + totalVAT;
    
    // Create CSV row
    const row = [
      transaction.transaction_id,
      formattedDate,
      formattedTime,
      transaction.total.toFixed(2),
      transaction.payment_method,
      '19.00', // VAT rate
      totalNet.toFixed(2),
      totalVAT.toFixed(2),
      grossAmount.toFixed(2),
      itemsCount,
      `"${itemsDetails}"` // Wrap in quotes to handle commas
    ];
    
    csvContent += row.join(',') + '\n';
  });

  // Add summary information
  csvContent += '\n';
  csvContent += `Export Summary\n`;
  csvContent += `Start Date,${startDate}\n`;
  csvContent += `End Date,${endDate}\n`;
  csvContent += `Total Records,${transactionData.length}\n`;
  csvContent += `Export Date,${new Date().toISOString().split('T')[0]}\n`;
  csvContent += `Export Time,${new Date().toTimeString().split(' ')[0]}\n`;

  return csvContent;
}

module.exports = {
  exportGoBD
};
