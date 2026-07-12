import React, { useEffect, useState } from "react";
import { Tooltip, Progress } from "antd";
import { SyncOutlined, CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";
// Imported from its own submodule (not the barrel index above) — Parcel's
// production scope-hoisting has intermittently tree-shaken this one icon
// out of the barrel import even though it's used, only in prod builds.
import CloudUploadOutlined from "@ant-design/icons/CloudUploadOutlined";
import { useTranslation } from "react-i18next";
import useSyncStatus from "../../hooks/useSyncStatus";
import { fireAndForget } from "../../control/renderer";

// Lives in the custom title bar (top-right, next to the window controls) —
// always a compact pill with a tinted background matching the state, never
// collapses to icon-only.
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
      color: "#9053E7",
      bg: "rgba(144, 83, 231, 0.12)",
      icon:
        percent != null ? (
          <Progress
            type="circle"
            percent={percent}
            size={14}
            strokeWidth={14}
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
      bg: pending > 0 ? "rgba(144, 83, 231, 0.12)" : "rgba(82, 196, 26, 0.12)",
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
      bg: "rgba(250, 173, 20, 0.12)",
      icon: <WarningOutlined style={{ color: "#faad14" }} />,
      shortLabel: t("Sync error"),
      tooltipLabel: error || t("Sync error, retrying..."),
    },
    unauthorized: {
      color: "#ff4d4f",
      bg: "rgba(255, 77, 79, 0.12)",
      icon: <WarningOutlined style={{ color: "#ff4d4f" }} />,
      shortLabel: t("Sync stopped"),
      tooltipLabel: t("Sync stopped: device revoked or session expired"),
    },
  };

  const current = config[state] || config.idle;
  const tooltipTitle = canSyncNow
    ? `${current.tooltipLabel} — ${t("Click to sync now")}`
    : current.tooltipLabel;

  return (
    <Tooltip title={tooltipTitle} placement="bottom">
      <div
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 10px",
          borderRadius: 999,
          background: current.bg,
          cursor: canSyncNow ? "pointer" : "default",
          WebkitAppRegion: "no-drag",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", fontSize: 13 }}>
          {current.icon}
        </span>
        <span
          style={{
            color: current.color,
            whiteSpace: "nowrap",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {current.shortLabel}
        </span>
      </div>
    </Tooltip>
  );
};

export default SyncStatus;
