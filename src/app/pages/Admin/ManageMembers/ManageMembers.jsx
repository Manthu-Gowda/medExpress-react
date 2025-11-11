import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import "./ManageMembers.scss";
import MemberViewModal from "./MemberViewModal";

const pad2 = (n) => String(n).padStart(2, "0");

const ManageMembers = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
   const [open, setOpen] = useState(false);
  const pageSize = 10;

  // MOCK DATA — replace with API response
  const data = useMemo(() => {
    return Array.from({ length: 96 }).map((_, i) => ({
      id: i + 1,
      name: "Brahim elabbaoui",
      email: "brahimelabbaoui1124@gmail.com",
      totalPatients: 6,
    }));
  }, []);

  const columns = [
    {
      title: "Sl No",
      dataIndex: "id",
      width: 90,
      render: (_, __, index) => pad2((page - 1) * pageSize + index + 1),
    },
    {
      title: "Member Name",
      dataIndex: "name",
      ellipsis: true,
      render: (text, record) => (
        <button
          type="button"
          className="mm__name"
          onClick={() => navigate(`/members/${record.id}`)}
          title={text}
        >
          {text}
        </button>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
      render: (text) => <span className="mm__muted">{text}</span>,
    },
    {
      title: "Total Patients",
      dataIndex: "totalPatients",
      width: 150,
      align: "center",
      render: (n) => pad2(n),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Tooltip title="View">
          <button
            type="button"
            className="mm__iconbtn"
            onClick={() => setOpen(true)}
          >
            <EyeOutlined />
          </button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="mm">
      {isLoading && <Loader />}

      <SubHeader title="Manage Members" showBack={false} showRight={false} />

      <section className="mm_sec">
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
        <MemberViewModal open={open} onClose={() => setOpen(false)} />
      </section>
    </div>
  );
};

export default ManageMembers;
