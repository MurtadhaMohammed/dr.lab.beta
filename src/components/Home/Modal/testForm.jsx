import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  InputNumber,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { useHomeStore } from "../../../appStore";
import "./style.css";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import { getPrice, getTotalPrice } from "../../../helper/price";

const { Text } = Typography;

const testLabel = {
  CUSTOME: "Custome",
  PACKAGE: "Package",
};

// const getPrice = (type, record) => {
//   let totalPrice = 0;
//   if (type === "CUSTOME") {
//     totalPrice = record.price;
//   } else if (type === "PACKAGE" && record.customePrice) {
//     totalPrice = record.customePrice;
//   } else if (type === "PACKAGE" && !record.customePrice) {
//     totalPrice = record?.tests
//       ?.map((el) => el?.price)
//       ?.reduce((a, b) => a + b, 0);
//   }

//   return totalPrice || 0;
// };

// const getTotalPrice = (type, tests) => {
//   let totalPrice = tests
//     .map((el) => getPrice(type, el))
//     ?.reduce((a, b) => a + b, 0);
//   return totalPrice || 0;
// };

const TestForm = () => {
  const { testType, isModal, setTests, tests, discount, setDiscount } = useHomeStore();
  const [testsList, setTestList] = useState([]);
  const [packageList, setPackageList] = useState([]);

  const getTests = (querySearch = "") => {
    send({
      query: "getTests",
      data: { querySearch }
    }).then(resp => {
      if (resp.success) {
        setTestList(resp.data);
        console.log("Tests get successfully:", resp.data);
      } else {
        console.error("Error get tests:", resp.error);
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
    });
  };

  const getPackages = (querySearch = "") => {
    send({
      query: "getPackages",
      data: { querySearch }
    }).then(resp => {
      if (resp.success) {
        setPackageList(resp.data);
        console.log("Packages retrieved successfully:", resp.data);
      } else {
        console.error("Error retrieving packages:", resp.error);
      }
    }).catch(err => {
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

  return (
    <div className="test-form">
      <Select
        showSearch
        placeholder={`Select ${testLabel[testType]} test`}
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
        {tests.map((el, i) => (
          <div key={i} className="test-item app-flex-space">
            <Space>
              <Button
                onClick={() => handleDelete(el?.id)}
                size="small"
                type="text"
                icon={<DeleteOutlined />}
              />
              <Text>{testType === "CUSTOME" ? el?.name : el?.title}</Text>
            </Space>
            <Text type="secondary">
              {Number(getPrice(testType, el)).toLocaleString("en")} IQD
            </Text>
          </div>
        ))}
      </div>
      <div className="test-form-footer">
        <div className="overlay-top"></div>
        <div className="app-flex-space">
          <Text type="secondary">Menual discount (Optional) </Text>
          <InputNumber
            value={discount}
            onChange={setDiscount}
            style={{ width: 100 }}
            placeholder="Ex: 5,000"
          />
        </div>
        <Divider />
        <div className="total-values">
          <div className="app-flex-space">
            <Text type="secondary">Total Price </Text>
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
              {Number(getTotalPrice(testType, tests)).toLocaleString("en")} IQD
            </Text>
          </div>
          {discount && (
            <div className="app-flex-space">
              <Text type="secondary">Final Price </Text>
              <Text style={{ fontSize: 18 }}>
                <b>
                  {Number(getTotalPrice(testType, tests) - discount).toLocaleString("en")} IQD
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