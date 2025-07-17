import { Card, Col, Divider, Row, Typography } from "antd";
import chartSvg from "../../assets/fetures/chart.svg";
import profilingSvg from "../../assets/fetures/profiling.svg";
import networkSvg from "../../assets/fetures/network.svg";
import rocketSvg from "../../assets/fetures/rocket.svg";
import qrSvg from "../../assets/fetures/qr.svg";
import messageSvg from "../../assets/fetures/message.svg";
import { useAppTheme } from "../../hooks/useAppThem";

let { Text, Title } = Typography;
const InfoScreen = () => {
  const { appColors } = useAppTheme();
  return (
    <div className="max-w-[800px] m-auto pb-[60px] pt-[60px] page">
      <Title level={4}>ما هو Dr. Lab؟</Title>
      <Text type="secondary">
        Dr. Lab هو نظام متكامل لإدارة المختبرات الطبية، صُمم خصيصًا لتسهيل العمل
        اليومي داخل المختبر، من تسجيل المرضى وإصدار النتائج، إلى إدارة الحسابات
        .
      </Text>
      <Divider className="pt-[20px]" />
      <Title level={4}>المميزات الرئيسية</Title>
      <Row gutter={[20, 20]}>
        <Col span={8}>
          <Card
            className="!border-none"
            style={{ background: appColors.sideMenuBg }}
          >
            <div className="flex items-center justify-center flex-col">
              <img className="w-[120px]" src={profilingSvg} />
              <Text>تسجيل المرضى ونتائج التحاليل .</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            className="!border-none"
            style={{ background: appColors.sideMenuBg }}
          >
            <div className="flex items-center justify-center flex-col">
              <img className="w-[120px]" src={chartSvg} />
              <Text>إدارة حسابات المختبر.</Text>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            className="!border-none"
            style={{ background: appColors.sideMenuBg }}
          >
            <div className="flex items-center justify-center flex-col">
              <img className="w-[120px]" src={networkSvg} />
              <Text>يعمل بدون إنترنت.</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            className="!border-none"
            style={{ background: appColors.sideMenuBg }}
          >
            <div className="flex items-center justify-center flex-col">
              <img className="w-[120px]" src={messageSvg} />
              <Text>الإرسال عبر الواتساب</Text>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            className="!border-none"
            style={{ background: appColors.sideMenuBg }}
          >
            <div className="flex items-center justify-center flex-col">
              <img className="w-[120px]" src={rocketSvg} />
              <Text>التحديث تلقائيًا</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            className="!border-none"
            style={{ background: appColors.sideMenuBg }}
          >
            <div className="flex items-center justify-center flex-col">
              <img className="w-[120px]" src={qrSvg} />
              <Text>توليد وطباعة الباركود للتيوب</Text>
            </div>
          </Card>
        </Col>
      </Row>
      <Divider className="pt-[20px]" />
      <Title level={4}>كيف تستخدم Dr. Lab؟</Title>
    </div>
  );
};

export default InfoScreen;
