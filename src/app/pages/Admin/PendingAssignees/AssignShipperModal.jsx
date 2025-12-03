// src/pages/Admin/PendingAssignees/AssignShipperModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import CustomModal from "../../../components/CustomModal/CustomModal";
import SelectInput from "../../../components/SelectInput/SelectInput";
import SearchInput from "../../../components/SearchInput/SearchInput";
import { successToast, errorToast } from "../../../services/ToastHelper";

import "./AssignShipperModal.scss";
import {
  ASSIGN_SHIPPER_TO_PATIENT,
  GET_MEDICAL_SHIPPERS,
} from "../../../utils/apiPath";
import { postApi } from "../../../utils/apiService";
import Loader from "../../../components/Loader/Loader";

const LOCATIONS = [
  { value: "banashankari", label: "Banashankari" },
  { value: "indiranagar", label: "Indiranagar" },
  { value: "hsr", label: "HSR Layout" },
  { value: "btm", label: "BTM Layout" },
];

const AssignShipperModal = ({ open, onClose, onAssigned, patient }) => {
  const [keyword, setKeyword] = useState("");
  const [loc, setLoc] = useState();
  const [assigningId, setAssigningId] = useState(null);

  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [shippers, setShippers] = useState([]);
  const [total, setTotal] = useState(0);

  // the actual term we use for API calls
  const [searchString, setSearchString] = useState("");

  const buildLocation = (s) => {
    const parts = [
      s.address1,
      s.address2,
      s.cityName,
      s.stateName,
      s.countryName,
      s.zipCode,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const fetchMedicalShippers = async () => {
    try {
      if (!open) return; // don't call API when modal is closed

      setIsLoading(true);
      const payload = {
        pageIndex,
        pageSize,
        searchString,
      };

      const { statusCode, data, totalRecords } = await postApi(
        GET_MEDICAL_SHIPPERS,
        payload
      );

      if (statusCode === 200 && Array.isArray(data)) {
        setShippers(data);
        setTotal(totalRecords || data.length || 0);
      } else {
        setShippers([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("GET_MEDICAL_SHIPPERS error:", err);
      errorToast("Failed to load shippers");
      setShippers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalShippers();
  }, [open, pageIndex, pageSize, searchString]);

  const filtered = useMemo(() => {
    return shippers.filter((s) => {
      if (!loc) return true;
      const fullLoc = buildLocation(s).toLowerCase();
      return fullLoc.includes(String(loc).toLowerCase());
    });
  }, [shippers, loc]);

  const handleAssign = async (shipper) => {
    if (assigningId || !patient?.id) return;

    const payload = {
      id: patient.id,
      shipperId: shipper.id,
    };
    const { statusCode, message } = await postApi(
      ASSIGN_SHIPPER_TO_PATIENT,
      payload
    );
    if (statusCode === 200) {
      successToast("Shipper assigned successfully");
      onAssigned?.();
      handleClose();
    } else {
      errorToast(message);
    }
  };

  const handleClose = () => {
    setKeyword("");
    setLoc(undefined);
    setShippers([]);
    setTotal(0);
    setSearchString("");
    setPageIndex(0);
    onClose?.();
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Assign Shipper"
      showPrimary={false}
      showDanger={false}
      width={760}
      className="as"
      bodyClassName="as__body"
    >
      <div className="as__label">Select Shipper to Assign</div>

      <div className="as__filters">
        <SearchInput
          value={keyword}
          placeholder="Search by name"
          onChange={(e) => setKeyword(e.target.value)}
          onDebouncedChange={(val) => {
            const trimmed = val.trim();
            setKeyword(trimmed);
            setPageIndex(0);
            setSearchString(trimmed);
          }}
        />
        <SelectInput
          title=""
          name="location"
          placeholder="Filter by Location"
          value={loc}
          onChange={(v) => setLoc(v)}
          options={LOCATIONS}
          allowClear
        />
      </div>

      <div className="as__divider" />

      <div className="as__resultsLabel">
        Search Results ({filtered.length}
        {total ? ` of ${total}` : ""})
      </div>

      <div className="as__list">
        {!isLoading && filtered.length === 0 && (
          <div className="as__empty">No shippers found.</div>
        )}

        {filtered.map((s) => {
          const location = buildLocation(s);
          const initials = s.name
            ?.split(" ")
            .map((p) => p[0])
            .join("")
            .toUpperCase();

          return (
            <div key={s.id} className="as__item">
              <div className="as__left">
                <div className="as__avatarFallback">{initials || "S"}</div>
                <div>
                  <div className="as__name">{s.name}</div>
                  <div className="as__muted">
                    <span className="as__loctag">Location :</span>&nbsp;
                    {location || "-"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="as__assignBtn"
                onClick={() => handleAssign(s)}
                disabled={assigningId === s.id}
              >
                {assigningId === s.id ? "Assigning..." : "Assign"}
              </button>
            </div>
          );
        })}

        {isLoading && <Loader />}
      </div>
    </CustomModal>
  );
};

export default AssignShipperModal;
