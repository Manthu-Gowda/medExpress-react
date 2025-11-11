import React, { useMemo, useState } from "react";
import CustomModal from "../../../components/CustomModal/CustomModal";
import InputField from "../../../components/InputField/InputField";
import "./NewShipperModal.scss";

const initialForm = {
  shipperName: "",
  phone: "",
  email: "",
  location: "",
};

const phoneRx = /^[0-9+\-\s()]{8,20}$/i;
const emailRx =
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const NewShipperModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    // clear error as user types
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.shipperName?.trim()) e.shipperName = "Enter shipper name";
    if (!form.phone?.trim()) e.phone = "Enter phone number";
    else if (!phoneRx.test(form.phone)) e.phone = "Enter a valid phone number";

    if (!form.email?.trim()) e.email = "Enter email";
    else if (!emailRx.test(form.email)) e.email = "Enter a valid email";

    if (!form.location?.trim()) e.location = "Enter location";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetAll = () => {
    setForm(initialForm);
    setErrors({});
  };

  const handleAdd = async () => {
    if (saving) return;
    if (!validate()) return;

    // try {
    //   setSaving(true);
    //   // payload shaped for backend; adjust keys if needed
    //   const payload = {
    //     name: form.shipperName.trim(),
    //     phone: form.phone.trim(),
    //     email: form.email.trim().toLowerCase(),
    //     location: form.location.trim(),
    //   };

    //   const res = await postApi(CREATE_MEDICAL_SHIPPER, payload);
    //   successToast("Shipper added successfully");
    //   onSubmit?.(res?.data || payload); // bubble up to refresh table
    //   resetAll();
    //   onClose?.();
    // } catch (err) {
    //   const msg =
    //     err?.response?.data?.message ||
    //     err?.message ||
    //     "Failed to add shipper";
    //   errorToast(msg);
    // } finally {
    //   setSaving(false);
    // }
  };

  const handleClose = () => {
    resetAll();
    onClose?.();
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Add New Shipper"
      showPrimary
      showDanger
      primaryText="Add"
      dangerText="Cancel"
      onPrimary={handleAdd}
      onDanger={handleClose}
      primaryProps={{ loading: saving, disabled: saving }}
      dangerProps={{ disabled: saving }}
      width={720}
      className="ns"
      bodyClassName="ns__body"
    >
      <div className="ns__grid">
        <InputField
          title="Shipper Name"
          name="shipperName"
          placeholder="Enter shipper name"
          value={form.shipperName}
          onChange={(e) => setField("shipperName", e.target.value)}
          required
          errorText={errors.shipperName}
        />

        <InputField
          title="Phone Number"
          name="phone"
          placeholder="Enter phone number"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
          required
          errorText={errors.phone}
        />

        <InputField
          title="Email"
          name="email"
          type="email"
          placeholder="Enter email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          required
          errorText={errors.email}
        />

        <InputField
          title="Location"
          name="location"
          placeholder="Enter location"
          value={form.location}
          onChange={(e) => setField("location", e.target.value)}
          required
          errorText={errors.location}
        />
      </div>
    </CustomModal>
  );
};

export default NewShipperModal;
