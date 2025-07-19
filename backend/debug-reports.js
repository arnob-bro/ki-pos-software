const Database = require('better-sqlite3');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'pos.db');
const db = new Database(dbPath);

console.log('🔍 Debugging Reports Database...\n');

try {
  // Check if generated_reports table exists
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='generated_reports'
  `).get();

  if (!tableExists) {
    console.log('❌ generated_reports table does not exist!');
    process.exit(1);
  }

  console.log('✅ generated_reports table exists');

  // Check all reports
  const reports = db.prepare(`
    SELECT id, type, user_id, generated_at, 
           CASE WHEN data_blob IS NULL THEN 'NULL' 
                WHEN data_blob = '' THEN 'EMPTY' 
                ELSE 'HAS_DATA' END as data_status,
           LENGTH(data_blob) as data_length
    FROM generated_reports 
    ORDER BY generated_at DESC
  `).all();

  console.log(`\n📊 Found ${reports.length} reports:`);
  
  if (reports.length === 0) {
    console.log('No reports found in database');
  } else {
    reports.forEach((report, index) => {
      console.log(`${index + 1}. ID: ${report.id}`);
      console.log(`   Type: ${report.type}`);
      console.log(`   User ID: ${report.user_id}`);
      console.log(`   Generated: ${report.generated_at}`);
      console.log(`   Data Status: ${report.data_status}`);
      console.log(`   Data Length: ${report.data_length || 0} characters`);
      console.log('');
    });
  }

  // Check for reports with null or empty data_blob
  const corruptedReports = db.prepare(`
    SELECT id, type, generated_at 
    FROM generated_reports 
    WHERE data_blob IS NULL OR data_blob = ''
  `).all();

  if (corruptedReports.length > 0) {
    console.log(`⚠️  Found ${corruptedReports.length} reports with missing data:`);
    corruptedReports.forEach(report => {
      console.log(`   - ${report.id} (${report.type}) - ${report.generated_at}`);
    });
    console.log('\n💡 These reports will cause PDF generation errors.');
  } else {
    console.log('✅ All reports have valid data');
  }

  // Test parsing some reports
  console.log('\n🧪 Testing report data parsing...');
  const testReports = db.prepare(`
    SELECT id, type, data_blob 
    FROM generated_reports 
    WHERE data_blob IS NOT NULL AND data_blob != ''
    LIMIT 3
  `).all();

  testReports.forEach((report, index) => {
    try {
      const parsed = JSON.parse(report.data_blob);
      console.log(`${index + 1}. ${report.id} (${report.type}): ✅ Valid JSON`);
      console.log(`   Has date: ${!!parsed.date}`);
      console.log(`   Has generated_by: ${!!parsed.generated_by}`);
      console.log(`   Has summary: ${!!parsed.summary}`);
    } catch (error) {
      console.log(`${index + 1}. ${report.id} (${report.type}): ❌ Invalid JSON - ${error.message}`);
    }
  });

} catch (error) {
  console.error('❌ Error debugging reports:', error.message);
} finally {
  db.close();
  console.log('\n🔍 Debug complete');
} 