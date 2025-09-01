import { Modal, Space, Table, Tag, message, Popover, DatePicker } from "antd";
import "./style.css"; // Ensure this CSS file contains the styles shown below
import { useDoctorStore } from "../../../libs/appStore";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import { getTotalPrice } from "../../../helper/price";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export const DoctorHistory = () => {
  const { id, isHistory, setIsHistory, setReset, filterDate, setFilterDate } =
    useDoctorStore();
  const [data, setData] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!id) return;
    let startDate = filterDate
      ? dayjs(filterDate[0]).startOf("day").toISOString()
      : null;
    let endDate = filterDate
      ? dayjs(filterDate[1]).endOf("day").toISOString()
      : null;

    send({
      query: "getVisitByDoctor",
      data: { doctorId: id, startDate, endDate },
    }).then(({ err, data }) => {
      if (err) message.error(t("Error"));
      else {
        console.log("Doctor History Data: ", data);
        setData(data);
      }
    });
  }, [id, filterDate]);

  const columns = [
    {
      title: t("Tests"),
      dataIndex: "tests",
      key: "tests",
      render: (_, record) => <p>{record.patient.name}</p>,
    },
    {
      title: t("Price"),
      dataIndex: "id",
      key: "id",
      render: (_, record) => (
        <span
          style={
            record?.discount_iqd
              ? {
                  textDecoration: "line-through",
                  opacity: 0.3,
                  fontStyle: "italic",
                }
              : {}
          }
        >
          {Number(getTotalPrice(record?.tests)).toLocaleString("en")}
        </span>
      ),
    },
    {
      title: t("EndPrice"),
      dataIndex: "id",
      key: "id",
      width: 150,
      render: (_, record) => (
        <b style={{ whiteSpace: "nowrap" }}>
          {Number(
            getTotalPrice(record?.tests) - record?.discount_iqd
          ).toLocaleString("en")}{" "}
          IQD
        </b>
      ),
    },
    {
      title: t("Discount"),
      dataIndex: "discount_iqd",
      key: "discount_iqd",
      render: (_, record) =>
        record?.discount_iqd ? (
          <Tag color="geekblue">{`${Number(record?.discount_iqd).toLocaleString(
            "en"
          )} IQD`}</Tag>
        ) : (
          ". . ."
        ),
    },
    {
      title: t("VisitDate"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span style={{ color: "#666" }}>
          {dayjs(createdAt).format("DD/MM/YYYY hh:mm A")}
        </span>
      ),
    },
  ];

  return (
    <Modal
      title={
        data?.length > 0
          ? `${t("DoctorHistoryFor")} ${data[0]?.doctor?.name}`
          : t("DoctorHistory")
      }
      open={isHistory}
      width={"100%"}
      styles={{
        content: {
          height: "92vh",
          marginTop: "4vh",
        },
      }}
      onCancel={() => {
        setIsHistory(false);
        setReset();
      }}
      footer={null}
      centered
      className="doctor-history-modal " // Add a custom class for styling
    >
      <div className="flex justify-between  my-5">
        <DatePicker.RangePicker
          allowClear={false}
          value={filterDate}
          onChange={setFilterDate}
        />
        <div className="flex justify-between items-center gap-2">
          <p> {t("DoctorTotal")}</p>
          <p className="flex items-center gap-2">
            {data?.length > 0
              ? (() => {
                  const totalAmount = data?.reduce((acc, item) => {
                    return (
                      acc + (getTotalPrice(item?.tests) - item?.discount_iqd)
                    );
                  }, 0);

                  const doctorFeePercentage =
                    Number(data[0]?.doctor?.doctor_fee) || 0;
                  const doctorFeeAmount =
                    (totalAmount * doctorFeePercentage) / 100;
                  return (
                    <>
                      <span>
                        {Number(totalAmount).toLocaleString("en")} IQD
                      </span>
                      {doctorFeePercentage > 0 && (
                        <>
                          <span>|</span>
                          <span>
                            <strong>
                              Doctor Fee :{" "}
                              {Number(doctorFeeAmount).toLocaleString("en")} IQD
                            </strong>
                          </span>
                        </>
                      )}
                    </>
                  );
                })()
              : "0 IQD"}
          </p>
        </div>
      </div>
      <div className="history-table-container">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          size="small"
          rowKey={(record) => record.id}
        />
      </div>
    </Modal>
  );
};
