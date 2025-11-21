import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import "./ManageUsers.scss";
import UserViewModal from "./UserViewModal";
import { GET_MEMBERS_DATA } from "../../../utils/apiPath";
import { postApi } from "../../../utils/apiService";
import EyeIcon from "../../../assets/icons/EyeIcon";
import * as XLSX from "xlsx";
import { formatMMDDYYYY } from "../../../services/dateFormatter";
import { renderStatusCapsule } from "../../../services/statusCapsule";
import CustomTable from "../../../components/CustomTable/CustomTable";

const pad2 = (n) => String(n).padStart(2, "0");

const ManageUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [pageIndex, pageSize, searchString]);

  const fetchMembers = async () => {
    setIsLoading(true);

    const payload = {
      pageIndex,
      pageSize,
      searchString: searchString,
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

  const handleExportAll = async () => {
    try {
      setIsLoading(true);

      if (!total) {
        setIsLoading(false);
        return;
      }

      const payload = {
        pageIndex: 0,
        pageSize: total,
        searchString: "",
        isVerified: true,
      };

      const { statusCode, data } = await postApi(GET_MEMBERS_DATA, payload);

      if (statusCode !== 200 || !Array.isArray(data)) {
        setIsLoading(false);
        return;
      }

      // Remove heavy/unwanted fields first
      const cleanedMembers = data.map(
        ({
          id,
          profilePicture,
          zipCodeId,
          cityId,
          stateId,
          countryId,
          password,
          patients,
          passport,
          visa,
          prescriptions,
          sendOtp,
          ...rest
        }) => rest
      );

      if (!cleanedMembers.length) {
        setIsLoading(false);
        return;
      }

      // Map to export rows with pretty headers and computed values
      const rows = cleanedMembers.map((item) => ({
        "User Name": item.userName || "",
        Email: item.email || item.emailId || "",
        "Country Code": item.countryCode || "",
        "Phone Number": item.phoneNumber || "",
        Address: [item.address1, item.address2].filter(Boolean).join(", "),
        City: item.cityName || "",
        State: item.stateName || "",
        Country: item.countryName || "",
        "Zip Code": item.zipCode || "",
        "Total Patients":
          typeof item.totalPatients === "number" ? item.totalPatients : "",
        Verified:
          item.isVerified === true || item.isVerified === "TRUE"
            ? "TRUE"
            : "FALSE",
        Active:
          item.isActive === true || item.isActive === "TRUE" ? "TRUE" : "FALSE",
        "Created Date": formatMMDDYYYY(item.createdDate),
        "Updated Date": formatMMDDYYYY(item.updatedDate),
      }));

      // Define header order explicitly
      const headerOrder = [
        "User Name",
        "Email",
        "Country Code",
        "Phone Number",
        "Address",
        "City",
        "State",
        "Country",
        "Zip Code",
        "Total Patients",
        "Verified",
        "Active",
        "Created Date",
        "Updated Date",
      ];

      const worksheet = XLSX.utils.json_to_sheet(rows, { header: headerOrder });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

      XLSX.writeFile(workbook, "All User Details.xlsx");

      setIsLoading(false);
    } catch (err) {
      console.error("Export all failed:", err);
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: "Sl No",
      dataIndex: "id",
      width: 90,
      render: (_, __, index) => pad2(pageIndex * pageSize + index + 1),
    },
    {
      title: "User Name",
      dataIndex: "userName",
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
      render: (text) => <span className="mm__muted">{text}</span>,
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      ellipsis: true,
      render: (_, record) => {
        const code = record.countryCode ? `${record.countryCode}` : "";
        const phone = record.phoneNumber || "";

        if (!code && !phone) return "-";

        return `${code} ${phone}`.trim();
      },
    },

    {
      title: "Created Date",
      dataIndex: "createdDate",
      width: 150,
      align: "center",
      render: (value) => formatMMDDYYYY(value),
    },
    {
      title: "Updated date",
      dataIndex: "updatedDate",
      width: 150,
      align: "center",
      render: (value) => formatMMDDYYYY(value),
    },
    {
      title: "Total Patients",
      dataIndex: "totalPatients",
      width: 150,
      align: "center",
      render: (n) => pad2(n),
    },
    {
      title: "Verified Status",
      dataIndex: "isVerified",
      align: "center",
      render: (value) => renderStatusCapsule(value),
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      align: "center",
      render: (_, record) => (
        <button
          type="button"
          className="ap__docBadge ap__viewBtn"
          onClick={() => {
            setSelectedMember(record);
            setOpen(true);
          }}
        >
          <EyeIcon />
          <span className="ap__docBadgeText">View</span>
        </button>
      ),
    },
  ];

  return (
    <div className="mm">
      {isLoading && <Loader />}

      <SubHeader
        title="Manage Users"
        showBack={false}
        showRight={true}
        showPlusIcon={false}
        buttonText="Export All"
        onClick={handleExportAll}
        showSearch={true}
        searchPlaceholder="Search by name, email, phone..."
        // optional: keep it controlled if you want to show current text
        // searchValue={search}
        onSearchDebounced={(val) => {
          setPageIndex(0);         // reset to first page when searching
          setSearchString(val.trim());
        }}
      />

      <section className="mm_sec">
        <div className="mm__tableWrapper">
          <CustomTable
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={members}
            pageIndex={pageIndex}
            pageSize={pageSize}
            total={total}
            onPageChange={(page, size) => {
              setPageIndex(page - 1);
              setPageSize(size);
            }}
          />
          <UserViewModal
            open={open}
            onClose={() => {
              setOpen(false);
              setSelectedMember(null);
            }}
            member={selectedMember}
          />
        </div>
      </section>
    </div>
  );
};

export default ManageUsers;
