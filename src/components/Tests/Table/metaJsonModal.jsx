import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Space,
  Button,
  Input,
  InputNumber,
  Select,
  Divider,
  Typography,
  message,
} from "antd";

const { Title } = Typography;

/**
 * MetaJson editor modal (panel & composite only)
 * - No print-layout select (auto by type)
 * - No Raw JSON tab (builder only)
 */
export const MetaJsonModal = ({
  open,
  type, // "panel" | "composite"
  initialMetaJson, // string or object
  onCancel,
  onSubmit,
}) => {
  const [panelItems, setPanelItems] = useState([]);
  const [sections, setSections] = useState([]);

  const isPanel = type === "panel";
  const isComposite = type === "composite";

  useEffect(() => {
    if (!open) return;
    if (!(isPanel || isComposite)) return;

    const parsed = safeParse(initialMetaJson);
    if (isPanel) {
      setPanelItems(normalizePanelItems(parsed?.items || []));
    } else if (isComposite) {
      setSections(normalizeSections(parsed?.sections || []));
    }
  }, [open, type, initialMetaJson, isPanel, isComposite]);

  const builderJson = useMemo(() => {
    const base = {
      print: { layout: isPanel ? "table" : "sections" },
    };
    if (isPanel) {
      return { ...base, items: panelItems.map(sanitizeEmptyToNull) };
    }
    if (isComposite) {
      return {
        ...base,
        sections: sections.map((sec) => ({
          ...sanitizeEmptyToNull(sec),
          fields: (sec.fields || []).map(sanitizeEmptyToNull),
        })),
      };
    }
    return base;
  }, [isPanel, isComposite, panelItems, sections]);

  const handleOk = () => {
    try {
      // فحص بسيط
      if (isPanel && panelItems.length === 0) {
        message.warning("Please add at least one item.");
        return;
      }
      if (isComposite && sections.length === 0) {
        message.warning("Please add at least one section.");
        return;
      }
      const jsonString = JSON.stringify(builderJson);
      onSubmit?.(jsonString);
    } catch (e) {
      message.error("Error building JSON");
    }
  };

  // لا نعرض شيء إذا النوع single
  if (!(isPanel || isComposite)) return null;

  return (
    <Modal
      title={`Edit meta_json (${type})`}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={isComposite ? 1000 : 700}
      okText="Save"
      destroyOnClose
    >
      {isPanel ? (
        <PanelBuilder items={panelItems} setItems={setPanelItems} />
      ) : (
        <CompositeBuilder sections={sections} setSections={setSections} />
      )}
    </Modal>
  );
};

/* ---------------------- Panel Builder ---------------------- */
function PanelBuilder({ items, setItems }) {
  const addRow = () => {
    setItems([
      ...items,
      { code: "", name_en: "", unit: "", ref: "", order: nextOrder(items) },
    ]);
  };
  const removeRow = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateRow = (idx, key, val) =>
    setItems(items.map((r, i) => (i === idx ? { ...r, [key]: val } : r)));

  return (
    <div>
      {items.length === 0 ? (
        <EmptyNote text="No items. Add one." />
      ) : (
        items.map((r, idx) => (
          <div
            key={idx}
            style={{
              padding: 10,
              border: "1px solid #eee",
              borderRadius: 8,
              marginBottom: 8,
              background: "#f6f6f6",
            }}
          >
            <Space direction="vertical">
              <Space wrap>
                <Input
                  style={{ width: 130 }}
                  placeholder="Code (e.g. ALT)"
                  value={r.code}
                  onChange={(e) => updateRow(idx, "code", e.target.value)}
                />
                <Input
                  style={{ width: 170 }}
                  placeholder="Name EN"
                  value={r.name_en}
                  onChange={(e) => updateRow(idx, "name_en", e.target.value)}
                />
                <Input
                  style={{ width: 120 }}
                  placeholder="Unit"
                  value={r.unit}
                  onChange={(e) => updateRow(idx, "unit", e.target.value)}
                />

                <InputNumber
                  style={{ width: 90 }}
                  placeholder="Order"
                  value={r.order}
                  onChange={(v) => updateRow(idx, "order", v)}
                  min={1}
                />
                <Button danger type="link" onClick={() => removeRow(idx)}>
                  Remove
                </Button>
              </Space>
              <RefCell
                value={r.ref}
                onChange={(val) => updateRow(idx, "ref", val)}
              />
            </Space>
          </div>
        ))
      )}
      <Button type="dashed" onClick={addRow} style={{ marginBottom: 8 }}>
        + Add Item
      </Button>
    </div>
  );
}

/* -------------------- Composite Builder -------------------- */
function CompositeBuilder({ sections, setSections }) {
  const addSection = () =>
    setSections([
      ...sections,
      {
        code: "",
        name_en: "",
        name_ar: "",
        order: nextOrder(sections),
        fields: [],
      },
    ]);
  const removeSection = (idx) =>
    setSections(sections.filter((_, i) => i !== idx));
  const updateSection = (idx, key, val) =>
    setSections(sections.map((s, i) => (i === idx ? { ...s, [key]: val } : s)));

  const addField = (sIdx) =>
    setSections(
      sections.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              fields: [
                ...(s.fields || []),
                {
                  code: "",
                  label_en: "",
                  label_ar: "",
                  type: "text",
                  order: nextOrder(s.fields || []),
                },
              ],
            }
          : s
      )
    );

  const removeField = (sIdx, fIdx) =>
    setSections(
      sections.map((s, i) =>
        i === sIdx
          ? { ...s, fields: (s.fields || []).filter((_, j) => j !== fIdx) }
          : s
      )
    );

  const updateField = (sIdx, fIdx, key, val) =>
    setSections(
      sections.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              fields: (s.fields || []).map((f, j) =>
                j === fIdx ? { ...f, [key]: val } : f
              ),
            }
          : s
      )
    );

  return (
    <div>
      {sections.length === 0 ? (
        <EmptyNote text="No sections. Add one." />
      ) : (
        sections.map((sec, sIdx) => (
          <div
            key={sIdx}
            style={{
              padding: 12,
              border: "1px solid #eee",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <div className="bg-[#f6f6f6] p-2 rounded-[8px]">
              <Title level={5} style={{ marginTop: 0 }}>
                Section #{sIdx + 1}
              </Title>
              <Space wrap style={{ marginBottom: 8 }}>
                <Input
                  style={{ width: 140 }}
                  placeholder="Code"
                  value={sec.code}
                  onChange={(e) => updateSection(sIdx, "code", e.target.value)}
                />
                <Input
                  style={{ width: 200 }}
                  placeholder="Name EN"
                  value={sec.name_en}
                  onChange={(e) =>
                    updateSection(sIdx, "name_en", e.target.value)
                  }
                />
                <Input
                  style={{ width: 200 }}
                  placeholder="Name AR"
                  value={sec.name_ar}
                  onChange={(e) =>
                    updateSection(sIdx, "name_ar", e.target.value)
                  }
                />
                <InputNumber
                  style={{ width: 90 }}
                  placeholder="Order"
                  min={1}
                  value={sec.order}
                  onChange={(v) => updateSection(sIdx, "order", v)}
                />
                <Button danger type="link" onClick={() => removeSection(sIdx)}>
                  Remove Section
                </Button>
              </Space>
            </div>
            <Divider style={{ margin: "10px 0" }} />

            <div className="border-l-4 border-l-[#eee] pl-[16px]">
              {(sec.fields || []).length === 0 ? (
                <EmptyNote text="No fields. Add one." />
              ) : (
                (sec.fields || []).map((f, fIdx) => (
                  <div
                    key={fIdx}
                    style={{
                      //   padding: 10,
                      //   border: "1px dashed #ddd",
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Space wrap>
                      <div>-</div>
                      <Input
                        size="small"
                        style={{ width: 120 }}
                        placeholder="Code"
                        value={f.code}
                        onChange={(e) =>
                          updateField(sIdx, fIdx, "code", e.target.value)
                        }
                      />
                      <Input
                        size="small"
                        style={{ width: 180 }}
                        placeholder="Label EN"
                        value={f.label_en}
                        onChange={(e) =>
                          updateField(sIdx, fIdx, "label_en", e.target.value)
                        }
                      />
                      <Input
                        size="small"
                        style={{ width: 180 }}
                        placeholder="Label AR"
                        value={f.label_ar}
                        onChange={(e) =>
                          updateField(sIdx, fIdx, "label_ar", e.target.value)
                        }
                      />
                      <Select
                        size="small"
                        style={{ width: 140 }}
                        placeholder="Type"
                        value={f.type}
                        onChange={(v) => updateField(sIdx, fIdx, "type", v)}
                        options={[
                          { value: "text", label: "text" },
                          { value: "choice", label: "choice" },
                          { value: "presence", label: "presence" },
                        ]}
                      />
                      <InputNumber
                        size="small"
                        style={{ width: 90 }}
                        placeholder="Order"
                        min={1}
                        value={f.order}
                        onChange={(v) => updateField(sIdx, fIdx, "order", v)}
                      />
                      <Button
                        danger
                        type="link"
                        onClick={() => removeField(sIdx, fIdx)}
                      >
                        Remove Field
                      </Button>
                    </Space>
                  </div>
                ))
              )}
              <Button
                type="dashed"
                onClick={() => addField(sIdx)}
                style={{ marginTop: 8 }}
              >
                + Add Field
              </Button>
            </div>
          </div>
        ))
      )}
      <Button type="dashed" onClick={addSection} style={{ marginBottom: 8 }}>
        + Add Section
      </Button>
    </div>
  );
}

/* ----------------------- Helpers ----------------------- */

function tryParseJsonArray(val) {
  if (!val || typeof val !== "string") return null;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function numOrNull(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function EmptyNote({ text = "Nothing to show." }) {
  return (
    <div
      style={{
        padding: 12,
        background: "#fafafa",
        border: "1px dashed #ddd",
        borderRadius: 8,
        color: "#666",
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );
}

function safeParse(val) {
  if (!val) return null;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  return val;
}
function nextOrder(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 1;
  const max = Math.max(
    ...arr.map((x) => (typeof x?.order === "number" ? x.order : 0))
  );
  return Number.isFinite(max) ? max + 1 : 1;
}
function sanitizeEmptyToNull(obj) {
  const out = { ...obj };
  Object.keys(out).forEach((k) => {
    if (out[k] === "") out[k] = null;
  });
  return out;
}
function normalizePanelItems(items) {
  return items.map((it, i) => ({
    code: it?.code ?? "",
    name_en: it?.name_en ?? "",
    unit: it?.unit ?? "",
    ref: it?.ref ?? "",
    order: typeof it?.order === "number" ? it.order : i + 1,
  }));
}
function normalizeSections(secs) {
  return secs.map((s, i) => ({
    code: s?.code ?? "",
    name_en: s?.name_en ?? "",
    name_ar: s?.name_ar ?? "",
    order: typeof s?.order === "number" ? s.order : i + 1,
    fields: Array.isArray(s?.fields)
      ? s.fields.map((f, j) => ({
          code: f?.code ?? "",
          label_en: f?.label_en ?? "",
          label_ar: f?.label_ar ?? "",
          type: f?.type ?? "text",
          order: typeof f?.order === "number" ? f.order : j + 1,
        }))
      : [],
  }));
}

/* ------------------ Ref cell with JSON support ------------------ */
function RefCell({ value, onChange }) {
  const [jsonMode, setJsonMode] = useState(false);
  const [ranges, setRanges] = useState([]);

  // initialize mode from current value
  useEffect(() => {
    const parsed = tryParseJsonArray(value);
    if (parsed) {
      setJsonMode(true);
      setRanges(parsed);
    } else {
      setJsonMode(false);
      setRanges([]);
    }
  }, [value]);

  const setRangesAndSync = (next) => {
    setRanges(next);
    // نخزنها كنص JSON داخل ref (حتى تبقى المواصفة موحدة)
    onChange(JSON.stringify(next));
  };

  const addRange = () => {
    setRangesAndSync([
      ...ranges,
      {
        sex: null,
        low: null,
        high: null,
        unit: "",
        note: "",
        op: null,
        value: null,
      },
    ]);
  };

  const updateRange = (i, key, val) => {
    const next = ranges.map((r, idx) => (idx === i ? { ...r, [key]: val } : r));
    setRangesAndSync(next);
  };

  const removeRange = (i) => {
    const next = ranges.filter((_, idx) => idx !== i);
    setRangesAndSync(next);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 260,
      }}
    >
      <Space size="small">
        <span>Ref</span>
        <Select
          value={jsonMode ? "json" : "text"}
          variant="borderless"
          onChange={(v) => {
            if (v === "json") {
              setJsonMode(true);
              // لو كان فارغ، نبدأ بصف واحد
              if (!tryParseJsonArray(value)) {
                const init = [
                  { sex: null, low: null, high: null, unit: "", note: "" },
                ];
                setRanges(init);
                onChange(JSON.stringify(init));
              }
            } else {
              setJsonMode(false);
              // حوله لنص بسيط (نفرغه ونخلي المستخدم يكتب)
              onChange("");
            }
          }}
          options={[
            { value: "text", label: "Text" },
            { value: "json", label: "JSON" },
          ]}
          style={{ width: 100 }}
        />
      </Space>

      {!jsonMode ? (
        <Input
          style={{ width: 260 }}
          placeholder='e.g. "0.3-1.2" or "Negative"'
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div
          style={{
            border: "1px dashed #ddd",
            borderRadius: 8,
            padding: 8,
            width: 520,
            maxWidth: "100%",
          }}
        >
          {ranges.length === 0 ? (
            <EmptyNote text="No ranges. Add one." />
          ) : (
            ranges.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  marginBottom: 8,
                }}
              >
                <Select
                  size="small"
                  placeholder="Sex"
                  value={r.sex ?? null}
                  onChange={(v) => updateRange(i, "sex", v)}
                  allowClear
                  style={{ width: 90 }}
                  options={[
                    { value: "M", label: "M" },
                    { value: "F", label: "F" },
                  ]}
                />
                <InputNumber
                  size="small"
                  placeholder="Low"
                  value={numOrNull(r.low)}
                  onChange={(v) => updateRange(i, "low", v)}
                  style={{ width: 90 }}
                />
                <InputNumber
                  size="small"
                  placeholder="High"
                  value={numOrNull(r.high)}
                  onChange={(v) => updateRange(i, "high", v)}
                  style={{ width: 90 }}
                />
                <Input
                  size="small"
                  placeholder="Unit"
                  value={r.unit || ""}
                  onChange={(e) => updateRange(i, "unit", e.target.value)}
                  style={{ width: 90 }}
                />

                <Button type="link" danger onClick={() => removeRange(i)}>
                  Remove
                </Button>
              </div>
            ))
          )}

          <Button type="dashed" onClick={addRange} block>
            + Add Range
          </Button>
        </div>
      )}
    </div>
  );
}
