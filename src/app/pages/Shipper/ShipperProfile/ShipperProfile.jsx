// src/pages/Profile/Profile.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import SubHeader from "../../../components/SubHeader/SubHeader";
import "./ShipperProfile.scss";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import InputField from "../../../components/InputField/InputField";
import EditIcon from "../../../assets/icons/EditIcon";
import {
  getApi,
  postApi /* replace with patchApi if you have it */,
} from "../../../utils/apiService";
import {
  GET_ALL_ZIPCODE,
  GET_STATE_AND_CITY,
  GET_USER_PROFILE,
  UPDATE_USER,
} from "../../../utils/apiPath";
import { successToast, errorToast } from "../../../services/ToastHelper";
import Loader from "../../../components/Loader/Loader";
import SelectInput from "../../../components/SelectInput/SelectInput";
import DummyUser from "../../../assets/SampleUser.jpg";
import PhoneField from "../../../components/InputField/PhoneField";

const countryIdUSA = "0b4e5851-7670-462b-9e12-919a60ab2c17";

const PLACEHOLDER_AVATAR = DummyUser;

/** Build a clean 1-line address for the “Location” display */
const formatAddressLine = ({
  house = "",
  unit = "",
  city = "",
  state = "",
  zip = "",
  country = "",
}) => {
  const line1 = [house].filter(Boolean).join(", ");
  const line2 = [unit].filter(Boolean).join(",");
  const line3 = [city, state, zip].filter(Boolean).join(", ");
  const line4 = [country].filter(Boolean).join("");

  return [line1, line2, line3, line4].filter(Boolean).join(",  ");
};

/** 🔹 Phone helpers (same rules as Add/Edit Patients) */
const COUNTRY_CODES = [
  { value: "+1", iso: "US", label: "US (+1)", max: 10, re: /^\d{10}$/ },
  { value: "+91", iso: "IN", label: "IN (+91)", max: 10, re: /^[6-9]\d{9}$/ },
];

const getCountryRule = (code = "+1") =>
  COUNTRY_CODES.find((c) => c.value === code) || COUNTRY_CODES[0];

const digitsOnly = (s = "") => String(s).replace(/\D+/g, "");

/** API → UI mapping (handles API’s field names & the `profilePicture` typo) */
const apiToUi = (api) => {
  if (!api) return null;

  const {
    profilePicture, // note the typo from API
    userName,
    email,
    phoneNumber,
    countryCode,
    address1,
    address2,
    zipCode,
    cityName,
    stateName,
    countryName,
    zipCodeId,
    cityId,
    stateId,
    countryId,
  } = api;

  const ui = {
    avatar: profilePicture || PLACEHOLDER_AVATAR,
    name: userName || "",
    phone: phoneNumber || "",
    phoneCountryCode: countryCode || "+1",
    email: email || "",

    // granular address
    house: address1 || "",
    unit: address2 || "",
    city: cityName || "",
    state: stateName || "",
    zip: zipCode || "",
    country: countryName || "",

    // derived combined line
    zipId: zipCodeId,
    cityId,
    stateId,
    countryId: countryId || "0b4e5851-7670-462b-9e12-919a60ab2c17",
    addressLine: "",
  };

  ui.addressLine = formatAddressLine({
    house: ui.house,
    unit: ui.unit,
    city: ui.city,
    state: ui.state,
    zip: ui.zip,
    country: ui.country,
  });

  return ui;
};

/** UI → API mapping for update (adjust keys if your backend expects IDs) */
const uiToApi = (ui) => {
  const normalizeAvatar = (v = "") => {
    if (!v) return v;
    if (v.startsWith("data:")) {
      const parts = v.split(",");
      return parts.length > 1 ? parts[1] : v; // raw base64
    }
    // If it's already raw base64 or a plain key/URL, pass-through.
    return v;
  };
  return {
    profilePicture: normalizeAvatar(ui.avatar),
    userName: ui.name,
    countryCode: ui.phoneCountryCode || "+1",
    phoneNumber: String(ui.phone || "").replace(/\D+/g, ""), // digits only
    address1: ui.house || "",
    address2: ui.unit || "",
    zipCodeId: ui.zipId, // <- ID
    cityId: ui.cityId, // <- ID
    stateId: ui.stateId, // <- ID
    countryId: ui.countryId || "0b4e5851-7670-462b-9e12-919a60ab2c17", // fixed
  };
};

const ShipperProfile = () => {
  const empty = useMemo(
    () => ({
      avatar: PLACEHOLDER_AVATAR,
      name: "",
      phone: "",
      phoneCountryCode: "+1",
      email: "",
      addressLine: "",
      zip: "",
      city: "",
      state: "",
      zipId: undefined,
      cityId: undefined,
      stateId: undefined,
      countryId: "0b4e5851-7670-462b-9e12-919a60ab2c17",
      house: "",
      unit: "",
    }),
    []
  );

  const [data, setData] = useState(empty);
  const [draft, setDraft] = useState(empty); // used while editing
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  const [zipOptions, setZipOptions] = useState([]);
  const [zipLoading, setZipLoading] = useState(false);
  const debounceRef = useRef();
  const abortRef = useRef(null);
  const cacheRef = useRef(new Map());
  const cityStateAbortRef = useRef(null);
  const requestIdRef = useRef(0);
  const MIN_ZIP_CHARS = 3;

  /** 🔹 Error state */
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    zipId: "",
    house: "",
  });

  const upsertZipOption = (id, label) => {
    if (!id || !label) return;
    setZipOptions((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (list.some((o) => o.value === id)) return list;
      return [{ value: id, label }, ...list];
    });
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

  const fetchStateAndCityByZipCode = async (zipId) => {
    if (!zipId) return;

    cancelCityStateInFlight();
    const controller = new AbortController();
    cityStateAbortRef.current = controller;

    try {
      const { statusCode, data } = await getApi(GET_STATE_AND_CITY, {
        params: { zipCodeId: zipId },
        signal: controller.signal,
      });

      if (statusCode === 200 && data) {
        setDraft((p) => ({
          ...p,
          stateId: data.stateId,
          cityId: data.cityId,
          state: data.stateName ?? "",
          city: data.cityName ?? "",
        }));
      } else {
        setDraft((p) => ({ ...p, city: "", state: "" }));
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("fetchStateAndCityByZipCode error:", err);
      }
    } finally {
      cityStateAbortRef.current = null;
    }
  };

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
        pageIndex: 0,
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

  const handleZipChange = (value, option) => {
    const id = value;
    const label = option?.label ?? "";
    setDraft((p) => ({
      ...p,
      zipId: id,
      zip: label,
      city: "",
      state: "",
      cityId: undefined,
      stateId: undefined,
    }));
    setErrors((prev) => ({ ...prev, zipId: "" })); // clear zip error
    if (id) fetchStateAndCityByZipCode(id);
  };

  const handleZipClear = () => {
    setDraft((p) => ({ ...p, zipId: undefined, zip: "", city: "", state: "" }));
    setErrors((prev) => ({ ...prev, zipId: "" }));
  };

  // Trigger hidden input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      errorToast("Please upload a JPG or PNG file only.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDraft((prev) => ({ ...prev, avatar: reader.result }));
      setData((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);
  };

  const fileToBase64StringOnly = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onChange = (e) => {
    const { name, value } = e.target;
    setDraft((p) => {
      const next = { ...p, [name]: value };
      next.addressLine = formatAddressLine({
        house: next.house,
        unit: next.unit,
        city: next.city,
        state: next.state,
        zip: next.zip,
        country: next.country,
      });
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear field error
  };

  const handleEdit = () => {
    setDraft(data);
    setEdit(true);
  };

  /** 🔹 Validation for profile form */
  const validateProfile = () => {
    const errObj = {
      name: "",
      phone: "",
      zipId: "",
      house: "",
    };

    // Name
    if (!draft.name?.trim()) {
      errObj.name = "User name is required";
    } else if (draft.name.trim().length < 2) {
      errObj.name = "Name must be at least 2 characters";
    }

    // Phone
    const rule = getCountryRule(draft.phoneCountryCode || "+1");
    const rawPhone = digitsOnly(draft.phone);
    if (!rawPhone) {
      errObj.phone = "Phone number is required";
    } else if (!rule.re.test(rawPhone)) {
      errObj.phone =
        rule.value === "+1"
          ? "Enter a valid 10-digit US number"
          : "Enter a valid 10-digit Indian number (starts 6–9)";
    }

    // Zip
    if (!draft.zipId) {
      errObj.zipId = "Zip Code is required";
    }

    // House / Street
    if (!draft.house?.trim()) {
      errObj.house = "House Number & Street Name is required";
    }

    setErrors(errObj);
    return Object.values(errObj).every((v) => !v);
  };

  const handleSave = async () => {
    // validate only when in edit mode
    if (edit && !validateProfile()) {
      return;
    }

    try {
      setSaving(true);
      const base = edit ? draft : data;

      const payload = uiToApi(base);

      if (!avatarFile) {
        delete payload.profilePicture;
      } else {
        const avatarBase64 = await fileToBase64StringOnly(avatarFile);
        payload.profilePicture = avatarBase64;
      }

      const {
        statusCode,
        message,
        data: apiUser,
      } = await postApi(UPDATE_USER, payload);

      if (statusCode === 200) {
        successToast(message || "Profile updated successfully");

        const fresh = apiToUi(apiUser);
        setData(fresh);
        setDraft(fresh);
        setAvatarFile(null);
        setEdit(false);

        try {
          const raw = sessionStorage.getItem("user");
          const existing = raw ? JSON.parse(raw) : {};

          const updated = {
            ...existing,
            userName: apiUser?.userName ?? existing.userName,
            profilePicture: apiUser?.profilePicture ?? existing.profilePicture,
            phoneNumber: apiUser?.phoneNumber ?? existing.phoneNumber,
            emailId: apiUser?.email ?? existing.emailId,
            userId: existing.userId || apiUser?.id,
          };

          sessionStorage.setItem("user", JSON.stringify(updated));
          window.dispatchEvent(new Event("session-user-updated"));
          console.log("sessionStorage.user updated:", updated);
        } catch (e) {
          console.warn("Failed to update sessionStorage.user:", e);
        }
      } else {
        errorToast("Unable to update profile");
      }
    } catch (e) {
      console.error("Unable to update profile", e);
      errorToast(e?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(data);
    setErrors({ name: "", phone: "", zipId: "", house: "" });
    setEdit(false);
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const { statusCode, data } = await getApi(GET_USER_PROFILE);
      if (statusCode === 200) {
        const ui = apiToUi(data);
        if (ui?.zipId && ui?.zip) upsertZipOption(ui.zipId, ui.zip);
        setData(ui);
        setDraft(ui);
      }
    } catch (e) {
      errorToast("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile">
      {isLoading && <Loader />}
      <SubHeader title="Profile" showBack={false} showRight={false} />

      <section className="profile_sec">
        {/* Hero */}
        <div className="profileHero">
          <div className="profileHero__avatar">
            <img
              src={(edit ? draft.avatar : data.avatar) || PLACEHOLDER_AVATAR}
              alt={(edit ? draft.name : data.name) || "User"}
            />
          </div>

          <div className="profileHero__upload">
            {avatarFile ? (
              <div className="uploadActions">
                <button
                  type="button"
                  className="uploadBtn uploadBtn--primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  className="uploadBtn uploadBtn--ghost"
                  onClick={() => {
                    setAvatarFile(null);
                    setDraft((p) => ({
                      ...p,
                      avatar: data.avatar || PLACEHOLDER_AVATAR,
                    }));
                    setData((p) => ({
                      ...p,
                      avatar: data.avatar || PLACEHOLDER_AVATAR,
                    }));
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="uploadBtn"
                onClick={handleUploadClick}
              >
                Upload New Photo
              </button>
            )}
            <p className="hint">
              <span>At least 800×800 px recommended.</span>
              <span>JPG PNG is allowed</span>
            </p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card__header">
            <h3>Personal Info</h3>

            {!edit ? (
              <ButtonComponent variant="light" onClick={handleEdit}>
                <EditIcon />
                Edit
              </ButtonComponent>
            ) : (
              <div className="actions actions--desktop">
                <ButtonComponent
                  variant="danger"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </ButtonComponent>
                <ButtonComponent
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </ButtonComponent>
              </div>
            )}
          </div>

          {/* Summary row */}
          <div className="piGrid piGrid--summary">
            <div className="piCol">
              <div className="piLabel">User Name</div>
              <div className="piValue">{data.name || "-"}</div>
            </div>
            <div className="piCol">
              <div className="piLabel">Phone Number</div>
              <div className="piValue accent">
                {data.phoneCountryCode + " " + data.phone || "-"}
              </div>
            </div>
            <div className="piCol">
              <div className="piLabel">Email</div>
              <div className="piValue">{data.email || "-"}</div>
            </div>
          </div>

          {/* Edit inputs */}
          {edit && (
            <div className="piGrid piGrid--form piGrid--tightTop">
              <InputField
                title="User Name"
                name="name"
                placeholder="Enter User Name"
                value={draft.name}
                onChange={onChange}
                required
                errorText={errors.name}
              />

              <PhoneField
                title="Phone Number"
                required
                value={draft.phone}
                countryCode={draft.phoneCountryCode || "+1"}
                onChangeCountry={(val) => {
                  setDraft((p) => ({ ...p, phoneCountryCode: val }));
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                onChangePhone={(val) => {
                  setDraft((p) => ({ ...p, phone: val }));
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                errorText={errors.phone}
              />

              <InputField
                title="Email"
                name="email"
                placeholder="Enter Email"
                value={draft.email}
                onChange={onChange}
                disabled
              />
            </div>
          )}

          <div className="piDivider" />

          {/* Location title + combined line */}
          <div className="piGrid piGrid--location">
            <div className="piCol col-12">
              <div className="piLabel">Location</div>
              <div className="piValue">
                {edit ? draft.addressLine : data.addressLine || "-"}
              </div>
            </div>
          </div>

          {/* Location edit grid */}
          {edit && (
            <div className="piGrid piGrid--form">
              <SelectInput
                title="Zip Code"
                placeholder="Search Zip Code"
                options={zipOptions}
                value={draft.zipId ?? null}
                onChange={handleZipChange}
                showSearch
                allowClear
                filterOption={false}
                onSearch={handleZipSearch}
                onFocus={handleZipFocus}
                onClear={handleZipClear}
                loading={zipLoading}
                notFoundContent={zipLoading ? "Loading..." : "No results"}
                required
                errorText={errors.zipId}
              />
              <InputField
                title="City"
                name="city"
                placeholder="City"
                value={draft.city}
                onChange={onChange}
                disabled
              />
              <InputField
                title="State"
                name="state"
                placeholder="State"
                value={draft.state}
                onChange={onChange}
                disabled
              />
              <InputField
                title="House Number & Street Name"
                name="house"
                placeholder="Enter House Number"
                value={draft.house}
                onChange={onChange}
                required
                errorText={errors.house}
              />
              <InputField
                title="Apartment / Unit Number"
                name="unit"
                placeholder="Enter Apartment / Unit Number"
                value={draft.unit}
                onChange={onChange}
              />
            </div>
          )}
          {edit && (
            <div className="card__footer actions actions--mobile">
              <ButtonComponent
                variant="danger"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </ButtonComponent>
              <ButtonComponent
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </ButtonComponent>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShipperProfile;
