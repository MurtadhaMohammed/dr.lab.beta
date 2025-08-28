import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Tabs,
  Space,
  Input,
  InputNumber,
  Select,
  Typography,
  Divider,
  Tag,
  message,
  Button,
} from "antd";
import { formatRefText } from "../../../helper/refTextFormatter";

const { Text } = Typography;

/**
 * Result entry modal for visit_v2
 * props:
 *  - open: boolean
 *  - visit: {
 *      id, visitNumber, patient{...}, doctor{...},
 *      tests: [{ visit_item_id, type, code, name_en, name_ar, unit, ref_text, result_json, ... }]
 *    }
 *  - onCancel: fn
 *  - onSubmit: async (changesArray) => void  // [{visit_item_id, result_json, item_status}]
 */
export function ResultsModal({ open, visit, onCancel, onSubmit }) {
  const [activeKey, setActiveKey] = useState("0");
  const [drafts, setDrafts] = useState({}); // visit_item_id -> result_json object
  const tests = Array.isArray(visit?.tests) ? visit.tests : [];

  // init from visit
  useEffect(() => {
    if (!open) return;
    const next = {};
    tests.forEach((t) => {
      next[t.visit_item_id] = normalizeInitialResult(t);
    });
    setDrafts(next);
    setActiveKey("0");
  }, [open, visit?.id]); // re-init when visit changes

  // Tabs items
  const items = useMemo(() => {
    return tests.map((t, idx) => ({
      key: String(idx),
      label: (
        <span>
          <b>{t.name_en || t.name_ar || t.code}</b>{" "}
          <Tag style={{ marginInlineStart: 6 }}>{t.type}</Tag>
        </span>
      ),
      children: (
        <TestEditor
          test={t}
          value={drafts[t.visit_item_id]}
          onChange={(val) =>
            setDrafts((prev) => ({ ...prev, [t.visit_item_id]: val }))
          }
        />
      ),
    }));
  }, [tests, drafts]);

  const handleOk = async () => {
    try {
      // Build changes
      const changes = tests.map((t) => ({
        visit_item_id: t.visit_item_id,
        result_json: drafts[t.visit_item_id] ?? null,
      }));
      await Promise.resolve(onSubmit?.(changes));
    } catch (e) {
      message.error(e?.message || "Failed to save results");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={700}
      title={
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <span>Enter Results</span>
          {visit?.visitNumber && (
            <Tag color="geekblue">#{visit.visitNumber}</Tag>
          )}
          {visit?.patient?.name && (
            <Text type="secondary">— {visit.patient.name}</Text>
          )}
        </div>
      }
      okText="Save"
      destroyOnClose
    >
      {tests.length === 0 ? (
        <EmptyNote text="No tests for this visit." />
      ) : (
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={items}
          tabPosition="top"
        />
      )}
      <div className="pt-10"></div>
    </Modal>
  );
}

/* ---------------------- Per-test editor ---------------------- */
function TestEditor({ test, value, onChange }) {
  console.log(test);
  const meta = safeParse(test?.meta_json);
  const type = test?.type;

  if (type === "single") {
    return (
      <SingleEditor
        unit={test?.unit}
        refText={test?.ref_text}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (type === "panel") {
    const rows = Array.isArray(meta?.items) ? meta.items : [];
    return <PanelEditor rows={rows} value={value} onChange={onChange} />;
  }

  if (type === "composite") {
    const sections = Array.isArray(meta?.sections) ? meta.sections : [];
    return (
      <CompositeEditor sections={sections} value={value} onChange={onChange} />
    );
  }

  return <EmptyNote text="Unsupported test type" />;
}

/* ---------------------- Single ---------------------- */
function SingleEditor({ unit, refText, value, onChange }) {
  // value shape: { result: string|number }
  const current = value && typeof value === "object" ? value : {};
  const set = (val) => onChange({ ...(current || {}), result: val });

  return (
    <div>
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Space align="baseline" wrap>
          <Text strong>Result:</Text>
          <Input
            style={{ width: 240 }}
            value={current.result ?? ""}
            onChange={(e) => set(e.target.value)}
            placeholder="Enter result"
          />
          {unit ? <Tag>{unit}</Tag> : null}
        </Space>

        {(unit || refText) && <Divider style={{ margin: "10px 0" }} />}

        {unit ? (
          <Text type="secondary">
            <b>Unit:</b> {unit}
          </Text>
        ) : null}
        {refText ? (
          <Text type="secondary">
            <b>Ref:</b> {formatRefText(refText)}
          </Text>
        ) : null}
      </Space>
    </div>
  );
}

/* ---------------------- Panel ---------------------- */
function PanelEditor({ rows, value, onChange }) {
  // value shape: { items: { [code]: { result: string } } }
  const current = value && typeof value === "object" ? value : { items: {} };

  const setCell = (code, val) => {
    onChange({
      items: {
        ...(current.items || {}),
        [code]: { result: val },
      },
    });
  };

  return (
    <div>
      {rows.length === 0 ? (
        <EmptyNote text="No items in panel." />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1.2fr",
            gap: 8,
          }}
        >
          {/* <HeaderCell>Code</HeaderCell> */}
          <HeaderCell>Name</HeaderCell>
          <HeaderCell>Result</HeaderCell>
          <HeaderCell>Ref / Unit</HeaderCell>

          {rows
            .slice()
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((r, idx) => {
              const cellVal = current.items?.[r.code]?.result ?? "";
              return (
                <RowFragment key={`${r.code}-${idx}`}>
                  {/* <Cell mono>{r.code}</Cell> */}
                  <Cell>{r.name_en}</Cell>
                  <Cell>
                    <Input
                      value={cellVal}
                      onChange={(e) => setCell(r.code, e.target.value)}
                      placeholder="Result"
                    />
                  </Cell>
                  <Cell dim>
                    {compactRef(r.ref)} {r.unit ? ` ${r.unit}` : ""}
                  </Cell>
                </RowFragment>
              );
            })}
        </div>
      )}
    </div>
  );
}

/* ---------------------- Composite ---------------------- */
function CompositeEditor({ sections, value, onChange }) {
  // value: { sections: { [sectionCode]: { [fieldCode]: any } } }
  const current = value && typeof value === "object" ? value : { sections: {} };

  const setField = (sCode, fCode, val) => {
    onChange({
      sections: {
        ...(current.sections || {}),
        [sCode]: {
          ...(current.sections?.[sCode] || {}),
          [fCode]: val,
        },
      },
    });
  };

  return (
    <div>
      {sections.length === 0 ? (
        <EmptyNote text="No sections defined." />
      ) : (
        sections
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((sec, sIdx) => (
            <div
              key={`${sec.code}-${sIdx}`}
              style={{
                padding: 12,
                border: "1px solid #eee",
                borderRadius: 8,
                marginBottom: 12,
                background:
                  "linear-gradient(135deg, rgba(163,67,201,0.08), rgba(67,170,201,0.08))",
              }}
            >
              <Text strong>
                {sec.name_en} {sec.name_ar ? ` / ${sec.name_ar}` : ""}{" "}
                <Tag style={{ marginInlineStart: 6 }}>{sec.code}</Tag>
              </Text>
              <Divider style={{ margin: "8px 0 12px" }} />

              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {(sec.fields || [])
                  .slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((f, fIdx) => {
                    const fieldVal =
                      current.sections?.[sec.code]?.[f.code] ?? "";

                    if (f.type === "choice") {
                      const choices = Array.isArray(f.choices) ? f.choices : [];
                      return (
                        <Space
                          key={`${sec.code}-${f.code}-${fIdx}`}
                          align="baseline"
                          wrap
                          style={{ width: "100%" }}
                        >
                          <Text style={{ width: 220 }}>
                            {f.label_en} {f.label_ar ? ` / ${f.label_ar}` : ""}
                          </Text>
                          <Select
                            style={{ minWidth: 220 }}
                            value={fieldVal || undefined}
                            onChange={(v) => setField(sec.code, f.code, v)}
                            allowClear
                            options={choices.map((c) => ({
                              value: c,
                              label: c,
                            }))}
                          />
                        </Space>
                      );
                    }

                    if (f.type === "presence") {
                      const opts = f.choices || ["Present", "Absent"];
                      return (
                        <Space
                          key={`${sec.code}-${f.code}-${fIdx}`}
                          align="baseline"
                          wrap
                          style={{ width: "100%" }}
                        >
                          <Text style={{ width: 220 }}>
                            {f.label_en} {f.label_ar ? ` / ${f.label_ar}` : ""}
                          </Text>
                          <Select
                            style={{ minWidth: 220 }}
                            value={fieldVal || undefined}
                            onChange={(v) => setField(sec.code, f.code, v)}
                            allowClear
                            options={opts.map((c) => ({
                              value: c,
                              label: c,
                            }))}
                          />
                        </Space>
                      );
                    }

                    // default: text
                    return (
                      <Space
                        key={`${sec.code}-${f.code}-${fIdx}`}
                        align="baseline"
                        wrap
                        style={{ width: "100%" }}
                      >
                        <Text style={{ width: 220 }}>
                          {f.label_en} {f.label_ar ? ` / ${f.label_ar}` : ""}
                        </Text>
                        <Input
                          style={{ minWidth: 220 }}
                          value={fieldVal}
                          onChange={(e) =>
                            setField(sec.code, f.code, e.target.value)
                          }
                          placeholder="Enter value"
                        />
                      </Space>
                    );
                  })}
              </Space>
            </div>
          ))
      )}
    </div>
  );
}

/* ---------------------- UI helpers ---------------------- */
function HeaderCell({ children }) {
  return <div style={{ fontWeight: 600, color: "#555" }}>{children}</div>;
}
function RowFragment({ children }) {
  return <>{children}</>;
}
function Cell({ children, mono = false, dim = false }) {
  return (
    <div
      style={{
        padding: "6px 4px",
        fontFamily: mono ? "ui-monospace, Menlo, monospace" : undefined,
        color: dim ? "#777" : undefined,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={typeof children === "string" ? children : undefined}
    >
      {children}
    </div>
  );
}
function EmptyNote({ text = "Nothing to show." }) {
  return (
    <div
      style={{
        padding: 12,
        background:
          "linear-gradient(135deg, rgba(163,67,201,0.06), rgba(67,170,201,0.06))",
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

/* ---------------------- logic helpers ---------------------- */
function safeParse(val) {
  if (!val) return null;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  if (typeof val === "object") return val;
  return null;
}

function normalizeInitialResult(test) {
  // لو موجود result_json من الداتا رجعه كما هو
  if (test?.result_json && typeof test.result_json === "object") {
    return test.result_json;
  }
  // تهيئة أولية لكل نوع
  if (test?.type === "single") {
    return { result: "" };
  }
  if (test?.type === "panel") {
    const meta = safeParse(test?.meta_json);
    const items = {};
    (meta?.items || []).forEach((it) => {
      items[it.code] = { result: "" };
    });
    return { items };
  }
  if (test?.type === "composite") {
    const meta = safeParse(test?.meta_json);
    const sections = {};
    (meta?.sections || []).forEach((sec) => {
      const fvals = {};
      (sec.fields || []).forEach((f) => {
        fvals[f.code] = "";
      });
      sections[sec.code] = fvals;
    });
    return { sections };
  }
  return {};
}

function compactRef(ref) {
  if (!ref) return "";
  const s = String(ref).trim();
  return s.length > 40 ? s.slice(0, 40) + "…" : s;
}
