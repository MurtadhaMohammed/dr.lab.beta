import { DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useAppStore, useGroupStore } from "../../../appStore";
import "./style.css";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";

const { Text } = Typography;

export const PureModal = () => {
  const { setIsReload, isReload } = useAppStore();
  const {
    isModal,
    setIsModal,
    tests,
    setTests,
    title,
    setTitle,
    customePrice,
    setCustomePrice,
    id,
    createdAt,
    setReset,
  } = useGroupStore();
  const [testsList, setTestsList] = useState([]);

  const getTests = (querySearch) => {
    let queryKey = new RegExp(querySearch, "gi");

    send({
      query: "getTests",
      data: {}
    }).then(resp => {
      if (resp.success) {
        setTestsList(resp.data);
        console.log("Tests fetched successfully:", resp.data);
      } else {
        console.error("Error fetching tests:", resp.error);
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
    });


  };

  useEffect(() => {
    if (isModal) {
      getTests("");
    }
  }, [isModal]);

  const handleSelect = (testID) => {
    let selectedObj = testsList.find((el) => el?.id === testID);
    if (!selectedObj) return;
    setTests([...tests, selectedObj]);
  };

  const handleDelete = (testID) => {
    setTests(tests?.filter((el) => el?.id !== testID));
  };



  const handleSubmit = () => {
    let data = {
      title,
      customePrice,
      tests: tests.map(el => ({ id: el.id })),
      createdAt: Date.now(),
    };
    if (id) {
      send({
        query: "editPackage",
        data: { ...data },
        id
      }).then(resp => {
        if (resp.success) {
          console.log("Package updated successfully");
          setReset();
          setIsModal(false);
          setIsReload(!isReload);
        } else {
          console.error("Error updating package:", resp.error);
          message.error("Failed to update package.");
        }
      }).catch(err => {
        console.error("Error in IPC communication:", err);
        message.error("Failed to communicate with server.");
      });


      // send({
      //   doc: "packages",
      //   query: "update",
      //   condition: { id: id },
      //   data: { ...data, createdAt },
      // }).then(({ err }) => {
      //   if (err) message.error("Error !");
      //   else {
      //     message.success("Save Succefful.");
      //     setReset();
      //     setIsModal(false);
      //     setIsReload(!isReload);
      //   }
      // });

    } else {
      // send({
      //   doc: "packages",
      //   query: "insert",
      //   data: { ...data, createdAt: Date.now() },
      // }).then(({ err }) => {
      //   if (err) message.error("Error !");
      //   else {
      //     message.success("Save Succefful.");
      //     setReset();
      //     setIsModal(false);
      //     setIsReload(!isReload);
      //   }
      // });

      // For adding a new package
      send({
        query: "addPackage",
        data: { ...data },
      }).then(resp => {
        if (resp.success) {
          console.log("Package added with ID:", resp.data);
          setReset();
          setIsModal(false);
          setIsReload(!isReload);
        } else {
          console.error("Error adding package:", resp.error);
          message.error("Failed to add package.");
        }
      }).catch(err => {
        console.error("Error in IPC communication:", err);
        message.error("Failed to communicate with server.");
      });
    }
  };

  return (
    <Modal
      title={`${id ? "Edit" : "Create"} New Package`}
      open={isModal}
      width={400}
      onCancel={() => {
        setIsModal(false);
      }}
      footer={
        <Space>
          <Button
            onClick={() => {
              setIsModal(false);
            }}
          >
            Close
          </Button>
          <Button
            disabled={tests?.length === 0 || !title}
            onClick={handleSubmit}
            type="primary"
          >
            Save
          </Button>
        </Space>
      }
      centered
    >
      <div className="create-package-modal">
        <div className="test-form">
          <Select
            showSearch
            placeholder="Select a test"
            optionFilterProp="children"
            style={{ width: "100%" }}
            onSearch={getTests}
            onSelect={handleSelect}
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={testsList?.map((el) => {
              return {
                label: el?.name,
                value: el?.id,
                disabled: !!tests.find((item) => item?.id === el?.id),
              };
            })}
          />

          <div className="test-list">
            {tests?.map((el, i) => (
              <div key={i} className="test-item app-flex-space">
                <Space>
                  <Button
                    onClick={() => handleDelete(el?.id)}
                    size="small"
                    type="text"
                    icon={<DeleteOutlined />}
                  />
                  <Text>{el?.name}</Text>
                </Space>
                <Text type="secondary">
                  {Number(el?.price).toLocaleString("en")} IQD
                </Text>
              </div>
            ))}
          </div>
          <div className="test-form-footer">
            <div className="overlay-top"></div>
            <Row gutter={[16, 16]}>
              <Col span={15}>
                <Space style={{ width: "100%" }} direction="vertical" size={3}>
                  <Text>Package title</Text>
                  <Input
                    placeholder="Ex: Lipid profile"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Space>
              </Col>
              <Col span={9}>
                <Space direction="vertical" size={3}>
                  <Tooltip title="Custome price on this package instead of total">
                    <Space size={3}>
                      <Text>Custome Price</Text>
                      <InfoCircleOutlined
                        style={{ color: "#ff0000", fontSize: 14 }}
                      />
                    </Space>
                  </Tooltip>
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Ex: 5,000"
                    value={customePrice}
                    onChange={(val) => setCustomePrice(val)}
                  />
                </Space>
              </Col>
            </Row>

            <Divider />
            <div className="total-values">
              <div className="app-flex-space">
                <Text type="secondary"> Total Price </Text>
                <Text
                  style={
                    customePrice
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
                    tests?.map((el) => el?.price)?.reduce((a, b) => a + b, 0)
                  ).toLocaleString("en")}
                  IQD
                </Text>
              </div>
              {customePrice && (
                <div className="app-flex-space">
                  <Text type="secondary">Final Price </Text>
                  <Text style={{ fontSize: 18 }}>
                    <b>{Number(customePrice).toLocaleString("en")} IQD</b>
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
