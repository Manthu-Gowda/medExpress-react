import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubHeader from "../../../components/SubHeader/SubHeader";
import PatientsGrid from "../../../components/PatientsGrid/PatientsGrid";
import "./Patients.scss";
// import BackArrowIcon from "..."; // optional
// import AddIcon from "...";       // optional

const mock = [
  {
    id: "1",
    fullName: "Manthu Gowda",
    phone: "+91 9876543210",
    email: "manthugowda@gmail.com",
    dob: "12 Jan, 1989",
    visaType: "Business visa",
    visaExpDate: "12 Sep, 2028",
    usaLastEntryDate: "12 Feb, 2025",
    addressLine:
      "1st Main Road, 2nd cross, Banashankari, Bengaluru, Karnataka 562127",
  },
  {
    id: "2",
    fullName: "Gowda Manthu",
    phone: "+91 9876543210",
    email: "manthugowda@gmail.com",
    dob: "12 Jan, 1989",
    visaType: "Business visa",
    visaExpDate: "12 Sep, 2028",
    usaLastEntryDate: "12 Feb, 2025",
    addressLine:
      "1st Main Road, 2nd cross, Banashankari, Bengaluru, Karnataka 562127",
  },
  {
    id: "3",
    fullName: "Brahim elabbaoui",
    phone: "+91 9876543210",
    email: "brahimelabbaoui1124@gmail.com",
    dob: "12 Jan, 1989",
    visaType: "Business visa",
    visaExpDate: "12 Sep, 2028",
    usaLastEntryDate: "12 Feb, 2025",
    addressLine:
      "1st Main Road, 2nd cross, Banashankari, Bengaluru, Karnataka 562127",
  },
  {
    id: "4",
    fullName: "Brahim elabbaoui",
    phone: "+91 9876543210",
    email: "brahimelabbaoui1124@gmail.com",
    dob: "12 Jan, 1989",
    visaType: "Business visa",
    visaExpDate: "12 Sep, 2028",
    usaLastEntryDate: "12 Feb, 2025",
    addressLine:
      "1st Main Road, 2nd cross, Banashankari, Bengaluru, Karnataka 562127",
  },
];

const Patients = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState("2");
  const data = useMemo(() => mock, []);

  const handleAddPatients = () => {
    navigate("/add-patients");
  };

  return (
    <div className="patients">
      <SubHeader
        title="Patients"
        showBack={false}
        onClick={handleAddPatients}
        showRight={true}
        buttonText="Add New Patient"
      />

      {/* Your page body */}
      <section className="patients_sec">
        <PatientsGrid
          items={data}
          selectedId={selectedId}
          onSelect={(p) => setSelectedId(p.id)}
          onEdit={(p) => navigate(`/patients/${p.id}/edit`)}
          onVisa={(p) => navigate(`/patients/${p.id}/visa`)}
          onPassport={(p) => navigate(`/patients/${p.id}/passport`)}
          onPrescriptions={(p) => navigate(`/patients/${p.id}/prescriptions`)}
        />
      </section>
    </div>
  );
};

export default Patients;
