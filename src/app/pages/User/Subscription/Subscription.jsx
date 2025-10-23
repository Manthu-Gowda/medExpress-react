import React, { useMemo, useState } from "react";
import { Table, Button, Tag, Radio } from "antd";
import {
  CheckCircleFilled,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import "./Subscription.scss";
import SubHeader from "../../../components/SubHeader/SubHeader";
import CustomModal from "../../../components/CustomModal/CustomModal";


const Subscription = () => {
  const [tab, setTab] = useState("active"); // "active" | "previous"
    const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

    const patients = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    name: "Brahim elabbaoui",
    address: "2nd cross, Banashankari, Bengaluru, Karnataka 562127",
  }));


  // Demo data — swap with your API results.
  const activeRows = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        key: i + 1,
        slno: `${String(i + 1).padStart(2, "0")}`,
        patient: "Brahim elabbaoui",
        date: "12 September 2025",
      })),
    []
  );

  const previousRows = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        key: i + 1,
        slno: `${String(i + 1).padStart(2, "0")}`,
        patient: "Ayman Zahidi",
        date: `0${i + 3} August 2025`,
      })),
    []
  );

  const columns = [
    {
      title: "Sl No",
      dataIndex: "slno",
      key: "slno",
      width: 110,
    },
    {
      title: "Patient Name",
      dataIndex: "patient",
      key: "patient",
      render: (t) => <span className="text-ellipsis">{t}</span>,
    },
    {
      title: "Subscribed Date",
      dataIndex: "date",
      key: "date",
      width: 220,
    },
  ];

  return (
    <div className="subscription">
      <SubHeader title="Subscription" showBack={false} showRight={false} />

      <section className="subscription_sec">
        {/* Plan Banner */}
        <div className="planCard">
          <div className="planCard__left">
            <div className="planCard__badgeRow">
              <Tag className="planCard__badge">Business</Tag>
              <span className="planCard__planTitle">Plan</span>
            </div>

            <ul className="planCard__features">
              <li>
                <CheckCircleFilled />
                <span>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry.
                </span>
              </li>
              <li>
                <CheckCircleFilled />
                <span>
                  It is a long established fact that a reader will be
                  distracted.
                </span>
              </li>
              <li>
                <CheckCircleFilled />
                <span>
                  There are many variations of passages of Lorem Ipsum
                  available.
                </span>
              </li>
            </ul>
          </div>

          <div className="planCard__right">
            <div className="planCard__price">$50</div>
            <Button type="primary" size="large" className="planCard__cta" onClick={() => setOpen(true)}>
              Subscribe
            </Button>
          </div>
        </div>

        {/* Toggle */}
        <div className="subToggle">
          <button
            className={`subToggle__btn ${
              tab === "active" ? "is-active" : ""
            }`}
            onClick={() => setTab("active")}
          >
            Active Subscription
          </button>

          <button
            className={`subToggle__btn ${
              tab === "previous" ? "is-active" : ""
            }`}
            onClick={() => setTab("previous")}
          >
            Previous Subscription
          </button>
        </div>

        {/* Table */}
        <div className="subTableWrap">
          <Table
            rowKey="key"
            columns={columns}
            dataSource={tab === "active" ? activeRows : previousRows}
            pagination={false}
            className="subTable"
          />
        </div>
      </section>

      <CustomModal
        open={open}
        title="Subscription"
        onClose={() => setOpen(false)}
        primaryText="Pay Now"
        dangerText="Cancel"
        onPrimary={() => {
          // your pay logic
          console.log("Pay for patient:", selected);
          setOpen(false);
        }}
        onDanger={() => setOpen(false)}
        primaryProps={{ disabled: !selected }}
      >
        <p style={{ marginBottom: 12, color: "#012047", fontWeight: 600 }}>
          Select Patient for Subscription
        </p>

        {patients.map((p) => (
          <div className="patientItem" key={p.id}>
            <div className="patientItem__text">
              <strong>{p.name}</strong>
              <small>Address : {p.address}</small>
            </div>
            <Radio
              checked={selected === p.id}
              onChange={() => setSelected(p.id)}
            />
          </div>
        ))}
      </CustomModal>
    </div>
  );
};

export default Subscription;
