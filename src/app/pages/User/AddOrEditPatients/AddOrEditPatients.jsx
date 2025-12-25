import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { Divider, Select } from "antd";
import "./AddOrEditPatients.scss";
import SubHeader from "../../../components/SubHeader/SubHeader";
import InputField from "../../../components/InputField/InputField";
import DateField from "../../../components/DateField/DateField";
import FileDropzone from "../../../components/FileDropzone/FileDropzone";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import SelectInput from "../../../components/SelectInput/SelectInput";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADD_PATIENT,
  GET_ALL_ZIPCODE,
  GET_PATIENT_BY_ID,
  GET_STATE_AND_CITY,
  UPDATE_PATIENT,
} from "../../../utils/apiPath";
import { getApi, postApi, putApi } from "../../../utils/apiService";
import Loader from "../../../components/Loader/Loader";
import { errorToast, successToast } from "../../../services/ToastHelper";
import PhoneField from "../../../components/InputField/PhoneField";

const countryIdUSA = "0b4e5851-7670-462b-9e12-919a60ab2c17";

const VISA_TYPES = [
  { value: 1, label: "A" },
  { value: 2, label: "C" },
  { value: 3, label: "D" },
  { value: 4, label: "E1/E2" },
  { value: 5, label: "EB-1/EB-2/EB-3" },
  { value: 6, label: "F" },
  { value: 7, label: "H" },
  { value: 8, label: "I" },
  { value: 9, label: "J" },
  { value: 10, label: "K" },
  { value: 11, label: "L" },
  { value: 12, label: "M" },
  { value: 13, label: "N" },
  { value: 14, label: "O" },
  { value: 15, label: "P" },
  { value: 16, label: "Q" },
  { value: 17, label: "R" },
  { value: 18, label: "V" },
  { value: 19, label: "Other" },
];

const VISA_ID_TO_LABEL = Object.fromEntries(
  VISA_TYPES.map((o) => [o.value, o.label])
);

// ---- date helpers ----
const DATE_FORMAT = "MM-DD-YYYY";

const disabledTodayAndFuture = (current) =>
  current && !dayjs(current).isBefore(dayjs(), "day"); // disables today & future

// NEW: disable past AND today => only allow strictly future dates
const disabledPastAndToday = (current) =>
  current && !dayjs(current).isAfter(dayjs(), "day"); // disables today & past

const initialErrors = {
  patientName: "",
  phone: "",
  email: "",
  dob: "",
  visaType: "",
  visaExpiry: "",
  lastEntry: "",
  zipCodeId: "",
  city: "",
  state: "",
  street: "",
  passport: "",
  visa: "",
  prescriptions: "",
  apt: "",
  cityId: "",
  stateId: "",
  countryId: "",
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const isFuture = (d) => dayjs(d).isAfter(dayjs(), "day");
const isPast = (d) => dayjs(d).isBefore(dayjs(), "day");

// ---- phone helpers (US + IN only) ----
const COUNTRY_CODES = [
  { value: "+1", iso: "US", label: "US (+1)", max: 10, re: /^\d{10}$/ },
  { value: "+91", iso: "IN", label: "IN (+91)", max: 10, re: /^[6-9]\d{9}$/ },
];

const getCountryRule = (code = "+1") =>
  COUNTRY_CODES.find((c) => c.value === code) || COUNTRY_CODES[0];

const digitsOnly = (s = "") => String(s).replace(/\D+/g, "");

const MIN_ZIP_CHARS = 3;
const AddOrEditPatients = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    patientName: "",
    phoneCountryCode: "+1",
    phone: "",
    email: "",
    dob: null,
    visaTypeId: undefined,
    visaTypeName: "",
    visaExpiry: null,
    lastEntry: null,
    zipCodeId: undefined,
    stateId: undefined,
    cityId: undefined,
    countryId: "0b4e5851-7670-462b-9e12-919a60ab2c17",
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
  const [isLoading, setIsLoading] = useState(false);
  const [zipOptions, setZipOptions] = useState([]);
  const [zipLoading, setZipLoading] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef();
  const abortRef = useRef(null);
  const cacheRef = useRef(new Map());
  const cityStateAbortRef = useRef(null);
  const requestIdRef = useRef(0);

  const upsertZipOption = (id, label) => {
    if (!id || !label) return;
    setZipOptions((prev) => {
      if (prev?.some((o) => o.value === id)) return prev;
      return [{ value: id, label }, ...(prev || [])];
    });
  };

  const patchFormFromApi = (data) => {
    setForm((p) => ({
      ...p,
      patientName: data?.name ?? "",
      phone: data?.phoneNumber ?? "",
      phoneCountryCode: data?.countryCode ?? "",
      email: data?.email ?? "",
      dob: data?.dateOfBirth ? dayjs(data.dateOfBirth) : null,

      visaTypeId: data?.visaType ?? undefined,
      visaTypeName: data?.visaTypeName ?? "",
      visaExpiry: data?.visaExpiryDate ? dayjs(data.visaExpiryDate) : null,
      lastEntry: data?.usaLastEntryDate ? dayjs(data.usaLastEntryDate) : null,

      street: data?.address1 ?? "",
      apt: data?.address2 ?? "",

      zipCodeId: data?.zipCodeId ?? undefined,
      cityId: data?.cityId ?? undefined,
      stateId: data?.stateId ?? undefined,
      countryId: data?.countryId ?? "0b4e5851-7670-462b-9e12-919a60ab2c17",

      city: data?.cityName ?? "",
      state: data?.stateName ?? "",
      zip: data?.zipCode ?? "",
    }));
    setFiles({
      passport: data?.passport?.url
        ? [
            {
              uid: "-1",
              name: data.passport.fileName || "Passport.pdf",
              status: "done",
              url: data.passport.url,
              fileName: data.passport.fileName,
            },
          ]
        : [],

      visa: data?.visa?.url
        ? [
            {
              uid: "-2",
              name: data.visa.fileName || "Visa.pdf",
              status: "done",
              url: data.visa.url,
              fileName: data.visa.fileName,
            },
          ]
        : [],

      prescription: Array.isArray(data?.prescriptions)
        ? data.prescriptions.map((p, i) => ({
            uid: `presc-${i}`,
            name: p.fileName || `Prescription_${i + 1}.pdf`,
            status: "done",
            url: p.url,
            fileName: p.fileName,
          }))
        : [],
    });
    setErrors((prev) => ({
      ...prev,
      ...(data?.visaType ? { visaType: "" } : {}),
      ...(data?.zipCodeId ? { zipCodeId: "" } : {}),
      ...(data?.cityName ? { city: "" } : {}),
      ...(data?.stateName ? { state: "" } : {}),
    }));

    if (data?.zipCodeId) {
      const label = data?.zipCode || "";
      upsertZipOption(data.zipCodeId, label);
    }

    if (data?.zipCodeId && (!data?.cityName || !data?.stateName)) {
      fetchStateAndCityByZipCode(data.zipCodeId);
    }
  };

  const validateFields = () => {
    const errObj = { ...initialErrors };

    // Patient Name
    if (!form.patientName?.trim()) {
      errObj.patientName = "Patient name is required";
    } else if (form.patientName.trim().length < 2) {
      errObj.patientName = "Name must be at least 2 characters";
    }

    // Phone
    const digitsOnly = (s = "") => String(s).replace(/\D+/g, "");
    const ccRule = getCountryRule(form.phoneCountryCode);
    const rawPhone = digitsOnly(form.phone);

    if (!rawPhone) {
      errObj.phone = "Phone is required";
    } else if (!ccRule.re.test(rawPhone)) {
      errObj.phone =
        ccRule.value === "+1"
          ? "Enter a valid 10-digit US number"
          : "Enter a valid 10-digit Indian number (starts 6–9)";
    }

    // Email
    if (!form.email?.trim()) {
      errObj.email = "Email is required";
    } else if (!emailRe.test(form.email.trim())) {
      errObj.email = "Enter a valid email address";
    }

    // DOB (required, not future, not older than 120 years)
    if (!form.dob) {
      errObj.dob = "Date of birth is required";
    } else if (isFuture(form.dob)) {
      errObj.dob = "DOB cannot be in the future";
    } else if (dayjs().diff(form.dob, "year") > 120) {
      errObj.dob = "Please enter a valid date of birth";
    }

    // Visa type (required)
    if (form.visaTypeId == null) {
      errObj.visaType = "Select a visa type";
    }

    // Visa expiry: REQUIRED and must be STRICTLY in the future (not today)
    if (!form.visaExpiry) {
      errObj.visaExpiry = "Visa expiry date is required";
    } else if (!dayjs(form.visaExpiry).isAfter(dayjs(), "day")) {
      errObj.visaExpiry = "Visa expiry must be a future date";
    }

    // USA last entry: REQUIRED, cannot be today or in the future
    if (!form.lastEntry) {
      errObj.lastEntry = "USA last entry date is required";
    } else if (!dayjs(form.lastEntry).isBefore(dayjs(), "day")) {
      errObj.lastEntry = "Last entry cannot be today or in the future";
    }

    // Zip (required)
    if (!form.zipCodeId) {
      errObj.zipCodeId = "Zip Code is required";
    }
    if (!form.city?.trim()) {
      errObj.city = "City is required";
    }
    if (!form.state?.trim()) {
      errObj.state = "State is required";
    }

    // Street (required)
    if (!form.street?.trim()) {
      errObj.street = "Street address is required";
    }

    // Files required only when adding
    if (!isEdit) {
      if (!files.passport?.length)
        errObj.passport = "Passport file is required";
      if (!files.visa?.length) errObj.visa = "Visa file is required";
      if (!files.prescription?.length)
        errObj.prescriptions = "At least one prescription is required";
    }

    setErrors(errObj);
    const isValid = Object.values(errObj).every((v) => !v);
    return isValid;
  };

  const clearError = (key) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));

  const disabledFuture = (current) => current && current > dayjs().endOf("day");

  const update = (name) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const runDebounced = (fn, delay = 250) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, delay);
  };

  const cancelInFlight = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

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

  // cleanup on unmount
  useEffect(() => () => cancelCityStateInFlight(), []);

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
        pageIndex: 1,
        pageSize: 20,
        countryId: countryIdUSA,
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

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setIsLoading(true);
        const { statusCode, data } = await getApi(GET_PATIENT_BY_ID, {
          params: { id },
        });
        if (statusCode === 200 && data) patchFormFromApi(data);
      } catch (e) {
        console.error("Fetch patient by id failed", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isEdit, id]);

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

  const getRawFile = (f) => f?.originFileObj ?? f;

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const hasNonEmptyUrl = (u) => typeof u === "string" && u.trim().length > 0;

  const extractRawFile = (item) => {
    if (!item) return null;
    if (item.originFileObj instanceof File) return item.originFileObj;
    if (item.file instanceof File) return item.file;
    if (item.raw instanceof File) return item.raw;
    if (item.blobFile instanceof File) return item.blobFile;
    if (item instanceof File) return item;
    return null;
  };

  const toApiDoc = async (item) => {
    if (!item) return null;

    if (hasNonEmptyUrl(item.url)) {
      return {
        url: item.url,
        fileName: item.fileName || item.name || "document",
      };
    }

    const raw = extractRawFile(item);
    if (raw) {
      const base64 = await fileToBase64(raw);
      return {
        url: base64,
        fileName: item.fileName || item.name || raw.name || "document",
      };
    }

    return null;
  };

  const oneToApiDoc = async (arr = []) => {
    if (!Array.isArray(arr) || !arr.length) return null;
    return await toApiDoc(arr[0]);
  };

  const manyToApiDocs = async (arr = []) => {
    if (!Array.isArray(arr) || !arr.length) return null;
    const out = [];
    for (const it of arr) {
      const doc = await toApiDoc(it);
      if (doc) out.push(doc);
    }
    return out.length ? out : null;
  };

  const toIsoOrNull = (d) => (d ? dayjs(d).toISOString() : null);

  const handleSubmit = async () => {
    if (!validateFields()) return;

    try {
      setIsLoading(true);
      const passport = await oneToApiDoc(files.passport);
      const visa = await oneToApiDoc(files.visa);
      const prescriptions = await manyToApiDocs(files.prescription);

      if (!prescriptions) {
        errorToast("Please attach at least one valid prescription file.");
        setIsLoading(false);
        return;
      }

      const ccRule = getCountryRule(form.phoneCountryCode);
      const rawPhone = digitsOnly(form.phone);

      const payload = {
        name: form.patientName?.trim(),
        email: form.email?.trim(),
        countryCode: ccRule.value,
        phoneNumber: rawPhone,
        dateOfBirth: toIsoOrNull(form.dob),
        visaExpiryDate: toIsoOrNull(form.visaExpiry),
        usaLastEntryDate: toIsoOrNull(form.lastEntry),
        visaType: Number(form.visaTypeId),
        visaTypeName: form.visaTypeName,
        address1: form.street?.trim() || "",
        address2: form.apt?.trim() || "",
        zipCodeId: form.zipCodeId,
        cityId: form.cityId,
        stateId: form.stateId,
        countryId: form.countryId || null,
        passport,
        visa,
        prescriptions,
      };
      if (passport !== undefined) payload.passport = passport;
      if (visa !== undefined) payload.visa = visa;
      if (prescriptions !== undefined) payload.prescriptions = prescriptions;

      console.log("Payload:", payload);
      const { statusCode, message } = isEdit
        ? await putApi(UPDATE_PATIENT, { id, ...payload })
        : await postApi(ADD_PATIENT, payload);
      if (statusCode === 200) {
        successToast(isEdit ? "Patient updated" : "Patient added");
        navigate("/patients");
      } else {
        errorToast(message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/patients");
  };

  return (
    <div className="addp">
      {isLoading && <Loader />}
      <SubHeader
        title={isEdit ? "Edit Patient" : "Add New Patient"}
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
          />
          <PhoneField
            required
            value={form.phone}
            countryCode={form.phoneCountryCode}
            onChangeCountry={(val) => {
              setForm((p) => ({ ...p, phoneCountryCode: val }));
              setErrors((prev) => ({ ...prev, phone: "" }));
            }}
            onChangePhone={(val) => {
              setForm((p) => ({ ...p, phone: val }));
              setErrors((prev) => ({ ...prev, phone: "" }));
            }}
            errorText={errors.phone}
          />
          <InputField
            title="Email"
            placeholder="Enter email"
            value={form.email}
            onChange={update("email")}
            type="email"
            errorText={errors.email}
            required
          />

          <DateField
            title="Date Of Birth"
            value={form.dob}
            onChange={(d) => update("dob")(d)}
            required
            errorText={errors.dob}
            disabledDate={disabledFuture}
            format={DATE_FORMAT} // MM-DD-YYYY
          />

          <SelectInput
            title="Visa Type"
            options={VISA_TYPES}
            value={form.visaTypeId}
            onChange={(val) => {
              setForm((p) => ({
                ...p,
                visaTypeId: val,
                visaTypeName: VISA_ID_TO_LABEL[val] || "",
              }));
              setErrors((prev) => ({ ...prev, visaType: "" }));
            }}
            errorText={errors.visaType}
            required
          />

          <DateField
            title="Visa Expiry Date"
            value={form.visaExpiry}
            onChange={(d) => update("visaExpiry")(d)}
            errorText={errors.visaExpiry}
            required
            disabledDate={disabledPastAndToday} // only future dates
            format={DATE_FORMAT} // MM-DD-YYYY
          />

          <DateField
            title="USA Last Entry Date"
            value={form.lastEntry}
            onChange={(d) => update("lastEntry")(d)}
            errorText={errors.lastEntry}
            required
            disabledDate={disabledTodayAndFuture}
            format={DATE_FORMAT} // MM-DD-YYYY
          />
        </div>

        <Divider />
        {/* Location */}
        <h4 className="sec-title">Location Information</h4>
        <div className="grid-3">
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
            placeholder="City"
            value={form.city}
            onChange={update("city")}
            disabled
            errorText={errors.city}
            required
          />
          <InputField
            title="State"
            placeholder="State"
            value={form.state}
            onChange={update("state")}
            disabled
            errorText={errors.state}
            required
          />
          <InputField
            title="House Number & Street Name"
            placeholder="Enter House Number & Street Name"
            value={form.street}
            onChange={update("street")}
            errorText={errors.street}
            required
          />
          <InputField
            title="Apartment / Unit Number"
            placeholder="Enter Apartment / Unit Number"
            value={form.apt}
            onChange={update("apt")}
            errorText={errors.apt}
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
            onChange={(f) => {
              setFiles((p) => ({ ...p, passport: f }));
              if (f?.length) clearError("passport");
            }}
            errorText={errors.passport}
          />
          <FileDropzone
            title="Visa"
            accept=".pdf,.jpg,.jpeg,.png"
            value={files.visa}
            onChange={(f) => {
              setFiles((p) => ({ ...p, visa: f }));
              if (f?.length) clearError("visa");
            }}
            required
            errorText={errors.visa}
          />
          <FileDropzone
            title="Prescription"
            accept=".pdf,.jpg,.jpeg,.png"
            value={files.prescription}
            onChange={(f) => {
              setFiles((p) => ({ ...p, prescription: f }));
              if (f?.length) clearError("prescriptions");
            }}
            required
            multiple
            errorText={errors.prescriptions}
          />
        </div>
        <div className="actions">
          <div className="actions_left">
            <p className="note">Note: PDF / JPG / PNG file is allowed!</p>
          </div>
          <div className="actions_right">
            {/* UPDATED: Cancel now navigates to /patients */}
            <ButtonComponent variant="danger" onClick={handleBack}>
              Cancel
            </ButtonComponent>
            <ButtonComponent variant="primary" onClick={handleSubmit}>
              {isEdit ? "Update" : "Save"}
            </ButtonComponent>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AddOrEditPatients;
