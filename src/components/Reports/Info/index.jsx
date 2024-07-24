import { Col, Row, Statistic, Typography } from "antd";
import { useReportsStore } from "../../../appStore";
import { UserOutlined } from "@ant-design/icons";
const Info = () => {
  const { data, loading } = useReportsStore();

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Statistic loading={loading} title="Total visits" value={data?.visits?.total || 0}  prefix={<UserOutlined/>}/>
      </Col>
      <Col span={6}>
        <Statistic
        loading={loading}
          title="Sub Total Amounts"
          value={data?.subTotalAmount?.total || 0}
          precision={2}
          suffix={<Typography.Text type="secondary">IQD</Typography.Text>}
        />
      </Col>
      <Col span={6}>
        <Statistic
        loading={loading}
          title="Total Discount"
          value={data?.totalDiscount?.total || 0}
          precision={2}
          suffix={<Typography.Text type="secondary">IQD</Typography.Text>}
        />
      </Col>
      <Col span={6}>
        <Statistic
        loading={loading}
          title="Total Amounts"
          value={data?.totalAmount?.total || 0}
          precision={2}
          suffix={<Typography.Text type="secondary">IQD</Typography.Text>}
        />
      </Col>
    </Row>
  );
};
export default Info;
