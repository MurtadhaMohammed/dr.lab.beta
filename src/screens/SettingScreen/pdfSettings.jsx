import React, { useState } from "react";
import "./style.css";
import { Button, Card, Divider, message, Select, Spin } from "antd";

import fileDialog from "file-dialog";
import { send } from "../../control/renderer";
import { useAppStore } from "../../libs/appStore";
import { useTranslation } from "react-i18next";

import useInitHeaderImage from "../../hooks/useInitHeaderImage";

export const PDFSettings = () => {
  const [imagePathLoading, setImagePathLoading] = useState(false);

  const { user, setPrintFontSize, printFontSize, imagePath, setImagePath } =
    useAppStore();

  const { fetchHeader } = useInitHeaderImage();

  const { t } = useTranslation();

  const handleSizeChange = (val) => {
    localStorage.setItem("lab-print-size", val);
    setPrintFontSize(val);
  };

  const handleChangeFile = async () => {
    try {
      const files = await fileDialog();
      if (!files || files.length === 0) return;

      const selectedFile = files[0];
      const fileName = selectedFile.name.toLowerCase();

      const validExtensions = [".png", ".jpg", ".jpeg", ".webp"];
      const isImageFile = validExtensions.some((ext) => fileName.endsWith(ext));

      if (!isImageFile) {
        message.error(t("PleaseSelectImageFile"));
        return;
      }

      setImagePathLoading(true);
      const saveResponse = await send({
        query: "saveHeadImage",
        file: selectedFile.path,
      });

      if (saveResponse.success) {
        setImagePathLoading(true);
        setImagePath(null);
        await fetchHeader(user);
        setImagePathLoading(false);
        message.success(t("ImageUploadedSuccessfully"));
      } else {
        throw new Error(saveResponse.error);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error(t("ErrorUploadingImage"));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <b className="text-[14px]">{t("ImageCover")}</b>
        <Button type="link" onClick={handleChangeFile}>
          {t("ChangeImage")}
        </Button>
      </div>
      <div className="w-full border border-[#eee]  rounded-md overflow-hidden  min-h-[80px] bg-[#f6f6f6]">
        {imagePath ? (
          <Spin spinning={imagePathLoading}>
            <img className="w-ful" key={imagePath} src={imagePath} />
          </Spin>
        ) : (
          <></>
        )}
      </div>
      <Divider />
      <div className="flex justify-between items-center">
        <b className="text-[14px]">{t("FontSize")}</b>
        <Select
          value={printFontSize}
          variant="borderless"
          onChange={handleSizeChange}
          popupMatchSelectWidth={false}
          style={{ width: 100, textAlign: "center" }}
        >
          <Select.Option value={12}>Small</Select.Option>
          <Select.Option value={14}>Medium</Select.Option>
          <Select.Option value={16}>Large</Select.Option>
        </Select>
      </div>
    </div>
  );
};
