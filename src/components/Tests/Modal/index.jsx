import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Space,
  message,
  Button,
} from "antd";
import { useAppStore, useTestStore } from "../../../libs/appStore";
import { send } from "../../../control/renderer";

const { TextArea } = Input;

export const PureModal = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { isModal, setIsModal, initialData, setInitialData } = useTestStore();
  const { setIsReload, isReload } = useAppStore();
  const editing = Boolean(initialData && (initialData.id || initialData.code));

  // 👇 نراقب النوع مباشرة من الفورم بدون ما نغيّر هيكل شغلك
  const type = Form.useWatch("type", form);

  useEffect(() => {
    if (!isModal) return; // ← كان open، خليناه isModal بدون ما نغيّر منطقك

    if (editing) {
      form.setFieldsValue({
        code: initialData.code || "",
        type: initialData.type || "single",
        name_en: initialData.name_en || "",
        name_ar: initialData.name_ar || "",
        sample_type: initialData.sample_type || "",
        unit: initialData.unit || "",
        ref_text:
          typeof initialData.ref_text === "string" ? initialData.ref_text : "",
        price_iqd:
          typeof initialData.price_iqd === "number" ? initialData.price_iqd : 0,
        is_active: initialData.is_active ? true : false,
        version: initialData.version || "",
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        type: "single",
        is_active: true,
        price_iqd: 0,
      });
    }
  }, [isModal, editing, initialData, form]);

  const createTest = async (payload) => {
    return await send({
      query: "addTest",
      data: { ...payload },
    });
  };
  const updateTest = async (id, payload) => {
    return await send({
      query: "editTest",
      id,
      data: { ...payload },
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        // id: initialData?.id,
        code: (values.code || "").trim(),
        type: values.type, // "single" | "panel" | "composite"
        name_en: (values.name_en || "").trim(),
        name_ar: values.name_ar ? values.name_ar.trim() : null,
        sample_type: values.sample_type ? values.sample_type.trim() : null,
        // 👇 دول فقط للـ single
        unit: values.type === "single" ? values.unit?.trim() : null,
        ref_text: values.type === "single" ? values.ref_text?.trim() : null,
        price_iqd: Number(values.price_iqd || 0),
        is_active: values.is_active ? 1 : 0,
        version: values.version ? values.version.trim() : null,
      };

      setLoading(true);

      if (initialData && initialData?.id) {
        let resp = await updateTest(initialData?.id, payload);
        if (!resp.success) {
          setLoading(false);
          message.error("Update Error!.");
          return;
        }
      } else {
        let resp = await createTest(payload);
        if (!resp.success) {
          setLoading(false);
          message.error("Create Error!.");
          return;
        }
      }

      console.log("payload:", payload);
      message.success(editing ? "Saved" : "Created");
      form.resetFields();
      setIsReload(!isReload);
      setInitialData(null);
      setIsModal(false);
    } catch (err) {
      if (!err?.errorFields) {
        message.error(err?.message || "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => setIsModal(false);

  return (
    <Modal
      title={`${editing ? "Edit" : "Create"} Test`}
      open={isModal}
      width={720}
      okText={editing ? "Save" : "Create"}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        // 👇 إذا المستخدم غيّر النوع إلى غير single نفرّغ Unit & ref_text
        onValuesChange={(changed) => {
          if (changed.type && changed.type !== "single") {
            form.setFieldsValue({ unit: null, ref_text: null });
          }
        }}
      >
        <Space style={{ width: "100%" }} wrap>
          <Form.Item
            label="Code"
            name="code"
            style={{ flex: 1, minWidth: 220 }}
            rules={[
              { required: true, message: "Code is required" },
              {
                pattern: /^[A-Z0-9_]+$/i,
                message: "Use letters/numbers/underscore",
              },
            ]}
          >
            <Input placeholder="e.g. FBS, LFT, STOOL" />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            style={{ flex: 1, minWidth: 200 }}
            rules={[{ required: true, message: "Type is required" }]}
          >
            <Select
              options={[
                { value: "single", label: "Single" },
                { value: "panel", label: "Panel" },
                { value: "composite", label: "Composite" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Active"
            name="is_active"
            valuePropName="checked"
            style={{ width: 120 }}
          >
            <Switch />
          </Form.Item>
        </Space>

        <Space style={{ width: "100%" }} wrap>
          <Form.Item
            label="Name (EN)"
            name="name_en"
            style={{ flex: 1, minWidth: 280 }}
            rules={[{ required: true, message: "English name is required" }]}
          >
            <Input placeholder="Fasting Blood Sugar" />
          </Form.Item>
          <Form.Item
            label="Name (AR)"
            name="name_ar"
            style={{ flex: 1, minWidth: 280 }}
          >
            <Input placeholder="سكر صائم" />
          </Form.Item>
        </Space>

        <Space style={{ width: "100%" }} wrap>
          <Form.Item
            label="Sample Type"
            name="sample_type"
            style={{ flex: 1, minWidth: 220 }}
          >
            <Select
              placeholder="Select sample type"
              allowClear
              options={[
                { value: "Whole Blood (EDTA)", label: "Whole Blood (EDTA)" },
                { value: "Serum", label: "Serum" },
                { value: "Plasma", label: "Plasma" },
                { value: "Urine", label: "Urine" },
                { value: "Stool", label: "Stool" },
                { value: "CSF", label: "CSF (Cerebrospinal Fluid)" },
                { value: "Sputum", label: "Sputum" },
                { value: "Swab", label: "Swab (Throat/Vaginal/Wound)" },
                {
                  value: "Body Fluid",
                  label: "Body Fluid (Ascitic/Pleural/Synovial)",
                },
              ]}
            />
          </Form.Item>

          {type === "single" && (
            <Form.Item
              label="Unit"
              name="unit"
              style={{ flex: 1, minWidth: 180 }}
            >
              <Input placeholder="mg/dL, U/L, %, ..." />
            </Form.Item>
          )}

          <Form.Item
            label="Price (IQD)"
            name="price_iqd"
            style={{ width: 180 }}
          >
            <InputNumber min={0} step={500} style={{ width: "100%" }} />
          </Form.Item>
        </Space>

        {type === "single" && (
          <Form.Item label="Reference (ref_text)" name="ref_text">
            <RefTextField />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

// نفس RefTextField تبعك بدون أي تغيير وظيفي
const RefTextField = ({ value = "", onChange }) => {
  const [isJsonMode, setIsJsonMode] = useState(() => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  });

  const [ranges, setRanges] = useState(() => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  });

  const updateRanges = (newRanges) => {
    setRanges(newRanges);
    onChange(JSON.stringify(newRanges));
  };

  const handleAddRange = () => {
    const newRanges = [
      ...ranges,
      { sex: null, low: null, high: null, unit: "" },
    ];
    updateRanges(newRanges);
  };

  const handleRangeChange = (idx, key, val) => {
    const newRanges = ranges.map((r, i) =>
      i === idx ? { ...r, [key]: val } : r
    );
    updateRanges(newRanges);
  };

  const handleRemoveRange = (idx) => {
    const newRanges = ranges.filter((_, i) => i !== idx);
    updateRanges(newRanges);
  };

  return (
    <div>
      <Space style={{ marginBottom: 8 }}>
        <span>Use JSON mode</span>
        <Switch
          checked={isJsonMode}
          onChange={(checked) => {
            setIsJsonMode(checked);
            if (!checked) {
              onChange("");
            } else {
              onChange(JSON.stringify(ranges));
            }
          }}
        />
      </Space>

      {!isJsonMode ? (
        <TextArea
          rows={3}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Plain text like "70-110" or "Negative"'
        />
      ) : (
        <div>
          {ranges.map((r, idx) => (
            <Space key={idx} style={{ marginBottom: 8 }} wrap align="baseline">
              <Select
                placeholder="Sex"
                value={r.sex}
                onChange={(val) => handleRangeChange(idx, "sex", val)}
                style={{ width: 100 }}
                allowClear
                options={[
                  { value: "M", label: "Male" },
                  { value: "F", label: "Female" },
                ]}
              />
              <InputNumber
                placeholder="Low"
                value={r.low}
                onChange={(val) => handleRangeChange(idx, "low", val)}
              />
              <InputNumber
                placeholder="High"
                value={r.high}
                onChange={(val) => handleRangeChange(idx, "high", val)}
              />
              <Input
                placeholder="Unit"
                value={r.unit}
                onChange={(e) => handleRangeChange(idx, "unit", e.target.value)}
                style={{ width: 100 }}
              />
              <Button danger type="link" onClick={() => handleRemoveRange(idx)}>
                Remove
              </Button>
            </Space>
          ))}
          <Button type="dashed" onClick={handleAddRange} block>
            + Add Range
          </Button>
        </div>
      )}
    </div>
  );
};
