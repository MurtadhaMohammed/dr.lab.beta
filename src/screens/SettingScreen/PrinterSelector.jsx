import React, { useState, useEffect } from "react";
import { Button, Modal, List, message } from "antd";
const { ipcRenderer } = window.require("electron");
import { useTranslation } from "react-i18next";
import { CheckCircleOutlined, CheckOutlined } from "@ant-design/icons";
import { usePlan } from "../../hooks/usePlan";
import { useAppTheme } from "../../hooks/useAppThem";

const PrinterSelector = ({ onPrinterSelect }) => {
  const { t } = useTranslation();
  const { appColors } = useAppTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(
    localStorage.getItem("selectedPrinter") || ""
  );

  const { planType } = usePlan();

  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    try {
      const response = await ipcRenderer.invoke("get-printers");
      setPrinters(response);
    } catch (error) {
      console.error("Failed to fetch printers:", error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (!selectedPrinter) {
      message.warning(t("c"));
      return;
    }
    setIsModalVisible(false);
    localStorage.setItem("selectedPrinter", selectedPrinter);
    if (onPrinterSelect) {
      onPrinterSelect(selectedPrinter);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePrinterSelect = (printer) => {
    setSelectedPrinter(printer);
  };

  return (
    <>
      <Button disabled={planType === "FREE"} onClick={showModal}>
        {t("selectButton")}
      </Button>
      <Modal
        title={t("printermodalTitle")}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <List
          dataSource={printers}
          className="mb-[24px]"
          renderItem={(printer) => (
            <List.Item
              onClick={() => handlePrinterSelect(printer)}
              style={{
                cursor: "pointer",
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
                backgroundColor:
                  printer === selectedPrinter ? appColors?.colorPrimaryHover : "transparent",
              }}
            >
              <span>{printer}</span>
              {printer === selectedPrinter && (
                <CheckCircleOutlined
                  style={{ color: appColors?.colorPrimary , fontSize: 22}}
                />
              )}
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default PrinterSelector;
