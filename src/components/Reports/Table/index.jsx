import { Table, Tag, Typography, message } from "antd";
import "./style.css";
import dayjs from "dayjs";
import { useReportsStore } from "../../../libs/appStore";
import { send } from "../../../control/renderer";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export const getTotalVisits = (filterDate = null, cb) => {
  send({
    query: "getTotalVisits",
    data: {
      startDate: dayjs(filterDate[0]).startOf("day").toISOString(),
      endDate: dayjs(filterDate[1]).endOf("day").toISOString(),
    },
  }).then(({ success, total }) => {
    if (!success) message.error(t("Error"));
    else cb({ total });
  });
};

export const getSubTotalAmount = (filterDate = null, cb) => {
  send({
    query: "getVisits",
    data: {
      startDate: dayjs(filterDate[0]).startOf("day").toISOString(),
      endDate: dayjs(filterDate[1]).endOf("day").toISOString(),
    },
  }).then(({ success, data }) => {
    if (!success) message.error("Error !");
    else cb(data);
  });
};

export const PureTable = () => {
  const { data, loading, setSubTotalPrice, setTotalDiscount, setTotalAmount } = useReportsStore();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (data) {
      setSubTotalPrice(data?.subTotalAmount?.total || 0);
      setTotalDiscount(data?.totalDiscount?.total || 0);
      setTotalAmount(data?.totalAmount?.total || 0);
      setIsLoading(false);
    }
  }, [data, setSubTotalPrice, setTotalDiscount, setTotalAmount]);

  const columns = [
    {
      title: t("ReportTitle"),
      dataIndex: "title",
      key: "title",
      render: (val) => <b>{val}</b>,
    },
    {
      title: t("Total"),
      dataIndex: "total",
      key: "total",
    },
    {
      title: t("Male"),
      dataIndex: "male",
      key: "male",
      render: (val) => (
        <Typography.Text style={{ fontSize: 18 }}>{val}</Typography.Text>
      ),
    },
    {
      title: t("Female"),
      dataIndex: "female",
      key: "female",
      render: (val) => (
        <Typography.Text style={{ fontSize: 18 }}>{val}</Typography.Text>
      ),
    },
  ];

  let records = [
    {
      id: 1,
      title: t("Totalvisits"),
      total: <Tag color="geekblue">{data?.visits?.total || 0}</Tag>,
      male: `${data?.visits?.male || 0}%`,
      female: `${data?.visits?.female || 0}%`,
    },
    {
      id: 2,
      title: t("SubTotalAmounts"),
      total: (
        <b style={{ fontSize: 14 }}>
          {Number(data?.subTotalAmount?.total || 0).toLocaleString("en")} IQD
        </b>
      ),
      male: `${data?.subTotalAmount?.male || 0}%`,
      female: `${data?.subTotalAmount?.female || 0}%`,
    },
    {
      id: 3,
      title: t("TotalDiscount"),
      total: (
        <b style={{ fontSize: 14 }}>
          {Number(data?.totalDiscount?.total || 0).toLocaleString("en")} IQD
        </b>
      ),
      male: `${data?.totalDiscount?.male || 0}%`,
      female: `${data?.totalDiscount?.female || 0}%`,
    },
    {
      id: 4,
      title: <span style={{ fontSize: 18 }}>{t("TotalAmounts")}</span>,
      total: (
        <b style={{ fontSize: 18 }}>
          {Number(data?.totalAmount?.total || 0).toLocaleString("en")} IQD
        </b>
      ),
      male: `${data?.totalAmount?.male || 0}%`,
      female: `${data?.totalAmount?.female || 0}%`,
    },
  ];

  return (
    <Table
      style={{ marginTop: "-16px" }}
      columns={columns}
      dataSource={data ? records : []}
      pagination={false}
      size="small"
      loading={isLoading}
    />
  );
};
