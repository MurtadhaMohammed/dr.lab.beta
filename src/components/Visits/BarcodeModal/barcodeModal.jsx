import { Button, Modal, Popover, Space, Typography } from "antd";
import { useAppStore } from "../../../libs/appStore";
import { send } from "../../../control/renderer";

import { useTranslation } from "react-i18next";
import { useState } from "react";

export const BarcodeModal = ({ open, onCancel, record }) => {
  const { isReload, setIsReload } = useAppStore();

  const { t } = useTranslation();
  const printer = useState(localStorage.getItem("selectedPrinter"));

  const handleBarcode = async (record) => {
    const resp = await send({
      query: "printParcode",
      data: {
        name: record?.patient?.name,
        id: record?.id,
      },
      selectedPrinter: localStorage.getItem("selectedPrinter"),
    });

    if (resp.success) {
      setIsReload(!isReload);
      onCancel(true);
    }
  };

  return (
    <Modal
      title={
        <Typography.Text type="secondary">
          {t("BarcodeResultTitle")} <b>{record?.patient?.name}</b>
        </Typography.Text>
      }
      open={open}
      width={500}
      onCancel={() => {
        onCancel(false);
      }}
      footer={
        <div className={"results-modal-footer"}>
          <Space direction="">
            <Button
              onClick={() => {
                onCancel(false);
              }}
            >
              {t("Close")}
            </Button>
            {printer[0] ? (
              <Button
                type="primary"
                onClick={() => handleBarcode(record)}
                disabled={!printer[0]}
              >
                {t("printBarcode")}
              </Button>
            ) : (
              <Popover content={t("NoPrinterSelected")}>
                <Button
                  type="primary"
                  onClick={() => handleBarcode(record)}
                  disabled={!printer[0]}
                >
                  {t("printBarcode")}
                </Button>
              </Popover>
            )}
          </Space>
        </div>
      }
      centered
    >
      <div className="py-4">
        {t("printBarcodeMessage")} {record?.patient?.name}
      </div>
    </Modal>
  );
};
