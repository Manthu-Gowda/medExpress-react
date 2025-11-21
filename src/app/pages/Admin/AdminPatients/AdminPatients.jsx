// src/pages/Admin/AdminPatients/AdminPatients.jsx
import React, { useEffect, useState } from "react";
import { Popover } from "antd";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import "./AdminPatients.scss";
import { GET_ALL_ADMIN_PATIENTS } from "../../../utils/apiPath";
import { postApi } from "../../../utils/apiService";
import EyeIcon from "../../../assets/icons/EyeIcon";
import * as XLSX from "xlsx";
import { formatMMDDYYYY } from "../../../services/dateFormatter";
import DocumentIcon from "../../../assets/icons/DocumentIcon";
import CustomTable from "../../../components/CustomTable/CustomTable";
import CustomModal from "../../../components/CustomModal/CustomModal";
import PatientCard from "../../../components/PatientCard/PatientCard";

const pad2 = (n) => String(n).padStart(2, "0");

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AdminPatients = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);

  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [pageIndex, pageSize, searchString]);

  const fetchMembers = async () => {
    setIsLoading(true);
    const payload = { pageIndex, pageSize, searchString: searchString };

    const { statusCode, data, totalRecords } = await postApi(
      GET_ALL_ADMIN_PATIENTS,
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

  const buildDocumentsList = (record) => {
    const docs = [];

    if (record?.passport?.url) {
      docs.push({
        key: `passport-${record.id}`,
        type: "Passport",
        fileName: record.passport.fileName || "View Passport",
        url: record.passport.url,
      });
    }

    if (record?.visa?.url) {
      docs.push({
        key: `visa-${record.id}`,
        type: "Visa",
        fileName: record.visa.fileName || "View Visa",
        url: record.visa.url,
      });
    }

    if (Array.isArray(record?.prescriptions)) {
      record.prescriptions.forEach((p, idx) => {
        if (!p?.url) return;
        docs.push({
          key: `prescription-${record.id}-${idx}`,
          type: "Prescription",
          fileName: p.fileName || `Prescription ${idx + 1}`,
          url: p.url,
        });
      });
    }

    return docs;
  };

  const handleOpenDoc = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenDetails = (record) => {
    setSelectedMember(record);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedMember(null);
  };

  const columns = [
    {
      title: "Sl No",
      dataIndex: "id",
      width: 90,
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
      width: 150,
      align: "center",
      render: (value) => formatMMDDYYYY(value),
    },
    {
      title: "Visa",
      dataIndex: "visaTypeName",
      ellipsis: true,
    },
    {
      title: "Visa Expiry Date",
      dataIndex: "visaExpiryDate",
      width: 150,
      align: "center",
      render: (value) => formatMMDDYYYY(value),
    },
    {
      title: "USA Last Entry Date",
      dataIndex: "usaLastEntryDate",
      width: 150,
      align: "center",
      render: (value) => formatMMDDYYYY(value),
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      width: 150,
      align: "center",
      render: (value) => formatMMDDYYYY(value),
    },
    {
      title: "Last Updated date",
      dataIndex: "lastUpdatedDate",
      width: 150,
      align: "center",
      render: (value) => formatMMDDYYYY(value),
    },
    // {
    //   title: "Documents",
    //   dataIndex: "docs",
    //   width: 130,
    //   align: "center",
    //   render: (_, record) => {
    //     const docs = buildDocumentsList(record);

    //     if (!docs.length) {
    //       return (
    //         <span className="ap__docBadge ap__docBadge--disabled">
    //           <DocumentIcon />
    //           <span className="ap__docBadgeText">No Docs</span>
    //         </span>
    //       );
    //     }

    //     return (
    //       <Popover
    //         trigger="click"
    //         placement="left"
    //         overlayClassName="ap__docPopoverWrapper"
    //         content={
    //           <div className="ap__docPopover">
    //             {docs.map((doc) => (
    //               <button
    //                 key={doc.key}
    //                 type="button"
    //                 className="ap__docRow"
    //                 onClick={() => handleOpenDoc(doc.url)}
    //               >
    //                 <span className="ap__docType">{doc.type}</span>
    //                 <span className="ap__docName" title={doc.fileName}>
    //                   {doc.fileName}
    //                 </span>
    //               </button>
    //             ))}
    //           </div>
    //         }
    //       >
    //         <button type="button" className="ap__docBadge">
    //           <DocumentIcon />
    //           <span className="ap__docBadgeText">Docs</span>
    //         </button>
    //       </Popover>
    //     );
    //   },
    // },
    {
      title: "Action",
      key: "action",
      width: 140,
      align: "center",
      render: (_, record) => (
        <button
          type="button"
          className="ap__docBadge ap__viewBtn"
          onClick={() => handleOpenDetails(record)}
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

export default AdminPatients;
