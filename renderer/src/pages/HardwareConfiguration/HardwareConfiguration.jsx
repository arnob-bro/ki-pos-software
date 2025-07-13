import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import './HardwareConfiguration.css';

const HardwareConfiguration = () => {
  const [config, setConfig] = useState({
    // EC Terminal Settings
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
    
    // Drawer Control Settings
    drawer: {
      enabled: false,
      port: '',
      openCommand: '27,112,0,25,250',
      closeCommand: '27,112,1,25,250',
      autoOpen: true
    },
    
    // Receipt Printer Settings
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
    
    // Sync Settings
    sync: {
      mode: 'online', // 'online' or 'offline'
      autoSync: true,
      syncInterval: '5', // minutes
      offlineTimeout: '30', // seconds
      retryAttempts: '3',
      lastSync: null
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Available hardware options
  const ecTerminalModels = [
    'Ingenico iSC250',
    'Ingenico iSC350',
    'Verifone VX520',
    'Verifone VX680',
    'PAX A920',
    'PAX A80'
  ];

  const printerModels = [
    'Epson TM-T88VI',
    'Epson TM-T82',
    'Star TSP100',
    'Citizen CT-S310II',
    'Custom'
  ];

  const [ports, setPorts] = useState(['COM1', 'COM2', 'COM3', 'COM4', 'USB', 'Network']);

  useEffect(() => {
    loadConfiguration();
    loadAvailablePorts();
  }, []);

  const loadAvailablePorts = async () => {
    try {
      if (!window.posAPI || !window.posAPI.getAvailablePorts) {
        return;
      }
      
      const result = await window.posAPI.getAvailablePorts();
      if (result.success && result.ports) {
        const portNames = result.ports.map(port => port.path);
        setPorts(['', ...portNames, 'USB', 'Network']);
      }
    } catch (error) {
      console.error('Failed to load available ports:', error);
    }
  };

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      if (!window.posAPI || !window.posAPI.getHardwareConfig) {
        throw new Error("Hardware API not available");
      }
      
      const result = await window.posAPI.getHardwareConfig();
      if (result.success) {
        setConfig(result.config);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to load configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!window.posAPI || !window.posAPI.saveHardwareConfig) {
        throw new Error("Hardware API not available");
      }
      
      const result = await window.posAPI.saveHardwareConfig(config);
      if (result.success) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  const testECTerminal = async () => {
    try {
      setMessage({ type: 'info', text: 'Testing EC terminal connection...' });
      if (!window.posAPI || !window.posAPI.testECTerminal) {
        throw new Error("Hardware API not available");
      }
      
      const result = await window.posAPI.testECTerminal(config.ecTerminal);
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'EC terminal test completed successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'EC terminal test failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'EC terminal test failed' });
    }
  };

  const testDrawer = async () => {
    try {
      setMessage({ type: 'info', text: 'Testing drawer...' });
      if (!window.posAPI || !window.posAPI.testDrawer) {
        throw new Error("Hardware API not available");
      }
      
      const result = await window.posAPI.testDrawer(config.drawer);
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Drawer test completed successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Drawer test failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Drawer test failed' });
    }
  };

  const testPrinter = async () => {
    try {
      setMessage({ type: 'info', text: 'Testing printer...' });
      if (!window.posAPI || !window.posAPI.testPrinter) {
        throw new Error("Hardware API not available");
      }
      
      const result = await window.posAPI.testPrinter(config.printer);
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Printer test completed successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Printer test failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Printer test failed' });
    }
  };

  const syncNow = async () => {
    try {
      setMessage({ type: 'info', text: 'Syncing data...' });
      if (!window.posAPI || !window.posAPI.syncData) {
        throw new Error("Hardware API not available");
      }
      
      const result = await window.posAPI.syncData();
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Data sync completed successfully!' });
        // Reload configuration to update last sync time
        await loadConfiguration();
      } else {
        setMessage({ type: 'error', text: result.message || 'Data sync failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Data sync failed' });
    }
  };

  return (
    <div className="hardware-config-page">
      <Sidebar />
      <div className="hardware-config">
        <div className="header-section">
          <h2>🔧 Hardware Configuration</h2>
          <button 
            type="button" 
            onClick={loadAvailablePorts} 
            className="refresh-btn"
            title="Refresh available ports"
          >
            🔄 Refresh Ports
          </button>
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="config-form">
          
          {/* EC Terminal Configuration */}
          <fieldset className="config-section">
            <legend>💳 EC Terminal Setup</legend>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.ecTerminal.enabled}
                  onChange={(e) => handleChange('ecTerminal', 'enabled', e.target.checked)}
                />
                Enable EC Terminal
              </label>
            </div>

            {config.ecTerminal.enabled && (
              <>
                <div className="form-group">
                  <label>Terminal Model</label>
                  <select
                    value={config.ecTerminal.model}
                    onChange={(e) => handleChange('ecTerminal', 'model', e.target.value)}
                  >
                    <option value="">Select Model</option>
                    {ecTerminalModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Port</label>
                    <select
                      value={config.ecTerminal.port}
                      onChange={(e) => handleChange('ecTerminal', 'port', e.target.value)}
                    >
                      <option value="">Select Port</option>
                      {ports.map(port => (
                        <option key={port} value={port}>{port}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Baud Rate</label>
                    <select
                      value={config.ecTerminal.baudRate}
                      onChange={(e) => handleChange('ecTerminal', 'baudRate', e.target.value)}
                    >
                      <option value="9600">9600</option>
                      <option value="19200">19200</option>
                      <option value="38400">38400</option>
                      <option value="57600">57600</option>
                      <option value="115200">115200</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Merchant ID</label>
                    <input
                      type="text"
                      value={config.ecTerminal.merchantId}
                      onChange={(e) => handleChange('ecTerminal', 'merchantId', e.target.value)}
                      placeholder="Enter Merchant ID"
                    />
                  </div>

                  <div className="form-group">
                    <label>Terminal ID</label>
                    <input
                      type="text"
                      value={config.ecTerminal.terminalId}
                      onChange={(e) => handleChange('ecTerminal', 'terminalId', e.target.value)}
                      placeholder="Enter Terminal ID"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.ecTerminal.testMode}
                      onChange={(e) => handleChange('ecTerminal', 'testMode', e.target.checked)}
                    />
                    Test Mode
                  </label>
                </div>

                <button type="button" onClick={testECTerminal} className="test-btn">
                  🧪 Test EC Terminal
                </button>
              </>
            )}
          </fieldset>

          {/* Drawer Control */}
          <fieldset className="config-section">
            <legend>💰 Drawer Control</legend>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.drawer.enabled}
                  onChange={(e) => handleChange('drawer', 'enabled', e.target.checked)}
                />
                Enable Cash Drawer
              </label>
            </div>

            {config.drawer.enabled && (
              <>
                <div className="form-group">
                  <label>Drawer Port</label>
                  <select
                    value={config.drawer.port}
                    onChange={(e) => handleChange('drawer', 'port', e.target.value)}
                  >
                    <option value="">Select Port</option>
                    {ports.map(port => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Open Command (ESC/P)</label>
                    <input
                      type="text"
                      value={config.drawer.openCommand}
                      onChange={(e) => handleChange('drawer', 'openCommand', e.target.value)}
                      placeholder="e.g., 27,112,0,25,250"
                    />
                  </div>

                  <div className="form-group">
                    <label>Close Command (ESC/P)</label>
                    <input
                      type="text"
                      value={config.drawer.closeCommand}
                      onChange={(e) => handleChange('drawer', 'closeCommand', e.target.value)}
                      placeholder="e.g., 27,112,1,25,250"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.drawer.autoOpen}
                      onChange={(e) => handleChange('drawer', 'autoOpen', e.target.checked)}
                    />
                    Auto-open drawer on payment completion
                  </label>
                </div>

                <button type="button" onClick={testDrawer} className="test-btn">
                  🧪 Test Drawer
                </button>
              </>
            )}
          </fieldset>

          {/* Receipt Printer Configuration */}
          <fieldset className="config-section">
            <legend>🖨️ Receipt Printer Configuration</legend>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.printer.enabled}
                  onChange={(e) => handleChange('printer', 'enabled', e.target.checked)}
                />
                Enable Receipt Printer
              </label>
            </div>

            {config.printer.enabled && (
              <>
                <div className="form-group">
                  <label>Printer Model</label>
                  <select
                    value={config.printer.model}
                    onChange={(e) => handleChange('printer', 'model', e.target.value)}
                  >
                    <option value="">Select Model</option>
                    {printerModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Port</label>
                    <select
                      value={config.printer.port}
                      onChange={(e) => handleChange('printer', 'port', e.target.value)}
                    >
                      <option value="">Select Port</option>
                      {ports.map(port => (
                        <option key={port} value={port}>{port}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Baud Rate</label>
                    <select
                      value={config.printer.baudRate}
                      onChange={(e) => handleChange('printer', 'baudRate', e.target.value)}
                    >
                      <option value="9600">9600</option>
                      <option value="19200">19200</option>
                      <option value="38400">38400</option>
                      <option value="57600">57600</option>
                      <option value="115200">115200</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Paper Width (mm)</label>
                    <select
                      value={config.printer.paperWidth}
                      onChange={(e) => handleChange('printer', 'paperWidth', e.target.value)}
                    >
                      <option value="58">58mm</option>
                      <option value="80">80mm</option>
                      <option value="112">112mm</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Header Text</label>
                  <textarea
                    value={config.printer.headerText}
                    onChange={(e) => handleChange('printer', 'headerText', e.target.value)}
                    placeholder="Enter header text for receipts"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Footer Text</label>
                  <textarea
                    value={config.printer.footerText}
                    onChange={(e) => handleChange('printer', 'footerText', e.target.value)}
                    placeholder="Enter footer text for receipts"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.printer.autoCut}
                      onChange={(e) => handleChange('printer', 'autoCut', e.target.checked)}
                    />
                    Auto-cut paper after printing
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config.printer.printLogo}
                      onChange={(e) => handleChange('printer', 'printLogo', e.target.checked)}
                    />
                    Print company logo on receipts
                  </label>
                </div>

                <button type="button" onClick={testPrinter} className="test-btn">
                  🧪 Test Printer
                </button>
              </>
            )}
          </fieldset>

          {/* Offline/Online Sync Settings */}
          <fieldset className="config-section">
            <legend>🔄 Offline/Online Sync Settings</legend>
            
            <div className="form-group">
              <label>Sync Mode</label>
              <select
                value={config.sync.mode}
                onChange={(e) => handleChange('sync', 'mode', e.target.value)}
              >
                <option value="online">Online Mode</option>
                <option value="offline">Offline Mode</option>
                <option value="hybrid">Hybrid Mode</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.sync.autoSync}
                  onChange={(e) => handleChange('sync', 'autoSync', e.target.checked)}
                />
                Enable Auto Sync
              </label>
            </div>

            {config.sync.autoSync && (
              <div className="form-group">
                <label>Sync Interval (minutes)</label>
                <select
                  value={config.sync.syncInterval}
                  onChange={(e) => handleChange('sync', 'syncInterval', e.target.value)}
                >
                  <option value="1">1 minute</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Offline Timeout (seconds)</label>
                <input
                  type="number"
                  value={config.sync.offlineTimeout}
                  onChange={(e) => handleChange('sync', 'offlineTimeout', e.target.value)}
                  min="5"
                  max="300"
                />
              </div>

              <div className="form-group">
                <label>Retry Attempts</label>
                <input
                  type="number"
                  value={config.sync.retryAttempts}
                  onChange={(e) => handleChange('sync', 'retryAttempts', e.target.value)}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Last Sync</label>
              <input
                type="text"
                value={config.sync.lastSync || 'Never'}
                readOnly
                className="readonly"
              />
            </div>

            <button type="button" onClick={syncNow} className="test-btn">
              🔄 Sync Now
            </button>
          </fieldset>

          <div className="form-actions">
            <button type="submit" disabled={isLoading} className="save-btn">
              {isLoading ? '💾 Saving...' : '💾 Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HardwareConfiguration; 