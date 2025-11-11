import React, { useMemo, useState } from "react";
import { Table } from "antd";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import NewShipperModal from "./NewShipperModal";
import "./MedicalShippers.scss";

const pad2 = (n) => String(n).padStart(2, "0");

const MedicalShippers = () => {
  const [isLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const pageSize = 10;

  // MOCK DATA — replace with API data
  const data = useMemo(
    () =>
      Array.from({ length: 96 }).map((_, i) => ({
        id: i + 1,
        shipperName: "Eduardo Thomaz",
        phone: "+91 9876543210",
        email: "eduardothomaz1124@gmail.com",
        location: "2nd cross, Banashankari, Bengaluru, Karnataka 562127",
        totalShipments: 134,
      })),
    []
  );

  const columns = [
    {
      title: "Sl No",
      dataIndex: "id",
      width: 90,
      render: (_, __, index) => pad2((page - 1) * pageSize + index + 1),
    },
    {
      title: "Shipper Name",
      dataIndex: "shipperName",
      ellipsis: true,
      render: (text) => (
        <button type="button" className="ms__link" title={text}>
          {text}
        </button>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      width: 180,
      render: (t) => <span className="ms__strong">{t}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
      render: (t) => <span className="ms__muted">{t}</span>,
    },
    {
      title: "Location",
      dataIndex: "location",
      ellipsis: true,
      render: (t) => <span className="ms__muted">{t}</span>,
    },
    {
      title: "Total Shipments",
      dataIndex: "totalShipments",
      width: 160,
      align: "center",
    },
  ];

  return (
    <div className="ms">
      {isLoading && <Loader />}

      <SubHeader
        title="Manage Medical Shippers"
        showBack={false}
        showRight={true}
        buttonText="Add New Shipper"
        onClick={() => setOpen(true)}
      />

      <section className="ms_sec">
        <Table
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={{
            current: page,
            pageSize,
            total: data.length,
            showSizeChanger: false,
            itemRender: (pageItem, type, originalElement) => {
              if (type === "prev") return <a>« Previous</a>;
              if (type === "next") return <a>Next »</a>;
              return originalElement;
            },
          }}
          onChange={(pg) => setPage(pg.current)}
        />
      </section>

      {/* Modal */}
      <NewShipperModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(newItem) => {
          console.log("Created:", newItem);
          setOpen(false);
        }}
      />
    </div>
  );
};

export default MedicalShippers;
