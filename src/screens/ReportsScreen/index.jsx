import { Button, Card, DatePicker, Divider, Space } from "antd";
import "./style.css";
import { PureTable } from "../../components/Reports";
import { PureTable as HomeTable } from "../../components/Home";
import { useAppStore, useReportsStore } from "../../libs/appStore";
import { getTotalVisits, getSubTotalAmount } from "../../components/Reports";
import dayjs from "dayjs";
import { send } from "../../control/renderer";
import { getTotalPrice } from "../../helper/price";
import Info from "../../components/Reports/Info";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useLang from "../../hooks/useLang";

const ReportsScreen = () => {
  const { filterDate, setFilterDate, data, setData, setLoading } =
    useReportsStore();
  const { isReload, setIsReload } = useAppStore();
  const { t } = useTranslation();

  const loadData = (cb) => {
    send({
      query: "getVisits",
      data: {
        q: "",
        startDate: dayjs(filterDate[0]).startOf("day").toISOString(),
        endDate: dayjs(filterDate[1]).endOf("day").toISOString(),
      },
    }).then(({ success, data }) => {
      if (success) cb(data);
    });
  };
  const handlePrint = () => {
    // Retrieve font size from localStorage or set a default value
    const fontSize = localStorage.getItem("lab-print-size") || 14; // Default to 14

    loadData((rows) => {
      let _data = {
        date: [
          dayjs(filterDate[0]).format("YYYY-MM-DD"),
          dayjs(filterDate[1]).format("YYYY-MM-DD"),
        ],
        total: Number(data?.totalAmount?.total || 0).toLocaleString("en"),
        subTotal: Number(data?.subTotalAmount?.total || 0).toLocaleString("en"),
        discount: Number(data?.totalDiscount?.total || 0).toLocaleString("en"),
        fontSize,  // Add the font size to the data object
        records: rows?.map((record) => {
          let list = record.tests;
          return {
            name: record?.patient?.name,
            price: Number(
              getTotalPrice(record?.testType, record?.tests)
            ).toLocaleString("en"),
            endPrice: Number(
              getTotalPrice(record?.testType, record?.tests) - record?.discount
            ).toLocaleString("en"),
            tests: list
              .map((el) => el[record.testType === "CUSTOME" ? "name" : "title"])
              .join(","),
            discount: Number(record?.discount).toLocaleString("en"),
            createdAt: dayjs(record?.createdAt).format("DD/MM/YYYY"),
          };
        }),
      };

      send({
        query: "printReport",
        data: _data,
      }).then(({ err, res }) => {
        console.log(err, res);
      });
    });
  };


  useEffect(() => {
    setLoading(true);
    loadData((rows) => {
      getTotalVisits(filterDate, (visits) => {
        getSubTotalAmount(filterDate, async () => {

          let tests = rows?.map((el) => {
            let subTotal = el?.tests
              ?.map((test) => {
                let price =
                  el?.testType === "CUSTOME"
                    ? test?.price
                    : test?.customePrice ||
                    test?.tests
                      ?.map((group) => group?.price)
                      ?.reduce((a, b) => a + b, 0) || 0;

                return price;
              })
              .reduce((a, b) => a + b, 0) || 0;


            return {
              gender: el?.patient?.gender,
              name: el?.patient?.name,
              discount: el?.discount || 0,
              subTotal,
              total: subTotal - (el?.discount || 0),
            };
          });


          let totalAmount = {};
          let subTotalAmount = {};
          let totalDiscount = {};

          totalAmount.total = tests?.map((el) => el.total).reduce((a, b) => a + b, 0) || 0;
          totalAmount.male = tests?.filter((el) => el?.gender === "male")
            .map((el) => el.total)
            .reduce((a, b) => a + b, 0) || 0;
          subTotalAmount.total = tests?.map((el) => el.subTotal)
            .reduce((a, b) => a + b, 0) || 0;
          subTotalAmount.male = tests?.filter((el) => el?.gender === "male")
            .map((el) => el.subTotal)
            .reduce((a, b) => a + b, 0) || 0;
          totalDiscount.total = tests?.map((el) => el.discount)
            .reduce((a, b) => a + b, 0) || 0;
          totalDiscount.male = tests?.filter((el) => el?.gender === "male")
            .map((el) => el.discount)
            .reduce((a, b) => a + b, 0) || 0;

          totalAmount.female = totalAmount.total - totalAmount.male;
          subTotalAmount.female = subTotalAmount.total - subTotalAmount.male;
          totalDiscount.female = totalDiscount.total - totalDiscount.male;


          // Percentage calculations
          subTotalAmount.male = Math.round((subTotalAmount.male / subTotalAmount.total) * 100);
          subTotalAmount.female = Math.round((subTotalAmount.female / subTotalAmount.total) * 100);

          totalAmount.male = Math.round((totalAmount.male / totalAmount.total) * 100);
          totalAmount.female = Math.round((totalAmount.female / totalAmount.total) * 100);

          totalDiscount.male = Math.round((totalDiscount.male / totalDiscount.total) * 100);
          totalDiscount.female = Math.round((totalDiscount.female / totalDiscount.total) * 100);


          setLoading(false);
          setData({ visits, totalAmount, subTotalAmount, totalDiscount });
          setIsReload(!isReload);
        });
      });
    });
  }, [filterDate]);

  const homeTable = useMemo(() => <HomeTable isReport />, [data]);

  return (
    <div className="reports-screen page">
      <div className="border-none  p-[2%]">

        <section className="header app-flex-space mb-[18px]">
          <Space>
            <DatePicker.RangePicker
              allowClear={false}
              value={filterDate}
              onChange={setFilterDate}
            />
            {/* <Divider type="vertical" />
            <InputNumber disabled value={minAge} onChange={setMinAge}/> -
            <InputNumber disabled value={maxAge} onChange={setMaxAge}/>
            <Typography.Text>Years Old</Typography.Text> */}
          </Space>
          <Space>
            <Button disabled={!data || !filterDate} onClick={handlePrint}>
              {t("Print")}
            </Button>
            {/* <Button type="primary" onClick={handleSearch}>
              Search
            </Button> */}
          </Space>
        </section>
        <Divider />
        {/* <PureTable /> */}
        <Info />

        <div className="mt-6">
          {homeTable}
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;
