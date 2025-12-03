// src/pages/Admin/PendingAssignees/PendingAssignees.jsx
import React, { useEffect, useState } from "react";
import { FileTextFilled, EyeOutlined } from "@ant-design/icons";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import AssignShipperModal from "./AssignShipperModal";
import "./PendingAssignees.scss";

import { postApi } from "../../../utils/apiService";
import { GET_ALL_ASSIGNIES_PATIENTS } from "../../../utils/apiPath";
import CustomTable from "../../../components/CustomTable/CustomTable";
import { formatMMDDYYYY } from "../../../services/dateFormatter";
import { Popover } from "antd";
import * as XLSX from "xlsx";

const pad2 = (n) => String(n).padStart(2, "0");

const PendingAssignees = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState("pending"); // 'pending' | 'assigned'
  const [pageIndex, setPageIndex] = useState(0); // 0-based for API
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState([]);
  const [searchString, setSearchString] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    setPageIndex(0);
    setSearchString("");
  }, [tab]);

  useEffect(() => {
    fetchPatients();
  }, [tab, pageIndex, pageSize, searchString]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);

      const payload = {
        pageIndex,
        pageSize,
        searchString,
        isAssignedToShipper: tab === "assigned",
      };

      const { statusCode, data, totalRecords } = await postApi(
        GET_ALL_ASSIGNIES_PATIENTS,
        payload
      );

      if (statusCode === 200 && Array.isArray(data)) {
        setRows(data);
        setTotal(totalRecords || 0);
      } else {
        setRows([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("GET_ALL_ASSIGNIES_PATIENTS error:", err);
      setRows([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const baseCols = [
    {
      title: "Sl No",
      dataIndex: "id",
      render: (_, __, index) => pad2(pageIndex * pageSize + index + 1),
    },
    {
      title: "Patient Name",
      dataIndex: "name",
      ellipsis: true,
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      render: (_, record) => {
        const code = record.countryCode || "";
        const phone = record.phoneNumber || "";
        const value = `${code} ${phone}`.trim();
        return <span className="pa__strong">{value || "-"}</span>;
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
    },
    {
      title: "Location",
      dataIndex: "address1",
      ellipsis: true,
      render: (_, record) => {
        const parts = [
          record.address1,
          record.address2,
          record.cityName,
          record.stateName,
          record.countryName,
          record.zipCode,
        ].filter(Boolean);

        const full = parts.join(", ");
        if (!full) {
          return <span className="pa__muted">-</span>;
        }

        const limit = 30;
        const isLong = full.length > limit;
        const short = isLong ? `${full.slice(0, limit)}...` : full;

        return (
          <span className="pa__muted pa__locationCell">
            {short}
            {isLong && (
              <Popover
                trigger="click"
                placement="top"
                content={<div className="pa__addrPopoverContent">{full}</div>}
              >
                <EyeOutlined onClick={(e) => e.stopPropagation()} />
              </Popover>
            )}
          </span>
        );
      },
    },
  ];

  const columnsPending = [
    ...baseCols,
    // {
    //   title: "Documents",
    //   dataIndex: "docs",
    //   align: "center",
    //   render: (_, record) => {
    //     // If you only want to count prescriptions:
    //     const prescCount = Array.isArray(record.prescriptions)
    //       ? record.prescriptions.length
    //       : 0;

    //     const hasDocs =
    //       prescCount > 0 || !!record.passport?.url || !!record.visa?.url;

    //     return (
    //       <span
    //         className={`pa__docBadge ${
    //           hasDocs ? "" : "pa__docBadge--disabled"
    //         }`}
    //       >
    //         <FileTextFilled />
    //       </span>
    //     );
    //   },
    // },
    {
      title: "Action",
      key: "action",
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
      dataIndex: "shipperName", // make sure backend returns this field
      width: 220,
      render: (t) => <span className="pa__strong">{t || "-"}</span>,
    },
    {
      title: "Assigned Date",
      dataIndex: "assignedDate", // optional if your API has this
      width: 150,
      align: "center",
      render: (value) => (value ? formatMMDDYYYY(value) : "-"),
    },
  ];

  const columns = tab === "pending" ? columnsPending : columnsAssigned;

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
        isAssignedToShipper: tab === "assigned",
      };

      const { statusCode, data } = await postApi(
        GET_ALL_ASSIGNIES_PATIENTS,
        payload
      );

      if (statusCode !== 200 || !Array.isArray(data)) {
        setIsLoading(false);
        return;
      }

      // Remove unwanted fields
      const cleanedPatients = data.map(
        ({
          id,
          zipCodeId,
          cityId,
          stateId,
          countryId,
          visaType,
          passport,
          visa,
          prescriptions,
          ...rest
        }) => rest
      );

      if (!cleanedPatients.length) {
        setIsLoading(false);
        return;
      }

      // Transform rows with pretty header names
      const rows = cleanedPatients.map((item) => ({
        "Patient Name": item.name || "",
        Email: item.email || "",
        "Country Code": item.countryCode || "",
        "Phone Number": item.phoneNumber || "",
        "Date of Birth": formatMMDDYYYY(item.dateOfBirth),
        "Visa Type": item.visaTypeName || item.visaType || "",
        "Visa Expiry Date": formatMMDDYYYY(item.visaExpiryDate),
        "USA Last Entry Date": formatMMDDYYYY(item.lastEntryDate),
        Address: [item.address1, item.address2].filter(Boolean).join(", "),
        City: item.cityName || "",
        State: item.stateName || "",
        Country: item.countryName || "",
        "Zip Code": item.zipCode || "",
        "Created Date": formatMMDDYYYY(item.createdDate),
        "Last Updated Date": formatMMDDYYYY(item.updatedDate),
      }));

      // Header order
      const headerOrder = [
        "Patient Name",
        "Email",
        "Country Code",
        "Phone Number",
        "Date of Birth",
        "Visa Type",
        "Visa Expiry Date",
        "USA Last Entry Date",
        "Address",
        "City",
        "State",
        "Country",
        "Zip Code",
        "Created Date",
        "Last Updated Date",
      ];

      const worksheet = XLSX.utils.json_to_sheet(rows, { header: headerOrder });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");

      XLSX.writeFile(workbook, "All Patients Details.xlsx");

      setIsLoading(false);
    } catch (err) {
      console.error("Export all failed:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="pa">
      {isLoading && <Loader />}

      <SubHeader
        title="Pending Assignees"
        showBack={false}
        showRight={true} // keeps search side visible
        showButton={false} // hides button
        showSearch={true}
        searchPlaceholder="Search patients..."
        searchValue={searchString}
        onSearchDebounced={(val) => {
          setPageIndex(0);
          setSearchString(val.trim());
        }}
      />

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
        <div className="mm__tableWrapper">
          <CustomTable
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={rows}
            pageIndex={pageIndex}
            pageSize={pageSize}
            total={total}
            onPageChange={(page, size) => {
              // CustomTable gives 1-based page; API expects 0-based
              setPageIndex(page - 1);
              setPageSize(size);
            }}
          />
        </div>
      </section>

      {/* Assign only for Pending tab */}
      {tab === "pending" && (
        <AssignShipperModal
          open={open}
          onClose={() => setOpen(false)}
          patient={selectedRow}
          onAssigned={() => {
            setOpen(false);
            // after assigning, refresh pending list
            fetchPatients();
          }}
        />
      )}
    </div>
  );
};

export default PendingAssignees;
