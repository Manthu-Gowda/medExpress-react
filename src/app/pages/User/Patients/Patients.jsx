import React from "react";
import { useNavigate } from "react-router-dom";
import SubHeader from "../../../components/SubHeader/SubHeader";
// import BackArrowIcon from "..."; // optional
// import AddIcon from "...";       // optional

const Patients = () => {
  const navigate = useNavigate();

  return (
    <div className="patients">
      <SubHeader
        title="Patients"
        showBack={true}
        onClick={() => navigate(-1)}
        showRight={true}
        buttonText="Add New Patient"
      />

      {/* Your page body */}
      <section className="page-body">{/* ... */}</section>
    </div>
  );
};

export default Patients;
