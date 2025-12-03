import React, { useEffect, useMemo, useState } from "react";
import { Table } from "antd";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import NewShipperModal from "./NewShipperModal";
import "./MedicalShippers.scss";
import { GET_MEDICAL_SHIPPERS } from "../../../utils/apiPath";
import { postApi } from "../../../utils/apiService";
import CustomTable from "../../../components/CustomTable/CustomTable";
import { formatMMDDYYYY } from "../../../services/dateFormatter";
import { renderStatusCapsule } from "../../../services/statusCapsule";
import EyeIcon from "../../../assets/icons/EyeIcon";

const pad2 = (n) => String(n).padStart(2, "0");

const MedicalShippers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [shippers, setShippers] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    fetchMedicalShippers();
  }, [pageIndex, pageSize, searchString]);

  const fetchMedicalShippers = async () => {
    setIsLoading(true);
    const payload = {
      pageIndex,
      pageSize,
      searchString: searchString,
    };

    const { statusCode, data, totalRecords } = await postApi(
      GET_MEDICAL_SHIPPERS,
      payload
    );

    if (statusCode === 200 && data) {
      setShippers(data);
      setTotal(totalRecords);
    }

    setIsLoading(false);
  };

  const columns = [
    {
      title: "Sl No",
      dataIndex: "id",
      render: (_, __, index) => pad2(pageIndex * pageSize + index + 1),
    },
    {
      title: "Shipper Name",
      dataIndex: "name",
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
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
      title: "State",
      dataIndex: "stateName",
      ellipsis: true,
      render: (value) => value?.trim() || "-",
    },
    {
      title: "City",
      dataIndex: "cityName",
      ellipsis: true,
      render: (value) => value?.trim() || "-",
    },
    // {
    //   title: "Created Date",
    //   dataIndex: "createdDate",
    //   width: 150,
    //   align: "center",
    //   render: (value) => formatMMDDYYYY(value),
    // },
    // {
    //   title: "Updated date",
    //   dataIndex: "updatedDate",
    //   width: 150,
    //   align: "center",
    //   render: (value) => formatMMDDYYYY(value),
    // },
  ];

  const handleShipperCreated = (newItem) => {
    console.log("Created:", newItem);
    setOpen(false);
    fetchMedicalShippers();
  };

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
        <div className="mm__tableWrapper">
          <CustomTable
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={shippers}
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

      {/* Modal */}
      <NewShipperModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleShipperCreated}
      />
    </div>
  );
};

export default MedicalShippers;
