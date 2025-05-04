import React, { useState, useEffect } from 'react';
import { Button, Modal, List, message } from 'antd';
const { ipcRenderer } = window.require('electron');
import { useTranslation } from "react-i18next";

const PrinterSelector = () => {
  const { t } = useTranslation(); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(localStorage.getItem('selectedPrinter') || '');

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
      message.warning(t('c')); 
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
      <Button onClick={showModal}>{t('selectButton')}</Button>
      <Modal
        title={t('printermodalTitle')}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <List
          dataSource={printers}
          renderItem={(printer) => (
            <List.Item
              onClick={() => handlePrinterSelect(printer)}
              style={{ cursor: 'pointer', backgroundColor: printer === selectedPrinter ? '#e6f7ff' : 'transparent' }}
            >
              {printer}
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default PrinterSelector;
