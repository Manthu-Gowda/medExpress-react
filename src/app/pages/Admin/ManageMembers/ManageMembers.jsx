import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import "./ManageMembers.scss";
import MemberViewModal from "./MemberViewModal";
import { use } from "react";
import { GET_MEMBERS_DATA } from "../../../utils/apiPath";
import { postApi } from "../../../utils/apiService";
import EyeIcon from "../../../assets/icons/EyeIcon";

const pad2 = (n) => String(n).padStart(2, "0");

const ManageMembers = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null); // 👈 NEW

  useEffect(() => {
    fetchMembers();
  }, [pageIndex, pageSize]);

  const fetchMembers = async () => {
    setIsLoading(true);

    const payload = {
      pageIndex,
      pageSize,
      searchString: "",
      isVerified: true,
    };

    const { statusCode, data, totalRecords } = await postApi(
      GET_MEMBERS_DATA,
      payload
    );

    if (statusCode === 200 && data) {
      setMembers(data);
      setTotal(totalRecords);
    }

    setIsLoading(false);
  };

  const columns = [
    {
      title: "Sl No",
      dataIndex: "id",
      width: 90,
      render: (_, __, index) => pad2(pageIndex * pageSize + index + 1),
    },
    {
      title: "Member Name",
      dataIndex: "userName",
      ellipsis: true,
      render: (text, record) => (
        <button
          type="button"
          className="mm__name"
          title={text}
          onClick={() => {
            setSelectedMember(record); // 👈 pass full record
            setOpen(true);
          }}
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
            onClick={() => {
              setSelectedMember(record); // 👈 pass full record
              setOpen(true);
            }}
          >
            <EyeIcon />
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
          dataSource={members}
          pagination={{
            current: pageIndex + 1,
            pageSize,
            total,
            showSizeChanger: false,
            itemRender: (pageItem, type, originalElement) => {
              if (type === "prev") return <a>« Previous</a>;
              if (type === "next") return <a>Next »</a>;
              return originalElement;
            },
          }}
          onChange={(pg) => {
            setPageIndex(pg.current - 1);
          }}
        />

        <MemberViewModal
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedMember(null);
          }}
          member={selectedMember} // 👈 send selected member
        />
      </section>
    </div>
  );
};

export default ManageMembers;
