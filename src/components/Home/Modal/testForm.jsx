import {
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Typography,
} from "antd";
import { useHomeStore } from "../../../libs/appStore";
import "./style.css";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import { getPrice, getTotalPrice } from "../../../helper/price";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../../hooks/useAppThem";

const { Text } = Typography;

const TestForm = () => {
  const { testType, isModal, setTests, tests, discount, setDiscount } =
    useHomeStore();
  const [testsList, setTestList] = useState([]);
  const [packageList, setPackageList] = useState([]);
  const [editTest, setEditTest] = useState(null);
  const { t } = useTranslation();
  const { appTheme, appColors } = useAppTheme();
  const testLabel = {
    CUSTOME: t("Custom"),
    PACKAGE: t("Package"),
  };

  let skip = 0; // Initialize skip (offset)
  const limit = 10; // Set the limit for the number of tests per batch

  const getTests = (querySearch = "") => {
    send({
      query: "getTests",
      data: { q: querySearch, skip, limit }, // Send skip and limit to backend
    })
      .then((resp) => {
        if (resp.success) {
          if (skip === 0) {
            setTestList(resp.data);
          } else {
            setTestList((prev) => [...prev, ...resp.data]);
          }

          if (resp.data.length === limit) {
            skip += limit;
          }
        } else {
          console.error("Error fetching tests:", resp.error);
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  };

  const getPackages = (querySearch = "") => {
    send({
      query: "getPackages",
      data: { querySearch },
    })
      .then((resp) => {
        if (resp.success) {
          setPackageList(resp.data);
        } else {
          console.error("Error retrieving packages:", resp.error);
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  };

  const handleSelect = (testID) => {
    let selectedObj =
      testType === "CUSTOME"
        ? testsList.find((el) => el?.id === testID)
        : packageList.find((el) => el?.id === testID);
    if (!selectedObj) return;
    setTests([...tests, selectedObj]);
  };

  const handleDelete = (testID) => {
    setTests(tests?.filter((el) => el?.id !== testID));
  };

  useEffect(() => {
    if (isModal && testType === "CUSTOME") getTests();
    else if (isModal && testType === "PACKAGE") getPackages();
  }, [isModal, testType]);

  // Function to get price with condition to handle negative price
  const getPriceWithCondition = (type, item) => {
    const price = getPrice(type, item);
    return price > 0 ? price : 0;
  };

  // Function to get total price with condition to handle negative total
  const getTotalPriceWithCondition = (type, items) => {
    if (editTest)
      items = items?.map((el) => {
        if (el?.id === editTest?.id) return editTest;
        else return el;
      });
    const totalPrice = getTotalPrice(type, items);
    return totalPrice > 0 ? totalPrice : 0;
  };

  const handleEditChange = (name, value) => {
    editTest[name] = value;
    setEditTest({ ...editTest });
  };

  const handleSaveEdit = () => {
    send({
      query: "editTest",
      data: { ...editTest },
      id: editTest?.id,
    })
      .then((resp) => {
        if (resp.success) {
          message.success(t("Test updated successfully"));
          getTests();
          setTests(
            tests?.map((el) => {
              if (el?.id === editTest?.id) return editTest;
              else return el;
            })
          );
          setEditTest(null);
        } else {
          console.error("Error updating test:", resp.error);
          message.error("Failed to update test.");
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
        message.error("Failed to communicate with server.");
      });
  };

  return (
    <div className="test-form">
      <Select
        showSearch
        placeholder={t("SelectCustomTest", { custom: testLabel[testType] })}
        optionFilterProp="children"
        onSelect={handleSelect}
        style={{ width: "100%" }}
        onSearch={(input) => {
          if (testType === "CUSTOME") getTests(input);
          else if (testType === "PACKAGE") getPackages(input);
        }}
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        options={
          testType === "CUSTOME"
            ? testsList?.map((el) => {
                return {
                  label: el?.name,
                  value: el?.id,
                  disabled: !!tests.find((item) => item?.id === el?.id),
                };
              })
            : packageList?.map((el) => {
                return {
                  label: el?.title,
                  value: el?.id,
                  disabled: !!tests.find((item) => item?.id === el?.id),
                };
              })
        }
      />

      <div className="test-list">
        {tests?.map((el, i) =>
          editTest && editTest?.id === el?.id && testType === "CUSTOME" ? (
            <div key={i} className="test-item app-flex-space">
              <Space>
                <Space size={4}>
                  <Button
                    onClick={() => setEditTest(null)}
                    size="small"
                    type="text"
                    className="text-[#a5a5a5]"
                    icon={<CloseOutlined />}
                  />
                  <Button
                    onClick={() => handleSaveEdit()}
                    size="small"
                    type="text"
                    icon={<CheckOutlined className="text-[#33a733]" />}
                  />
                </Space>
                <Divider type="vertical" style={{ margin: 0 }} />
                <Input
                  size="small"
                  className="w-[170]"
                  value={editTest?.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                />
              </Space>
              <Space>
                <InputNumber
                  size="small"
                  className="w-[80px]"
                  value={editTest?.price}
                  onChange={(value) => handleEditChange("price", value)}
                />
                <Text type="secondary">IQD</Text>
              </Space>
            </div>
          ) : (
            <div
              key={i}
              className="test-item app-flex-space"
              style={{
                borderColor: appColors.colorBorder,
              }}
            >
              <Space>
                <Space size={4}>
                  <Button
                    onClick={() => handleDelete(el?.id)}
                    size="small"
                    type="text"
                    className="text-[#a5a5a5]"
                    icon={<DeleteOutlined />}
                  />
                  {testType === "CUSTOME" && (
                    <Button
                      onClick={() => setEditTest(el)}
                      size="small"
                      type="text"
                      icon={<EditOutlined />}
                    />
                  )}
                </Space>
                <Divider type="vertical" style={{ margin: 0 }} />
                <Text>{testType === "CUSTOME" ? el?.name : el?.title}</Text>
              </Space>
              <Text type="secondary">
                {Number(getPriceWithCondition(testType, el)).toLocaleString(
                  "en"
                )}{" "}
                IQD
              </Text>
            </div>
          )
        )}
      </div>
      <div
        className={`inset-x-0 bottom-[10px] relative ${
          appTheme === "dark" ? "bg-[#1f1f1f]" : "bg-white"
        }`}
      >
        <div
          className={`absolute inset-x-0 top-[-20px] h-5 bg-gradient-to-t ${
            appTheme === "dark" ? "from-[#1f1f1f]" : "from-white"
          } to-transparent z-[99]`}
        ></div>
        <div className="app-flex-space">
          <Text type="secondary">
            {t("MenualDiscount")} {t("Optional")}{" "}
          </Text>
          <InputNumber
            value={discount}
            onChange={setDiscount}
            style={{ width: 100 }}
            placeholder="Ex: 5,000"
            min={0}
          />
        </div>
        <Divider />
        <div
          className="border border-dashed  rounded-lg p-2 px-4"
          style={{
            backgroundColor: appColors.sideMenuBg,
            borderColor: appColors.colorBorder,
          }}
        >
          <div className="app-flex-space">
            <Text type="secondary">{t("TotalPrice")} </Text>
            <Text
              style={
                discount
                  ? {
                      textDecoration: "line-through",
                      opacity: 0.3,
                      fontStyle: "italic",
                      fontWeight: "normal",
                    }
                  : { fontSize: 18, fontWeight: "bold" }
              }
            >
              {Number(
                getTotalPriceWithCondition(testType, tests)
              ).toLocaleString("en")}{" "}
              IQD
            </Text>
          </div>
          {discount && (
            <div className="app-flex-space">
              <Text type="secondary">{t("FinalPrice")}</Text>
              <Text style={{ fontSize: 18 }}>
                <b>
                  {Number(
                    getTotalPriceWithCondition(testType, tests) - discount > 0
                      ? getTotalPriceWithCondition(testType, tests) - discount
                      : 0
                  ).toLocaleString("en")}{" "}
                  IQD
                </b>
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestForm;
