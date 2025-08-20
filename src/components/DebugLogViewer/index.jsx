import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Typography, Space, Tag, Input } from 'antd';
import { BugOutlined, ClearOutlined, DownloadOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

// Log storage and management
class LogManager {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs
    this.setupConsoleCapture();
  }

  setupConsoleCapture() {
    // Capture console.log, console.error, etc.
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      this.addLog('info', args);
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      this.addLog('error', args);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.addLog('warn', args);
      originalWarn.apply(console, args);
    };
  }

  addLog(level, args) {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level,
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '),
      isPrintRelated: args.some(arg => 
        String(arg).includes('[FRONTEND]') || 
        String(arg).includes('[IPC_') || 
        String(arg).includes('print') ||
        String(arg).includes('Print')
      )
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs(filter = '') {
    const filterLower = filter.toLowerCase();
    return this.logs.filter(log => 
      !filter || 
      log.message.toLowerCase().includes(filterLower) ||
      log.level.toLowerCase().includes(filterLower)
    );
  }

  getPrintLogs() {
    return this.logs.filter(log => log.isPrintRelated);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create global log manager instance
window.logManager = window.logManager || new LogManager();

const DebugLogViewer = ({ visible, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [printLogs, setPrintLogs] = useState([]);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (visible) {
      refreshLogs();
      // Refresh logs every 2 seconds when modal is open
      const interval = setInterval(refreshLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [visible, filter]);

  const refreshLogs = () => {
    setLogs(window.logManager.getLogs(filter));
    setPrintLogs(window.logManager.getPrintLogs());
  };

  const handleClearLogs = () => {
    window.logManager.clearLogs();
    refreshLogs();
  };

  const handleExportLogs = () => {
    window.logManager.exportLogs();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'red';
      case 'warn': return 'orange';
      case 'info': return 'blue';
      default: return 'default';
    }
  };

  const renderLogEntry = (log) => (
    <div key={log.id} style={{ marginBottom: 8, padding: 8, border: '1px solid #f0f0f0', borderRadius: 4 }}>
      <Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatTimestamp(log.timestamp)}
        </Text>
        <Tag color={getLevelColor(log.level)}>{log.level.toUpperCase()}</Tag>
      </Space>
      <Paragraph 
        style={{ 
          marginTop: 4, 
          marginBottom: 0, 
          fontFamily: 'monospace', 
          fontSize: 12,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}
      >
        {log.message}
      </Paragraph>
    </div>
  );

  return (
    <Modal
      title={
        <Space>
          <BugOutlined />
          Debug Log Viewer
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      height={600}
      footer={
        <Space>
          <Button icon={<ClearOutlined />} onClick={handleClearLogs}>
            Clear Logs
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportLogs}>
            Export Logs
          </Button>
          <Button onClick={onClose}>Close</Button>
        </Space>
      }
    >
      <div style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="Filter logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <TabPane tab={`All Logs (${logs.length})`} key="all">
            <div style={{ height: 400, overflowY: 'auto' }}>
              {logs.slice(-50).reverse().map(renderLogEntry)}
              {logs.length > 50 && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 16 }}>
                  Showing last 50 of {logs.length} entries
                </Text>
              )}
            </div>
          </TabPane>
          
          <TabPane tab={`Print Logs (${printLogs.length})`} key="print">
            <div style={{ height: 400, overflowY: 'auto' }}>
              {printLogs.slice(-50).reverse().map(renderLogEntry)}
              {printLogs.length > 50 && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 16 }}>
                  Showing last 50 of {printLogs.length} print-related entries
                </Text>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

// Debug button component that can be added anywhere
export const DebugLogButton = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button 
        icon={<BugOutlined />} 
        onClick={() => setVisible(true)}
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
        type="primary"
        shape="circle"
        size="large"
      />
      <DebugLogViewer visible={visible} onClose={() => setVisible(false)} />
    </>
  );
};

export default DebugLogViewer;