import { Col, Row, Statistic, Typography } from "antd";
import { useReportsStore } from "../../../libs/appStore";
import { UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const Info = () => {
  const { data, loading } = useReportsStore();
  const { t } = useTranslation();
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Statistic loading={loading} title={t("Totalvisits")} value={data?.visits?.total || 0} prefix={<UserOutlined />} />
      </Col>
      <Col span={6}>
        <Statistic
          loading={loading}
          title={t("SubTotalAmounts")}
          value={data?.subTotalAmount?.total || 0}
          precision={2}
          suffix={<Typography.Text type="secondary">IQD</Typography.Text>}
        />
      </Col>
      <Col span={6}>
        <Statistic
          loading={loading}
          title={t("TotalDiscount")}
          value={data?.totalDiscount?.total || 0}
          precision={2}
          suffix={<Typography.Text type="secondary">IQD</Typography.Text>}
        />
      </Col>
      <Col span={6}>
        <Statistic
          loading={loading}
          title={t("TotalAmounts")}
          value={data?.totalAmount?.total || 0}
          precision={2}
          suffix={<Typography.Text type="secondary">IQD</Typography.Text>}
        />
      </Col>
    </Row>
  );
};
export default Info;
