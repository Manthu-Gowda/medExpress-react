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

// helpers (near other date helpers)
const disabledTodayAndFuture = (current) =>
  current && !dayjs(current).isBefore(dayjs(), "day"); // disables today & future

const initialErrors = {
  patientName: "",
  phone: "",
  email: "",
  dob: "",
  visaType: "", // keep the same key if your InputField shows errors.visaType
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

const phoneRe = /^[0-9+\-() ]{7,15}$/; // replace if you want stricter E.164

const isFuture = (d) => dayjs(d).isAfter(dayjs(), "day");
const isPast = (d) => dayjs(d).isBefore(dayjs(), "day");

const AddOrEditPatients = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    email: "",
    dob: null,
    // ---- visa fields
    visaTypeId: undefined, // <-- store the ID here
    visaTypeName: "", // <-- store the label here
    visaExpiry: null,
    lastEntry: null,
    zipCodeId: undefined,
    stateId: undefined,
    cityId: undefined,
    countryId: "5f030c51-ae0b-4fd5-8a4c-39f74e63c570",
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
      countryId: data?.countryId ?? "5f030c51-ae0b-4fd5-8a4c-39f74e63c570",

      // display strings; you might get names in payload or you can fetch via zip
      city: data?.cityName ?? "",
      state: data?.stateName ?? "",
      zip: data?.zipCode ?? "",
    }));
    setFiles({
      passport: data?.passport?.url
        ? [
            {
              uid: "-1", // required by AntD Upload
              name: data.passport.fileName || "Passport.pdf", // name for display
              status: "done", // mark as uploaded
              url: data.passport.url, // S3 file
              fileName: data.passport.fileName, // keep original filename
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

    if (data?.zipCodeId) {
      const label = data?.zipCode || ""; // <-- correct source for label
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
    if (!form.phone?.trim()) {
      errObj.phone = "Phone is required";
    } else if (!phoneRe.test(form.phone.trim())) {
      errObj.phone = "Enter a valid phone number";
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

    // Visa expiry (optional -> if present, must be today or future)
    if (form.visaExpiry && isPast(form.visaExpiry)) {
      errObj.visaExpiry = "Visa expiry cannot be in the past";
    }
    // Visa expiry (REQUIRED and not in the past)
    if (!form.visaExpiry) {
      errObj.visaExpiry = "Visa expiry date is required";
    } else if (isPast(form.visaExpiry)) {
      errObj.visaExpiry = "Visa expiry cannot be in the past";
    }

    // USA last entry (optional -> if present, cannot be in the future)
    if (form.lastEntry && isFuture(form.lastEntry)) {
      errObj.lastEntry = "Last entry cannot be in the future";
    }
    if (!form.lastEntry) {
      errObj.lastEntry = "USA last entry date is required";
    } else if (!dayjs(form.lastEntry).isBefore(dayjs(), "day")) {
      errObj.lastEntry = "Last entry cannot be today or in the future";
    }
    // Zip (required -> use zipCodeId since Select stores UUID)
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

    // Passport file (required)
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

    // cancel any previous request (user might change selection quickly)
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
    // 1) Cache hit => instant render
    const q = String(query || "").trim();
    if (cacheRef.current.has(q)) {
      setZipOptions(cacheRef.current.get(q));
      return;
    }

    // assign an id to this request
    const myId = ++requestIdRef.current;

    setZipLoading(true);
    try {
      const payload = {
        searchString: q,
        pageIndex: 1,
        pageSize: 20,
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

  const MIN_ZIP_CHARS = 3;
  const handleZipSearch = (input = "") => {
    const q = String(input).trim();
    // if user erased or < 3 chars, clear list and cancel in-flight
    if (q.length < MIN_ZIP_CHARS) {
      cancelInFlight();
      setZipOptions([]);
      setZipLoading(false);
      return;
    }
    runDebounced(() => fetchZipCodes(q), 300);
  };

  const handleZipFocus = () => {
    // prefetch if nothing loaded yet
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
  };

  const getRawFile = (f) => f?.originFileObj ?? f;

  // ===== helpers: put above handleSubmit =====

  // Turn "File" into { fileName, base64 }
  // Convert a File into a base64 string (without data: prefix)
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const hasNonEmptyUrl = (u) => typeof u === "string" && u.trim().length > 0;

  // Try to pull the underlying File object from various possible shapes
  const extractRawFile = (item) => {
    if (!item) return null;
    if (item.originFileObj instanceof File) return item.originFileObj;
    if (item.file instanceof File) return item.file;
    if (item.raw instanceof File) return item.raw;
    if (item.blobFile instanceof File) return item.blobFile;
    if (item instanceof File) return item;
    return null;
  };

  // Normalize one item to { url, fileName } or return null if not usable
  const toApiDoc = async (item) => {
    if (!item) return null;

    // Existing uploaded file with a valid URL
    if (hasNonEmptyUrl(item.url)) {
      return {
        url: item.url,
        fileName: item.fileName || item.name || "document",
      };
    }

    // Newly uploaded file -> convert to base64
    const raw = extractRawFile(item);
    if (raw) {
      const base64 = await fileToBase64(raw);
      return {
        url: base64,
        fileName: item.fileName || item.name || raw.name || "document",
      };
    }

    // Nothing usable -> skip
    return null;
  };

  // Handle a single-file control (returns one object or null)
  const oneToApiDoc = async (arr = []) => {
    if (!Array.isArray(arr) || !arr.length) return null;
    return await toApiDoc(arr[0]);
  };

  // Handle multi-file control (returns array or null)
  const manyToApiDocs = async (arr = []) => {
    if (!Array.isArray(arr) || !arr.length) return null;
    const out = [];
    for (const it of arr) {
      const doc = await toApiDoc(it);
      if (doc) out.push(doc);
    }
    return out.length ? out : null;
  };

  const encodeOne = async (arr = []) => {
    const raw = arr?.[0] ? getRawFile(arr[0]) : null;
    return raw ? fileToBase64StringOnly(raw) : ""; // empty string if none
  };

  const encodeMany = async (arr = []) => {
    const list = Array.isArray(arr) ? arr : [];
    const out = [];
    for (const it of list) {
      const raw = getRawFile(it);
      out.push(await fileToBase64StringOnly(raw));
    }
    return out;
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
      const payload = {
        // names & contacts
        name: form.patientName?.trim(),
        email: form.email?.trim(),
        phoneNumber: form.phone?.trim(),

        // dates (ISO per your schema)
        dateOfBirth: toIsoOrNull(form.dob),
        visaExpiryDate: toIsoOrNull(form.visaExpiry),
        usaLastEntryDate: toIsoOrNull(form.lastEntry),

        // visa (both fields)
        visaType: Number(form.visaTypeId), // numeric
        visaTypeName: form.visaTypeName, // label

        // address mapping
        address1: form.street?.trim() || "",
        address2: form.apt?.trim() || "",

        // location IDs (schema field names!)
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

      const { statusCode, message } = isEdit
        ? await putApi(UPDATE_PATIENT, { id, ...payload }) // or putApi if you have it
        : await postApi(ADD_PATIENT, payload);
      if (statusCode === 200) {
        successToast(isEdit ? "Patient updated" : "Patient added");
        navigate("/patients");
      } else {
        errorToast(message);
      }
    } catch (e) {
      console.error(e);
      errorToast("Something went wrong while saving the patient.");
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
          <InputField
            title="Phone Number"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={update("phone")}
            type="tel"
            errorText={errors.phone}
            required
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
          />

          <SelectInput
            title="Visa Type"
            options={VISA_TYPES}
            value={form.visaTypeId}
            onChange={(val) =>
              setForm((p) => ({
                ...p,
                visaTypeId: val, // number
                visaTypeName: VISA_ID_TO_LABEL[val] || "", // label
              }))
            }
            errorText={errors.visaType}
            required
          />

          <DateField
            title="Visa Expiry Date"
            value={form.visaExpiry}
            onChange={(d) => update("visaExpiry")(d)}
            errorText={errors.visaExpiry}
            required
          />

          <DateField
            title="USA Last Entry Date"
            value={form.lastEntry}
            onChange={(d) => update("lastEntry")(d)}
            errorText={errors.lastEntry}
            required
            disabledDate={disabledTodayAndFuture}
          />
        </div>

        <Divider />
        {/* Location */}
        <h4 className="sec-title">Location Information</h4>
        <div className="grid-3">
          <SelectInput
            title="Zip Code"
            placeholder="Search Zip Code"
            options={zipOptions} // [{label, value}]
            value={form.zipCodeId ?? null}
            onChange={handleZipChange} // keeps zipCodeId + zip label
            showSearch
            allowClear
            // Remote search hooks
            filterOption={false} // don't filter on client
            onSearch={handleZipSearch} // debounce + API
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
              if (f?.length) clearError("prescriptions"); // note the key name
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
            {" "}
            <ButtonComponent variant="danger">Cancel</ButtonComponent>
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
