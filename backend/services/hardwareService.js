const fs = require('fs').promises;
const path = require('path');
const { SerialPort } = require('serialport');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Base Hardware Device Class
class HardwareDevice {
  constructor(config) {
    this.config = config;
    this.isConnected = false;
    this.lastTest = null;
  }

  async connect() {
    throw new Error('connect() method must be implemented by subclass');
  }

  async disconnect() {
    throw new Error('disconnect() method must be implemented by subclass');
  }

  async test() {
    throw new Error('test() method must be implemented by subclass');
  }

  getStatus() {
    return {
      enabled: this.config.enabled,
      connected: this.isConnected,
      lastTest: this.lastTest
    };
  }
}

// EC Terminal Class
class ECTerminal extends HardwareDevice {
  constructor(config) {
    super(config);
    this.port = null;
  }

  async connect() {
    if (!this.config.enabled) {
      throw new Error('EC Terminal is not enabled');
    }

    try {
      // Simulate connection for now
      // In real implementation, connect to actual terminal
      console.log(`Connecting to EC Terminal: ${this.config.model} on ${this.config.port}`);
      
      if (this.config.port && this.config.port.startsWith('COM')) {
        this.port = new SerialPort({
          path: this.config.port,
          baudRate: parseInt(this.config.baudRate || '9600'),
          autoOpen: false
        });

        return new Promise((resolve, reject) => {
          this.port.open((err) => {
            if (err) {
              reject(new Error(`Failed to connect to EC Terminal: ${err.message}`));
              return;
            }
            this.isConnected = true;
            resolve(true);
          });
        });
      } else {
        // Simulate USB/Network connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.isConnected = true;
        return true;
      }
    } catch (error) {
      throw new Error(`EC Terminal connection failed: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.port) {
      this.port.close();
      this.port = null;
    }
    this.isConnected = false;
  }

  async test() {
    if (!this.config.enabled) {
      throw new Error('EC Terminal is not enabled');
    }

    try {
      console.log('Testing EC Terminal:', this.config);
      
      // Connect if not already connected
      if (!this.isConnected) {
        await this.connect();
      }
      
      // Simulate test transaction
      if (this.config.testMode) {
        console.log('Running test transaction...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      this.lastTest = new Date().toISOString();
      return { success: true, message: 'EC Terminal test completed successfully' };
    } catch (error) {
      throw new Error(`EC Terminal test failed: ${error.message}`);
    }
  }

  async processPayment(amount) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      console.log(`Processing payment of ${amount} with EC Terminal`);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        transactionId: `TXN_${Date.now()}`,
        amount: amount,
        status: 'approved',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }
}

// Cash Drawer Class
class CashDrawer extends HardwareDevice {
  constructor(config) {
    super(config);
    this.port = null;
  }

  async connect() {
    if (!this.config.enabled) {
      throw new Error('Cash drawer is not enabled');
    }

    try {
      console.log(`Connecting to cash drawer on ${this.config.port}`);
      
      if (this.config.port && this.config.port.startsWith('COM')) {
        this.port = new SerialPort({
          path: this.config.port,
          baudRate: parseInt(this.config.baudRate || '9600'),
          autoOpen: false
        });

        return new Promise((resolve, reject) => {
          this.port.open((err) => {
            if (err) {
              reject(new Error(`Failed to connect to drawer: ${err.message}`));
              return;
            }
            this.isConnected = true;
            resolve(true);
          });
        });
      } else {
        // Simulate USB/Network connection
        await new Promise(resolve => setTimeout(resolve, 500));
        this.isConnected = true;
        return true;
      }
    } catch (error) {
      throw new Error(`Drawer connection failed: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.port) {
      this.port.close();
      this.port = null;
    }
    this.isConnected = false;
  }

  async test() {
    if (!this.config.enabled) {
      throw new Error('Cash drawer is not enabled');
    }

    try {
      console.log('Testing cash drawer:', this.config);
      
      if (!this.isConnected) {
        await this.connect();
      }
      
      if (this.port) {
        const openCommand = Buffer.from(this.config.openCommand.split(',').map(c => parseInt(c.trim())));
        
        return new Promise((resolve, reject) => {
          this.port.write(openCommand, (err) => {
            if (err) {
              reject(new Error(`Failed to test drawer: ${err.message}`));
              return;
            }
            this.lastTest = new Date().toISOString();
            resolve({ success: true, message: 'Drawer test completed successfully' });
          });
        });
      } else {
        // Simulate drawer test
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.lastTest = new Date().toISOString();
        return { success: true, message: 'Drawer test completed successfully' };
      }
    } catch (error) {
      throw new Error(`Drawer test failed: ${error.message}`);
    }
  }

  async open() {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      console.log('Opening cash drawer');
      
      if (this.port) {
        const openCommand = Buffer.from(this.config.openCommand.split(',').map(c => parseInt(c.trim())));
        
        return new Promise((resolve, reject) => {
          this.port.write(openCommand, (err) => {
            if (err) {
              reject(new Error(`Failed to open drawer: ${err.message}`));
            } else {
              resolve({ success: true, message: 'Drawer opened successfully' });
            }
          });
        });
      } else {
        // Simulate drawer opening
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, message: 'Drawer opened successfully' };
      }
    } catch (error) {
      throw new Error(`Failed to open drawer: ${error.message}`);
    }
  }
}

// Receipt Printer Class
class ReceiptPrinter extends HardwareDevice {
  constructor(config) {
    super(config);
    this.port = null;
  }

  async connect() {
    if (!this.config.enabled) {
      throw new Error('Receipt printer is not enabled');
    }

    try {
      console.log(`Connecting to printer: ${this.config.model} on ${this.config.port}`);
      
      if (this.config.port && this.config.port.startsWith('COM')) {
        this.port = new SerialPort({
          path: this.config.port,
          baudRate: parseInt(this.config.baudRate || '9600'),
          autoOpen: false
        });

        return new Promise((resolve, reject) => {
          this.port.open((err) => {
            if (err) {
              reject(new Error(`Failed to connect to printer: ${err.message}`));
              return;
            }
            this.isConnected = true;
            resolve(true);
          });
        });
      } else {
        // Simulate USB/Network connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.isConnected = true;
        return true;
      }
    } catch (error) {
      throw new Error(`Printer connection failed: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.port) {
      this.port.close();
      this.port = null;
    }
    this.isConnected = false;
  }

  async test() {
    if (!this.config.enabled) {
      throw new Error('Receipt printer is not enabled');
    }

    try {
      console.log('Testing receipt printer:', this.config);
      
      if (!this.isConnected) {
        await this.connect();
      }
      
      const testReceipt = this.generateTestReceipt();
      
      if (this.port) {
        const printData = Buffer.from(testReceipt, 'utf8');
        
        return new Promise((resolve, reject) => {
          this.port.write(printData, (err) => {
            if (err) {
              reject(new Error(`Failed to test printer: ${err.message}`));
              return;
            }
            this.lastTest = new Date().toISOString();
            resolve({ success: true, message: 'Printer test completed successfully' });
          });
        });
      } else {
        // Simulate printing
        console.log('Test receipt content:', testReceipt);
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.lastTest = new Date().toISOString();
        return { success: true, message: 'Printer test completed successfully' };
      }
    } catch (error) {
      throw new Error(`Printer test failed: ${error.message}`);
    }
  }

  async printReceipt(receiptData) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      console.log('Printing receipt');
      
      const receiptContent = this.formatReceipt(receiptData);
      
      if (this.port) {
        const printData = Buffer.from(receiptContent, 'utf8');
        
        return new Promise((resolve, reject) => {
          this.port.write(printData, (err) => {
            if (err) {
              reject(new Error(`Failed to print receipt: ${err.message}`));
            } else {
              resolve({ success: true, message: 'Receipt printed successfully' });
            }
          });
        });
      } else {
        // Simulate printing
        console.log('Receipt content:', receiptContent);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: 'Receipt printed successfully' };
      }
    } catch (error) {
      throw new Error(`Failed to print receipt: ${error.message}`);
    }
  }

  generateTestReceipt() {
    let receipt = '';
    
    if (this.config.headerText) {
      receipt += `${this.config.headerText}\n`;
    }
    
    receipt += '================================\n';
    receipt += '           TEST RECEIPT         \n';
    receipt += '================================\n';
    receipt += `Date: ${new Date().toLocaleString()}\n`;
    receipt += `Printer: ${this.config.model || 'Unknown'}\n`;
    receipt += `Paper Width: ${this.config.paperWidth}mm\n`;
    receipt += '================================\n';
    receipt += 'Item 1: Test Product 1     $10.00\n';
    receipt += 'Item 2: Test Product 2     $15.50\n';
    receipt += 'Item 3: Test Product 3      $5.25\n';
    receipt += '================================\n';
    receipt += 'Subtotal:                  $30.75\n';
    receipt += 'Tax (7%):                   $2.15\n';
    receipt += 'Total:                     $32.90\n';
    receipt += '================================\n';
    
    if (this.config.footerText) {
      receipt += `${this.config.footerText}\n`;
    }
    
    receipt += 'Thank you for your purchase!\n';
    receipt += '================================\n\n\n\n';
    
    return receipt;
  }

  formatReceipt(data) {
    let receipt = '';
    
    if (this.config.headerText) {
      receipt += `${this.config.headerText}\n`;
    }
    
    receipt += '================================\n';
    receipt += `Receipt #: ${data.receiptNumber}\n`;
    receipt += `Date: ${new Date(data.timestamp).toLocaleString()}\n`;
    receipt += `Cashier: ${data.cashierName}\n`;
    receipt += '================================\n';
    
    data.items.forEach(item => {
      receipt += `${item.name.padEnd(20)} ${item.quantity}x $${item.price.toFixed(2)}\n`;
      receipt += `                    $${(item.quantity * item.price).toFixed(2)}\n`;
    });
    
    receipt += '================================\n';
    receipt += `Subtotal: ${' '.repeat(15)}$${data.subtotal.toFixed(2)}\n`;
    receipt += `Tax: ${' '.repeat(18)}$${data.tax.toFixed(2)}\n`;
    receipt += `Total: ${' '.repeat(17)}$${data.total.toFixed(2)}\n`;
    receipt += '================================\n';
    
    if (this.config.footerText) {
      receipt += `${this.config.footerText}\n`;
    }
    
    receipt += 'Thank you for your purchase!\n';
    receipt += '================================\n\n\n\n';
    
    return receipt;
  }
}

// Sync Manager Class
class SyncManager {
  constructor(config) {
    this.config = config;
    this.lastSync = config.lastSync;
    this.isOnline = true;
  }

  async syncData() {
    try {
      console.log('Starting data sync...');
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      this.lastSync = new Date().toISOString();
      return { success: true, message: 'Data sync completed successfully' };
    } catch (error) {
      throw new Error(`Data sync failed: ${error.message}`);
    }
  }

  getStatus() {
    return {
      mode: this.config.mode,
      lastSync: this.lastSync,
      autoSync: this.config.autoSync,
      isOnline: this.isOnline
    };
  }
}

// Main Hardware Manager Class
class HardwareManager {
  constructor() {
    this.configPath = path.join(__dirname, '../config/hardware.json');
    this.defaultConfig = {
      ecTerminal: {
        enabled: false,
        model: '',
        port: '',
        baudRate: '9600',
        timeout: '30',
        merchantId: '',
        terminalId: '',
        testMode: true
      },
      drawer: {
        enabled: false,
        port: '',
        openCommand: '27,112,0,25,250',
        closeCommand: '27,112,1,25,250',
        autoOpen: true
      },
      printer: {
        enabled: false,
        model: '',
        port: '',
        baudRate: '9600',
        paperWidth: '80',
        autoCut: true,
        printLogo: true,
        headerText: '',
        footerText: ''
      },
      sync: {
        mode: 'online',
        autoSync: true,
        syncInterval: '5',
        offlineTimeout: '30',
        retryAttempts: '3',
        lastSync: null
      }
    };
    
    this.devices = {
      ecTerminal: null,
      drawer: null,
      printer: null,
      sync: null
    };
  }

  // Initialize hardware devices
  async initialize(config) {
    if (config.ecTerminal.enabled) {
      this.devices.ecTerminal = new ECTerminal(config.ecTerminal);
    }
    
    if (config.drawer.enabled) {
      this.devices.drawer = new CashDrawer(config.drawer);
    }
    
    if (config.printer.enabled) {
      this.devices.printer = new ReceiptPrinter(config.printer);
    }
    
    this.devices.sync = new SyncManager(config.sync);
  }

  // Load configuration
  async getHardwareConfig() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(configData);
      await this.initialize(config);
      return config;
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.saveHardwareConfig(this.defaultConfig);
        await this.initialize(this.defaultConfig);
        return this.defaultConfig;
      }
      throw error;
    }
  }

  // Save configuration
  async saveHardwareConfig(config) {
    try {
      const configDir = path.dirname(this.configPath);
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
      await this.initialize(config);
      return true;
    } catch (error) {
      throw new Error(`Failed to save hardware configuration: ${error.message}`);
    }
  }

  // Test EC Terminal
  async testECTerminal(config) {
    if (!this.devices.ecTerminal) {
      this.devices.ecTerminal = new ECTerminal(config);
    }
    return await this.devices.ecTerminal.test();
  }

  // Test Drawer
  async testDrawer(config) {
    if (!this.devices.drawer) {
      this.devices.drawer = new CashDrawer(config);
    }
    return await this.devices.drawer.test();
  }

  // Test Printer
  async testPrinter(config) {
    if (!this.devices.printer) {
      this.devices.printer = new ReceiptPrinter(config);
    }
    return await this.devices.printer.test();
  }

  // Sync Data
  async syncData() {
    return await this.devices.sync.syncData();
  }

  // Get available ports
  async getAvailablePorts() {
    try {
      const ports = await SerialPort.list();
      return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer || 'Unknown',
        serialNumber: port.serialNumber || 'Unknown',
        pnpId: port.pnpId || 'Unknown'
      }));
    } catch (error) {
      console.error('Error getting available ports:', error);
      return [];
    }
  }

  // Get hardware status
  async getHardwareStatus() {
    const ports = await this.getAvailablePorts();
    
    return {
      ecTerminal: this.devices.ecTerminal ? this.devices.ecTerminal.getStatus() : { enabled: false, connected: false, lastTest: null },
      drawer: this.devices.drawer ? this.devices.drawer.getStatus() : { enabled: false, connected: false, lastTest: null },
      printer: this.devices.printer ? this.devices.printer.getStatus() : { enabled: false, connected: false, lastTest: null },
      sync: this.devices.sync ? this.devices.sync.getStatus() : { mode: 'offline', lastSync: null, autoSync: false },
      availablePorts: ports
    };
  }

  // Process payment
  async processPayment(amount) {
    if (!this.devices.ecTerminal) {
      throw new Error('EC Terminal not configured');
    }
    return await this.devices.ecTerminal.processPayment(amount);
  }

  // Open drawer
  async openDrawer() {
    if (!this.devices.drawer) {
      throw new Error('Cash drawer not configured');
    }
    return await this.devices.drawer.open();
  }

  // Print receipt
  async printReceipt(receiptData) {
    if (!this.devices.printer) {
      throw new Error('Receipt printer not configured');
    }
    return await this.devices.printer.printReceipt(receiptData);
  }

  // Cleanup connections
  async cleanup() {
    for (const device of Object.values(this.devices)) {
      if (device && typeof device.disconnect === 'function') {
        try {
          await device.disconnect();
        } catch (error) {
          console.error('Error disconnecting device:', error);
        }
      }
    }
  }
}

// Export singleton instance
module.exports = new HardwareManager();