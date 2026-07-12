import React, { useEffect, useState } from "react";
import { Tooltip, Progress } from "antd";
import {
  CloudSyncOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useSyncStatus from "../../hooks/useSyncStatus";
import { fireAndForget } from "../../control/renderer";

const SyncStatus = () => {
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
      icon:
        percent != null ? (
          <Progress
            type="circle"
            percent={percent}
            size={16}
            strokeWidth={12}
            strokeColor="#9053E7"
            showInfo={false}
          />
        ) : (
          <CloudSyncOutlined spin style={{ color: "#9053E7" }} />
        ),
      label:
        progress && progress.total > 0
          ? `${t("Syncing")}... (${progress.done}/${progress.total})`
          : t("Syncing") + "...",
    },
    idle: {
      icon:
        pending > 0 ? (
          <CloudUploadOutlined style={{ color: "#9053E7" }} />
        ) : (
          <CheckCircleOutlined
            style={{ color: "#52c41a", transition: "opacity 0.3s" }}
          />
        ),
      label:
        pending > 0
          ? `${pending} ${t("changes waiting to sync")}`
          : justSynced
          ? t("Synced")
          : t("All changes synced"),
    },
    error: {
      icon: <WarningOutlined style={{ color: "#faad14" }} />,
      label: error || t("Sync error, retrying..."),
    },
    unauthorized: {
      icon: <WarningOutlined style={{ color: "#ff4d4f" }} />,
      label: t("Sync stopped: device revoked or session expired"),
    },
  };

  const current = config[state] || config.idle;
  const tooltipLabel = canSyncNow
    ? `${current.label} — ${t("Click to sync now")}`
    : current.label;

  return (
    <Tooltip title={tooltipLabel}>
      <span
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: 16,
          cursor: canSyncNow ? "pointer" : "default",
        }}
      >
        {current.icon}
      </span>
    </Tooltip>
  );
};

export default SyncStatus;
