const Database = require('better-sqlite3');
const path = require('path');

async function debugReports() {
  console.log('Debugging Reports Database...');
  
  const dbPath = path.join(__dirname, 'pos.db');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  
  try {
    // Check if generated_reports table exists
    const tableCheck = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='generated_reports'
    `).get();
    
    if (!tableCheck) {
      console.log('❌ generated_reports table does not exist!');
      return;
    }
    
    console.log('✅ generated_reports table exists');
    
    // Get all reports
    const reports = db.prepare(`
      SELECT gr.*, u.name as user_name
      FROM generated_reports gr
      LEFT JOIN users u ON gr.user_id = u.id
      ORDER BY gr.generated_at DESC
    `).all();
    
    console.log(`\nFound ${reports.length} reports in database:`);
    
    if (reports.length === 0) {
      console.log('No reports found. You need to generate some reports first.');
      return;
    }
    
    reports.forEach((report, index) => {
      console.log(`\n--- Report ${index + 1} ---`);
      console.log(`ID: ${report.id}`);
      console.log(`Type: ${report.type}`);
      console.log(`User: ${report.user_name || 'Unknown'}`);
      console.log(`Generated at: ${report.generated_at}`);
      console.log(`Data blob length: ${report.data_blob ? report.data_blob.length : 0}`);
      
      if (report.data_blob) {
        try {
          const parsedData = JSON.parse(report.data_blob);
          console.log(`Parsed data keys: ${Object.keys(parsedData).join(', ')}`);
          console.log(`Has date: ${!!parsedData.date}`);
          console.log(`Has summary: ${!!parsedData.summary}`);
        } catch (error) {
          console.log(`❌ Failed to parse data_blob: ${error.message}`);
        }
      } else {
        console.log('❌ No data_blob found');
      }
    });
    
    // Test generating a report for the first report ID
    if (reports.length > 0) {
      console.log(`\n--- Testing PDF generation for first report ---`);
      const firstReport = reports[0];
      console.log(`Testing with report ID: ${firstReport.id}`);
      
      // Simulate the PDF generation process
      if (firstReport.data_blob) {
        try {
          const reportData = JSON.parse(firstReport.data_blob);
          console.log('Report data structure:', {
            hasDate: !!reportData.date,
            hasGeneratedBy: !!reportData.generated_by,
            hasSummary: !!reportData.summary,
            hasTopProducts: !!reportData.top_products,
            hasTransactions: !!reportData.transactions
          });
        } catch (error) {
          console.log(`❌ Error parsing report data: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    db.close();
  }
}

debugReports(); 