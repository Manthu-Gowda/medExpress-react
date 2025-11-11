import React, { useMemo, useState, useEffect } from "react";
import { Table } from "antd";
import { FileTextFilled } from "@ant-design/icons";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import AssignShipperModal from "./AssignShipperModal";
import "./PendingAssignees.scss";

const pad2 = (n) => String(n).padStart(2, "0");

const PendingAssignees = () => {
  const [isLoading] = useState(false);
  const [tab, setTab] = useState("pending"); // 'pending' | 'assigned'
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const pageSize = 10;

  // reset page when tab changes
  useEffect(() => setPage(1), [tab]);

  // ---- MOCK DATA ---- replace with API results per tab
  const pendingData = useMemo(
    () =>
      Array.from({ length: 63 }).map((_, i) => ({
        id: i + 1,
        name: "Brahim elabbaoui",
        phone: "+91 9876543210",
        email: "brahimelabbaoui1124@gmail.com",
        location: "2nd cross, Banashankari, Bengaluru, Karnataka 562127",
        docs: 3,
      })),
    []
  );

  const assignedData = useMemo(
    () =>
      Array.from({ length: 63 }).map((_, i) => ({
        id: i + 1,
        name: "Brahim elabbaoui",
        phone: "+91 9876543210",
        email: "brahimelabbaoui1124@gmail.com",
        location: "2nd cross, Banashankari, Bengaluru, Karnataka 562127",
        shipperName: "Eduardo Thomaz",
      })),
    []
  );

  // ---- Columns (two sets) ----
  const baseCols = [
    {
      title: "Sl No",
      dataIndex: "id",
      width: 90,
      render: (_, __, index) => pad2((page - 1) * pageSize + index + 1),
    },
    {
      title: "Patient Name",
      dataIndex: "name",
      ellipsis: true,
      render: (text) => (
        <button className="pa__link" title={text}>
          {text}
        </button>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      width: 180,
      render: (t) => <span className="pa__strong">{t}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
      render: (t) => <span className="pa__muted">{t}</span>,
    },
    {
      title: "Location",
      dataIndex: "location",
      ellipsis: true,
      render: (t) => <span className="pa__muted">{t}</span>,
    },
  ];

  const columnsPending = [
    ...baseCols,
    {
      title: "Documents",
      dataIndex: "docs",
      width: 130,
      align: "center",
      render: () => (
        <span className="pa__docBadge">
          <FileTextFilled />
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      align: "center",
      render: (_, record) => (
        <button
          type="button"
          className="pa__assignBtn"
          onClick={() => {
            setSelectedRow(record);
            setOpen(true);
          }}
        >
          Assign
        </button>
      ),
    },
  ];

  const columnsAssigned = [
    ...baseCols,
    {
      title: "Shipper Name",
      dataIndex: "shipperName",
      width: 220,
      render: (t) => <span className="pa__strong">{t}</span>,
    },
  ];

  const dataSource = tab === "pending" ? pendingData : assignedData;
  const columns = tab === "pending" ? columnsPending : columnsAssigned;

  return (
    <div className="pa">
      {isLoading && <Loader />}

      <SubHeader title="Pending Assignees" showBack={false} showRight={false} />

      {/* Toggle */}
      <div className="subToggle">
        <button
          className={`subToggle__btn ${tab === "pending" ? "is-active" : ""}`}
          onClick={() => setTab("pending")}
        >
          Pending Patients
        </button>
        <button
          className={`subToggle__btn ${tab === "assigned" ? "is-active" : ""}`}
          onClick={() => setTab("assigned")}
        >
          Assigned Patients
        </button>
      </div>

      <section className="pa_sec">
        <Table
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={dataSource}
          pagination={{
            current: page,
            pageSize,
            total: dataSource.length,
            showSizeChanger: false,
            itemRender: (_, type, original) => {
              if (type === "prev") return <a>« Previous</a>;
              if (type === "next") return <a>Next »</a>;
              return original;
            },
          }}
          onChange={(pg) => setPage(pg.current)}
        />
      </section>

      {/* Assign only for Pending tab */}
      {tab === "pending" && (
        <AssignShipperModal
          open={open}
          onClose={() => setOpen(false)}
          patient={selectedRow}
          onAssigned={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default PendingAssignees;
