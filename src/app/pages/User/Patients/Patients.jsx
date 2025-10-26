import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubHeader from "../../../components/SubHeader/SubHeader";
import PatientsGrid from "../../../components/PatientsGrid/PatientsGrid";
import "./Patients.scss";
import { GET_ALL_PATIENTS } from "../../../utils/apiPath";
import { postApi } from "../../../utils/apiService";
import Loader from "../../../components/Loader/Loader";

const Patients = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [patientsData, setPatientsData] = useState([]);

  const handleAddPatients = () => {
    navigate("/add-patients");
  };

  useEffect(() => {
    fetchAllPatients();
  }, []);

  const fetchAllPatients = async () => {
    setIsLoading(true);
    try {
      const payload = { pageIndex: 0, pageSize: 10, searchString: "" };
      const { statusCode, data } = await postApi(GET_ALL_PATIENTS, payload);
      if (statusCode === 200) setPatientsData(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="patients">
      {isLoading && <Loader />}
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
          items={patientsData}
          selectedId={selectedId}
          onSelect={(p) => setSelectedId(p.id)}
          onEdit={(p) => navigate(`/edit-patient/${p.id}`)}
          // onVisa={onVisa}
          // onPassport={onPassport}
          // onPrescriptions={onPrescriptions}
        />
      </section>
    </div>
  );
};

export default Patients;
