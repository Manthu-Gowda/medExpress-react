import React, { useEffect, useState } from "react";
import SubHeader from "../../../components/SubHeader/SubHeader";
import Loader from "../../../components/Loader/Loader";
import NewShipperModal from "./NewShipperModal";
import "./MedicalShippers.scss";
import { GET_MEDICAL_SHIPPERS } from "../../../utils/apiPath";
import { postApi } from "../../../utils/apiService";
import CustomTable from "../../../components/CustomTable/CustomTable";

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
    {
      title: "Location",
      dataIndex: "address1",
      ellipsis: true,
      render: (_, record) => {
        const parts = [record.address1, record.address2]
          .filter(Boolean)
          .map((v) => v.trim());

        return parts.length ? parts.join(", ") : "-";
      },
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
      title: "Email",
      dataIndex: "email",
      ellipsis: true,
    },
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
        title="Drop of Locations"
        showBack={false}
        showRight={true}
        buttonText="Add New Location"
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
