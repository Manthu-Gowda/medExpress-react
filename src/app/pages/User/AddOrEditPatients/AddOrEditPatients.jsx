import React, { useState } from "react";
import dayjs from "dayjs";
import { Divider, Select } from "antd";
import "./AddOrEditPatients.scss";
import SubHeader from "../../../components/SubHeader/SubHeader";
import InputField from "../../../components/InputField/InputField";
import DateField from "../../../components/DateField/DateField";
import FileDropzone from "../../../components/FileDropzone/FileDropzone";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import SelectInput from "../../../components/SelectInput/SelectInput";
import { useNavigate } from "react-router-dom";

const VISA_TYPES = [
  { value: "B1/B2", label: "B1/B2" },
  { value: "H1B", label: "H1B" },
  { value: "L1", label: "L1" },
  { value: "F1", label: "F1" },
  { value: "Other", label: "Other" },
];

const AddOrEditPatients = () => {
  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    email: "",
    dob: null,
    visaType: undefined,
    visaExpiry: null,
    lastEntry: null,
    zip: "",
    city: "",
    state: "",
    street: "",
    apt: "",
  });

  const [files, setFiles] = useState({
    passport: [],
    visa: [],
    prescription: [],
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const update = (name) => (e) =>
    setForm((p) => ({ ...p, [name]: e?.target ? e.target.value : e }));

  const handleSubmit = () => {
    // minimal required validation example
    const next = {};
    if (!form.patientName) next.patientName = "Patient name is required.";
    if (!form.dob) next.dob = "Date of birth is required.";
    if (!files.passport.length) next.passport = "Passport file is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    // Build payload here
    const payload = {
      ...form,
      dob: form.dob?.format("YYYY-MM-DD"),
      visaExpiry: form.visaExpiry?.format("YYYY-MM-DD"),
      lastEntry: form.lastEntry?.format("YYYY-MM-DD"),
      // files: files...
    };
    console.log("SUBMIT", payload, files);
    // call API…
  };

  const disabledFuture = (current) => current && current > dayjs().endOf("day");

  const handleBack = ()=>{
    navigate("/patients")
  }
  return (
    <div className="addp">
      <SubHeader
        title="Add New Patient"
        showBack={true}
        onBack={handleBack}
        onClick={() => window.history.back()}
        showRight={false}
      />

      <section className="addp_sec">
        {/* Personal Information */}
        <h4 className="sec-title">Personal Information</h4>
        <div className="grid-3">
          <InputField
            title="Patient Name"
            helperTitle="(Enter name as per Passport)"
            placeholder="Enter patient name"
            value={form.patientName}
            onChange={update("patientName")}
            required
            errorText={errors.patientName}
            helperText="( Enter name as per Passport )"
          />
          <InputField
            title="Phone Number"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={update("phone")}
            type="tel"
          />
          <InputField
            title="Email"
            placeholder="Enter email"
            value={form.email}
            onChange={update("email")}
            type="email"
          />

          <DateField
            title="Date Of Birth"
            value={form.dob}
            onChange={(d) => update("dob")(d)}
            required
            errorText={errors.dob}
            disabledDate={disabledFuture}
          />

          <SelectInput
            title="Visa Type"
            required
            placeholder="Select visa type"
            options={VISA_TYPES}
            value={form.visaType}
            // onChange={setVisaType}
            onChange={(val) => setForm((p) => ({ ...p, visaType: val }))}
            // errorText{errors.visaType}
            showSearch
          />

          <DateField
            title="Visa Expiry Date"
            value={form.visaExpiry}
            onChange={(d) => update("visaExpiry")(d)}
          />

          <DateField
            title="USA Last Entry Date"
            value={form.lastEntry}
            onChange={(d) => update("lastEntry")(d)}
          />
        </div>

        <Divider />
        {/* Location */}
        <h4 className="sec-title">Location Information</h4>
        <div className="grid-3">
          <InputField
            title="Zip Code"
            placeholder="Enter Zip Code"
            value={form.zip}
            onChange={update("zip")}
          />
          <InputField
            title="City"
            placeholder="Current City"
            value={form.city}
            onChange={update("city")}
          />
          <InputField
            title="State"
            placeholder="Current State"
            value={form.state}
            onChange={update("state")}
          />
          <InputField
            title="House Number & Street Name"
            placeholder="Enter House Number & Street Name"
            value={form.street}
            onChange={update("street")}
          />
          <InputField
            title="Apartment / Unit Number"
            placeholder="Enter Apartment / Unit Number"
            value={form.apt}
            onChange={update("apt")}
          />
        </div>

        <Divider />
        {/* Documents */}
        <h4 className="sec-title">Document Information</h4>
        <div className="grid-3">
          <FileDropzone
            title="Passport"
            required
            accept=".pdf,.jpg,.jpeg,.png"
            value={files.passport}
            onChange={(f) => setFiles((p) => ({ ...p, passport: f }))}
            errorText={errors.passport}
          />
          <FileDropzone
            title="Visa"
            accept=".pdf,.jpg,.jpeg,.png"
            value={files.visa}
            onChange={(f) => setFiles((p) => ({ ...p, visa: f }))}
          />
          <FileDropzone
            title="Prescription"
            accept=".pdf,.jpg,.jpeg,.png"
            value={files.prescription}
            onChange={(f) => setFiles((p) => ({ ...p, prescription: f }))}
          />
        </div>
        <div className="actions">
          <div className="actions_left">
            <p className="note">Note: PDF / JPG / PNG file is allowed!</p>
          </div>
          <div className="actions_right">
            {" "}
            <ButtonComponent variant="danger">Cancel</ButtonComponent>
            <ButtonComponent variant="primary" onClick={handleSubmit}>
              Save
            </ButtonComponent>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AddOrEditPatients;
