import React, { useEffect, useRef, useState } from "react";
import CustomModal from "../../../components/CustomModal/CustomModal";
import InputField from "../../../components/InputField/InputField";
import SelectInput from "../../../components/SelectInput/SelectInput";
import "./NewShipperModal.scss";

import { postApi, getApi } from "../../../utils/apiService";
import {
  GET_ALL_ZIPCODE,
  GET_STATE_AND_CITY,
  CREATE_MEDICAL_SHIPPER, // <— adjust name if different
} from "../../../utils/apiPath";
import { successToast, errorToast } from "../../../services/ToastHelper";

const countryIdIndia = "085a5754-e6e8-4101-896b-325990c03646";
const initialForm = {
  shipperName: "",
  phone: "",
  email: "",

  // location fields
  address1: "",
  address2: "",
  zipCodeId: undefined,
  zip: "",
  city: "",
  state: "",
  cityId: undefined,
  stateId: undefined,
  countryId: countryIdIndia,
};

const phoneRx = /^[0-9+\-\s()]{8,20}$/i;
const emailRx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const MIN_ZIP_CHARS = 3;

const NewShipperModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [zipOptions, setZipOptions] = useState([]);
  const [zipLoading, setZipLoading] = useState(false);
  const debounceRef = useRef(null);
  const cityStateAbortRef = useRef(null);
  const requestIdRef = useRef(0);
  const cacheRef = useRef(new Map());

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  // ---- Zip helpers ----
  const cancelCityStateInFlight = () => {
    if (cityStateAbortRef.current) {
      cityStateAbortRef.current.abort();
      cityStateAbortRef.current = null;
    }
  };

  const fetchStateAndCityByZipCode = async (zipCodeId) => {
    if (!zipCodeId) return;

    cancelCityStateInFlight();
    const controller = new AbortController();
    cityStateAbortRef.current = controller;

    try {
      const { statusCode, data } = await getApi(GET_STATE_AND_CITY, {
        params: { zipCodeId: zipCodeId },
        signal: controller.signal,
      });

      if (statusCode === 200 && data) {
        setForm((p) => ({
          ...p,
          stateId: data.stateId,
          cityId: data.cityId,
          state: data.stateName ?? "",
          city: data.cityName ?? "",
        }));
        setErrors((prev) => ({ ...prev, city: "", state: "" }));
      } else {
        setForm((p) => ({ ...p, city: "", state: "" }));
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("fetchStateAndCityByZipCode error:", err);
      }
    } finally {
      cityStateAbortRef.current = null;
    }
  };
  const runDebounced = (fn, delay = 250) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, delay);
  };
  const cancelInFlight = () => {
    if (cityStateAbortRef.current) {
      cityStateAbortRef.current.abort();
      cityStateAbortRef.current = null;
    }
  };

  const fetchZipCodes = async (query = "") => {
    const q = String(query || "").trim();
    if (cacheRef.current.has(q)) {
      setZipOptions(cacheRef.current.get(q));
      return;
    }

    const myId = ++requestIdRef.current;

    setZipLoading(true);
    try {
      const payload = {
        searchString: q,
        pageIndex: 0,
        pageSize: 20,
        countryId: countryIdIndia,
      };
      const { statusCode, data } = await postApi(GET_ALL_ZIPCODE, payload);
      const options = statusCode === 200 && Array.isArray(data) ? data : [];
      if (myId === requestIdRef.current) {
        setZipOptions(options);
        cacheRef.current.set(q, options);
      }
    } catch (err) {
      console.error("Zip fetch error:", err);
      if (myId === requestIdRef.current) setZipOptions([]);
    } finally {
      if (myId === requestIdRef.current) setZipLoading(false);
    }
  };

  useEffect(() => () => cancelInFlight(), []);

  const handleZipSearch = (input = "") => {
    const q = String(input).trim();
    if (q.length < MIN_ZIP_CHARS) {
      cancelInFlight();
      setZipOptions([]);
      setZipLoading(false);
      return;
    }
    runDebounced(() => fetchZipCodes(q), 300);
  };

  const handleZipFocus = () => {
    if (!zipOptions.length) fetchZipCodes("");
  };

  const handleZipChange = (v, option) => {
    const isObj = v && typeof v === "object";
    const id = isObj ? v.value : v;
    const label = isObj ? v.label : option?.label;

    setForm((p) => ({
      ...p,
      zipCodeId: id,
      zip: label || "",
      city: "",
      state: "",
      cityId: undefined,
      stateId: undefined,
    }));
    setErrors((prev) => ({ ...prev, zipCodeId: "", city: "", state: "" }));
    if (id) fetchStateAndCityByZipCode(id);
  };

  const handleZipClear = () => {
    setForm((p) => ({
      ...p,
      zipCodeId: undefined,
      zip: "",
      city: "",
      state: "",
    }));
    setErrors((prev) => ({ ...prev, zipCodeId: "", city: "", state: "" }));
  };

  // cleanup on unmount
  useEffect(() => () => cancelCityStateInFlight(), []);

  // ---- Validation ----
  const validate = () => {
    const e = {};

    if (!form.shipperName?.trim()) e.shipperName = "Enter shipper name";

    if (!form.phone?.trim()) e.phone = "Enter phone number";
    else if (!phoneRx.test(form.phone)) e.phone = "Enter a valid phone number";

    if (!form.email?.trim()) e.email = "Enter email";
    else if (!emailRx.test(form.email)) e.email = "Enter a valid email";

    // address validations
    if (!form.address1?.trim()) e.address1 = "Enter house / street address";

    if (!form.zipCodeId) e.zipCodeId = "Select zip code";
    if (!form.city?.trim()) e.city = "City is required";
    if (!form.state?.trim()) e.state = "State is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetAll = () => {
    setForm(initialForm);
    setErrors({});
    setZipOptions([]);
    setZipLoading(false);
  };

  const handleAdd = async () => {
    if (saving) return;
    if (!validate()) return;

    try {
      setSaving(true);

      const payload = {
        name: form.shipperName.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phone.trim(),
        address1: form.address1.trim(),
        address2: form.address2?.trim() || "",
        zipCodeId: form.zipCodeId,
        cityId: form.cityId,
        stateId: form.stateId,
        countryId: form.countryId || null,
      };

      const res = await postApi(CREATE_MEDICAL_SHIPPER, payload);
      successToast("New location added successfully");
      onSubmit?.(res?.data || payload);
      resetAll();
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to add new location";
      errorToast(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetAll();
    onClose?.();
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Add New Location"
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
        {/* Basic info */}
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

        {/* Address / Location */}
        <SelectInput
          title="Zip Code"
          placeholder="Search Zip Code"
          options={zipOptions}
          value={form.zipCodeId ?? null}
          onChange={handleZipChange}
          showSearch
          allowClear
          filterOption={false}
          onSearch={handleZipSearch}
          onFocus={handleZipFocus}
          onClear={handleZipClear}
          loading={zipLoading}
          errorText={errors.zipCodeId}
          notFoundContent={zipLoading ? "Loading..." : "No results"}
          required
        />

        <InputField
          title="City"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={(e) => setField("city", e.target.value)}
          disabled
          required
          errorText={errors.city}
        />

        <InputField
          title="State"
          name="state"
          placeholder="State"
          value={form.state}
          onChange={(e) => setField("state", e.target.value)}
          disabled
          required
          errorText={errors.state}
        />

        <InputField
          title="House Number & Street Name"
          name="address1"
          placeholder="Enter house number & street name"
          value={form.address1}
          onChange={(e) => setField("address1", e.target.value)}
          required
          errorText={errors.address1}
        />

        <InputField
          title="Area of Locality"
          name="address2"
          placeholder="Enter Area of Locality"
          value={form.address2}
          onChange={(e) => setField("address2", e.target.value)}
          errorText={errors.address2}
        />
      </div>
    </CustomModal>
  );
};

export default NewShipperModal;
