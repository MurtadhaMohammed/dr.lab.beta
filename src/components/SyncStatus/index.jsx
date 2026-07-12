import React, { useEffect, useState } from "react";
import { Tooltip, Progress } from "antd";
import {
  CloudSyncOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useSyncStatus from "../../hooks/useSyncStatus";
import { fireAndForget } from "../../control/renderer";

const SyncStatus = ({ collapsed = false }) => {
  const { t } = useTranslation();
  const { state, pending, error, progress } = useSyncStatus();

  // Flash a "just synced" checkmark for a moment whenever a cycle finishes
  // with nothing left pending, instead of silently sitting at idle.
  const [justSynced, setJustSynced] = useState(false);
  useEffect(() => {
    if (state !== "idle" || pending > 0) return;
    setJustSynced(true);
    const timeout = setTimeout(() => setJustSynced(false), 2000);
    return () => clearTimeout(timeout);
  }, [state, pending]);

  if (state === "disabled") return null;

  const canSyncNow = state === "idle" || state === "error";
  const handleClick = () => {
    if (!canSyncNow) return;
    fireAndForget({ query: "syncNow" });
  };

  const percent =
    progress && progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : null;

  const config = {
    syncing: {
      color: "#9053E7",
      icon:
        percent != null ? (
          <Progress
            type="circle"
            percent={percent}
            size={19}
            strokeWidth={12}
            strokeColor="#9053E7"
            showInfo={false}
          />
        ) : (
          <SyncOutlined spin style={{ color: "#9053E7" }} />
        ),
      shortLabel:
        progress && progress.total > 0
          ? `${t("Syncing")} ${progress.done}/${progress.total}`
          : `${t("Syncing")}...`,
      tooltipLabel:
        progress && progress.total > 0
          ? `${t("Syncing")}... (${progress.done}/${progress.total})`
          : t("Syncing") + "...",
    },
    idle: {
      color: pending > 0 ? "#9053E7" : "#52c41a",
      icon:
        pending > 0 ? (
          <CloudUploadOutlined style={{ color: "#9053E7" }} />
        ) : (
          <CheckCircleOutlined
            style={{ color: "#52c41a", transition: "opacity 0.3s" }}
          />
        ),
      shortLabel:
        pending > 0 ? `${pending} ${t("to sync")}` : t("Synced"),
      tooltipLabel:
        pending > 0
          ? `${pending} ${t("changes waiting to sync")}`
          : justSynced
          ? t("Synced")
          : t("All changes synced"),
    },
    error: {
      color: "#faad14",
      icon: <WarningOutlined style={{ color: "#faad14" }} />,
      shortLabel: t("Sync error"),
      tooltipLabel: error || t("Sync error, retrying..."),
    },
    unauthorized: {
      color: "#ff4d4f",
      icon: <WarningOutlined style={{ color: "#ff4d4f" }} />,
      shortLabel: t("Sync stopped"),
      tooltipLabel: t("Sync stopped: device revoked or session expired"),
    },
  };

  const current = config[state] || config.idle;
  const tooltipTitle = canSyncNow
    ? `${current.tooltipLabel} — ${t("Click to sync now")}`
    : current.tooltipLabel;

  if (collapsed) {
    return (
      <Tooltip title={tooltipTitle} placement="right">
        <span
          onClick={handleClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: 19,
            cursor: canSyncNow ? "pointer" : "default",
          }}
        >
          {current.icon}
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltipTitle} placement="right">
      <div
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          cursor: canSyncNow ? "pointer" : "default",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", fontSize: 19 }}>
          {current.icon}
        </span>
        <span
          className="text-[15px]"
          style={{ color: current.color, whiteSpace: "nowrap" }}
        >
          {current.shortLabel}
        </span>
      </div>
    </Tooltip>
  );
};

export default SyncStatus;
