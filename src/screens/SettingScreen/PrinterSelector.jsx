import React, { useState, useEffect } from 'react';
import { Button, Modal, List } from 'antd';
import { useTranslation } from 'react-i18next';
import { CheckOutlined } from '@ant-design/icons';
const { ipcRenderer } = window.require('electron');

const PrinterSelector = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(localStorage.getItem('selectedPrinter') || '');
  const {t} = useTranslation();
  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    try {
      const response = await ipcRenderer.invoke('get-printers');
      setPrinters(response);
    } catch (error) {
      console.error('Failed to fetch printers:', error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (!selectedPrinter) {
      alert('Please select a printer before proceeding.');
      return;
    }
    setIsModalVisible(false);
    localStorage.setItem('selectedPrinter', selectedPrinter);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePrinterSelect = (printer) => {
    setSelectedPrinter(printer);
  };

  return (
    <>
      <Button onClick={showModal}>{t('choosePrinter')}</Button>
      <Modal
        title={t('choosePrinter')}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <List
          dataSource={printers}
          renderItem={(printer) => (
            <List.Item
              onClick={() => handlePrinterSelect(printer)}
              style={{ cursor: 'pointer', padding: '10px', display: 'flex', justifyContent: 'space-between', backgroundColor: printer === selectedPrinter ? '#e6f7ff' : 'transparent' }}
            >
              <span>{printer}</span>
              {printer === selectedPrinter && <CheckOutlined />}
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default PrinterSelector;
