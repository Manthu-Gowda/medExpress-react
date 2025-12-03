// src/pages/Admin/AdminPatients/AdminPatients.jsx
import React, { useEffect, useState } from "react";
import { Popover } from "antd";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import "./MedicalShipments.scss";
import {
  GET_ALL_ADMIN_PATIENTS,
  GET_ALL_SHIPPER_PATIENTS,
} from "../../../utils/apiPath";
import { postApi } from "../../../utils/apiService";
import EyeIcon from "../../../assets/icons/EyeIcon";
import * as XLSX from "xlsx";
import { formatMMDDYYYY } from "../../../services/dateFormatter";
import CustomTable from "../../../components/CustomTable/CustomTable";
import CustomModal from "../../../components/CustomModal/CustomModal";
import PatientCard from "../../../components/PatientCard/PatientCard";
import { useNavigate } from "react-router-dom";

const pad2 = (n) => String(n).padStart(2, "0");

const MedicalShipments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);

  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchString, setSearchString] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, [pageIndex, pageSize, searchString]);

  const fetchMembers = async () => {
    setIsLoading(true);
    const payload = { pageIndex, pageSize, searchString: searchString };

    const { statusCode, data, totalRecords } = await postApi(
      GET_ALL_SHIPPER_PATIENTS,
      payload
    );

    if (statusCode === 200 && data) {
      setPatients(data);
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
      };

      const { statusCode, data } = await postApi(
        GET_ALL_ADMIN_PATIENTS,
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

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedMember(null);
  };

  const columns = [
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
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
      render: (text) => <span className="ap__muted">{text}</span>,
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
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      align: "center",
      render: (value) => formatMMDDYYYY(value),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <button
          type="button"
          className="ap__docBadge ap__viewBtn"
          onClick={() => navigate(`/shipper-patient/${record.id}`)}
        >
          <EyeIcon />
          <span className="ap__docBadgeText">View</span>
        </button>
      ),
    },
  ];

  return (
    <div className="ap">
      {isLoading && <Loader />}

      <SubHeader
        title="Manage Patients"
        showBack={false}
        showRight={true}
        showPlusIcon={false}
        buttonText="Export All"
        onClick={handleExportAll}
        showSearch={true}
        searchPlaceholder="Search patients..."
        onSearchDebounced={(val) => {
          setPageIndex(0);
          setSearchString(val.trim());
        }}
      />

      <section className="ap_sec">
        <div className="mm__tableWrapper">
          <CustomTable
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={patients}
            pageIndex={pageIndex}
            pageSize={pageSize}
            total={total}
            onPageChange={(page, size) => {
              setPageIndex(page - 1);
              setPageSize(size);
            }}
          />
        </div>
      </section>

      <CustomModal
        open={isDetailsModalOpen}
        title={selectedMember?.name || "Patient Details"}
        onClose={handleCloseDetails}
        showPrimary={false}
        showDanger={true}
        dangerText="Close"
        onDanger={handleCloseDetails}
        width={820}
        bodyClassName="ap__patientModalBody"
      >
        {selectedMember && (
          <PatientCard data={selectedMember} showEdit={false} />
        )}
      </CustomModal>
    </div>
  );
};

export default MedicalShipments;
