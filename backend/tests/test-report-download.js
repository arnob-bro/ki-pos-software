const Database = require('better-sqlite3');
const path = require('path');
const ReportService = require('../services/reportService');

async function testReportDownload() {
  console.log('Testing Report Download Functionality...');
  
  const dbPath = path.join(__dirname, 'pos.db');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath);
  const reportService = new ReportService(db);
  
  try {
    // Test 1: Generate a sample X report
    console.log('\n1. Generating sample X report...');
    const sampleReportData = {
      type: 'X',
      date: '2024-01-15',
      generated_by: 'test-user',
      generated_at: new Date().toISOString(),
      summary: {
        total_transactions: 25,
        total_sales: 1250.75,
        cash_sales: 450.25,
        card_sales: 750.50,
        other_sales: 50.00
      },
      top_products: [
        { name: 'Coffee', qty: 15 },
        { name: 'Sandwich', qty: 8 },
        { name: 'Cake', qty: 5 }
      ]
    };
    
    const xReportResult = await reportService.generatePDFReport('test-x-report-123');
    console.log('X Report generated:', xReportResult);
    
    // Test 2: Generate a sample Z report
    console.log('\n2. Generating sample Z report...');
    const sampleZReportData = {
      type: 'Z',
      date: '2024-01-15',
      generated_by: 'test-user',
      generated_at: new Date().toISOString(),
      summary: {
        total_transactions: 25,
        total_sales: 1250.75,
        cash_sales: 450.25,
        card_sales: 750.50,
        other_sales: 50.00,
        total_net: 1051.05,
        total_vat: 199.70,
        total_gross: 1250.75
      },
      top_products: [
        { name: 'Coffee', qty: 15 },
        { name: 'Sandwich', qty: 8 },
        { name: 'Cake', qty: 5 }
      ],
      transactions: [
        {
          id: 'TXN-001',
          total: 45.50,
          payment_method: 'card',
          created_at: '2024-01-15T09:30:00Z'
        },
        {
          id: 'TXN-002',
          total: 32.75,
          payment_method: 'cash',
          created_at: '2024-01-15T10:15:00Z'
        }
      ]
    };
    
    const zReportResult = await reportService.generatePDFReport('test-z-report-456');
    console.log('Z Report generated:', zReportResult);
    
    // Test 3: Check if files were created
    console.log('\n3. Checking if report files were created...');
    const fs = require('fs');
    const reportsDir = path.join(__dirname, 'reports');
    
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      console.log('Files in reports directory:', files);
      
      // Test 4: Read and display content of one file
      if (files.length > 0) {
        console.log('\n4. Reading sample report content...');
        const sampleFile = path.join(reportsDir, files[0]);
        const content = fs.readFileSync(sampleFile, 'utf8');
        console.log('Sample report content:');
        console.log('='.repeat(50));
        console.log(content.substring(0, 500) + '...'); // Show first 500 chars
        console.log('='.repeat(50));
      }
    } else {
      console.log('Reports directory not found');
    }
    
    console.log('\n✅ Report download functionality test completed!');
    
  } catch (error) {
    console.error('❌ Report download test failed:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    db.close();
  }
}

testReportDownload(); 