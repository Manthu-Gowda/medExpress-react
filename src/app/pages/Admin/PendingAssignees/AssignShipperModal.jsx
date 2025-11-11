import React, { useMemo, useState } from "react";
import CustomModal from "../../../components/CustomModal/CustomModal";
import InputField from "../../../components/InputField/InputField";
import SelectInput from "../../../components/SelectInput/SelectInput";
import { successToast, errorToast } from "../../../services/ToastHelper";

import "./AssignShipperModal.scss";

const MOCK_SHIPPERS = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  name: ["Eduardo Thomaz", "Docia Darlow", "Jaciel Hernandez", "Jean Warren", "Mila Rice", "Omar Nolan"][i],
  location: "2nd cross, Banashankari, Bengaluru, Karnataka 562127",
  avatar: `https://i.pravatar.cc/64?img=${i + 22}`,
}));

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

  const filtered = useMemo(() => {
    return MOCK_SHIPPERS.filter((s) => {
      const byName = s.name.toLowerCase().includes(keyword.trim().toLowerCase());
      const byLoc = loc ? true /* demo: all items same loc */ : true;
      return byName && byLoc;
    });
  }, [keyword, loc]);

  const handleAssign = async (shipper) => {
    if (assigningId) return;
    // try {
    //   setAssigningId(shipper.id);
    //   // payload shape — adjust to your backend
    //   const payload = {
    //     patientId: patient?.id,
    //     shipperId: shipper.id,
    //     location: loc || "banashankari",
    //   };
    //   await postApi(ASSIGN_SHIPPER_TO_PATIENT, payload);
    //   successToast("Assigned successfully");
    //   onAssigned?.(shipper);
    // } catch (e) {
    //   errorToast(e?.response?.data?.message || "Failed to assign");
    // } finally {
    //   setAssigningId(null);
    // }
  };

  const handleClose = () => {
    setKeyword("");
    setLoc(undefined);
    onClose?.();
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Subscription"
      showPrimary={false}
      showDanger={false}
      width={760}
      className="as"
      bodyClassName="as__body"
    >
      <div className="as__label">Select Shipper to Assign</div>

      <div className="as__filters">
        <InputField
          title=""
          name="keyword"
          placeholder="Search by name..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <SelectInput
          title=""
          name="location"
          placeholder="Select Location"
          value={loc}
          onChange={(v) => setLoc(v)}
          options={LOCATIONS}
          allowClear
        />
        <button type="button" className="as__searchBtn" onClick={() => { /* optional if server search */ }}>
          Search
        </button>
      </div>

      <div className="as__divider" />

      <div className="as__resultsLabel">
        Search Results ({filtered.length})
      </div>

      <div className="as__list">
        {filtered.map((s) => (
          <div key={s.id} className="as__item">
            <div className="as__left">
              <img className="as__avatar" src={s.avatar} alt={s.name} />
              <div>
                <div className="as__name">{s.name}</div>
                <div className="as__muted">
                  <span className="as__loctag">Location :</span>&nbsp;{s.location}
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
        ))}
      </div>
    </CustomModal>
  );
};

export default AssignShipperModal;
