// src/pages/Profile/Profile.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import SubHeader from "../../../components/SubHeader/SubHeader";
import "./Profile.scss";
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

const PLACEHOLDER_AVATAR = DummyUser;

/** Build a clean 1-line address for the “Location” display */
const formatAddressLine = ({
  house = "",
  street = "",
  unit = "",
  city = "",
  state = "",
  zip = "",
  country = "",
}) => {
  const line1 = [house, street].filter(Boolean).join(", ");
  const line2 = [unit].filter(Boolean).join("");
  const line3 = [city, state, zip].filter(Boolean).join(", ");
  const line4 = [country].filter(Boolean).join("");

  return [line1, line2, line3, line4].filter(Boolean).join(" • ");
};

/** API → UI mapping (handles API’s field names & the `profilePictute` typo) */
const apiToUi = (api) => {
  if (!api) return null;

  const {
    profilePictute, // note the typo from API
    userName,
    email,
    phoneNumber,
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

  // naive split of address1 into house/street (non-destructive)
  const [houseMaybe, ...streetRest] = (address1 || "").split(",");
  const house = (houseMaybe || "").trim();
  const street = streetRest.join(",").trim();

  const ui = {
    avatar: profilePictute || PLACEHOLDER_AVATAR,
    name: userName || "",
    phone: phoneNumber || "",
    email: email || "",

    // granular address
    house: house || "",
    street: street || address1 || "",
    unit: address2 || "",
    city: cityName || "",
    state: stateName || "",
    zip: zipCode || "",
    country: countryName || "",

    // derived combined line
    zipId: zipCodeId,
    cityId,
    stateId,
    countryId: countryId || "5f030c51-ae0b-4fd5-8a4c-39f74e63c570",
    addressLine: "",
  };

  ui.addressLine = formatAddressLine({
    house: ui.house,
    street: ui.street,
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
  const address1 = [ui.house, ui.street].filter(Boolean).join(", ");
  return {
    profilePictute: ui.avatar, // if your backend accepts a URL/base64 here; else upload separately
    userName: ui.name,
    phoneNumber: ui.phone,
    address1: address1,
    address2: ui.unit || "",
    zipCodeId: ui.zipId, // <- ID
    cityId: ui.cityId, // <- ID
    stateId: ui.stateId, // <- ID
    countryId: ui.countryId || "5f030c51-ae0b-4fd5-8a4c-39f74e63c570", // fixed
  };
};

const Profile = () => {
  const empty = useMemo(
    () => ({
      avatar: PLACEHOLDER_AVATAR,
      name: "",
      phone: "",
      email: "",
      addressLine: "",
      zip: "",
      city: "",
      state: "",
      zipId: undefined,
      cityId: undefined,
      stateId: undefined,
      countryId: "5f030c51-ae0b-4fd5-8a4c-39f74e63c570", // fixed as you said
      house: "",
      street: "",
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

    // cancel any previous request (user might change selection quickly)
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

  // cleanup on unmount
  useEffect(() => () => cancelCityStateInFlight(), []);

  const fetchZipCodes = async (query = "") => {
    // 1) Cache hit => instant render
    const q = String(query || "").trim();
    if (cacheRef.current.has(q)) {
      setZipOptions(cacheRef.current.get(q));
      return;
    }

    // 2) Cancel any previous request
    cancelInFlight();

    // 3) Fire a new request
    const controller = new AbortController();
    abortRef.current = controller;

    setZipLoading(true);
    try {
      const payload = {
        searchString: q,
        pageIndex: 1,
        pageSize: 20,
      };
      const { statusCode, data } = await postApi(GET_ALL_ZIPCODE, payload, {
        signal: controller.signal,
      });

      const options = statusCode === 200 && Array.isArray(data) ? data : [];
      setZipOptions(options);
      cacheRef.current.set(q, options); // cache result
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("Zip fetch error:", err);
        setZipOptions([]);
      }
    } finally {
      setZipLoading(false);
      abortRef.current = null;
    }
  };

  useEffect(() => {
    fetchZipCodes("");
    return () => cancelInFlight();
  }, []);

  const handleZipSearch = (input) => {
    runDebounced(() => fetchZipCodes(input), 250);
  };

  const handleZipFocus = () => {
    // prefetch if nothing loaded yet
    if (!zipOptions.length) fetchZipCodes("");
  };

  const handleZipChange = (value, option) => {
    setDraft((p) => ({
      ...p,
      zipId: value,
      zip: option?.label || "",
      city: "",
      state: "",
      cityId: undefined,
      stateId: undefined,
    }));
    if (value) fetchStateAndCityByZipCode(value);
  };

  const handleZipClear = () => {
    setDraft((p) => ({ ...p, zipId: undefined, zip: "", city: "", state: "" }));
  };

  // Trigger hidden input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle image file selection (preview only; upload to server separately if needed)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      errorToast("Please upload a JPG or PNG file only.");
      e.target.value = "";
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      // Update both so UI is in sync regardless of edit mode
      setDraft((prev) => ({ ...prev, avatar: reader.result }));
      setData((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);

    // Keep original file for upload if needed
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
      // keep combined location updated live while editing
      next.addressLine = formatAddressLine({
        house: next.house,
        street: next.street,
        unit: next.unit,
        city: next.city,
        state: next.state,
        zip: next.zip,
        country: next.country,
      });
      return next;
    });
  };

  const handleEdit = () => {
    setDraft(data); // start from current values
    setEdit(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let avatarBase64;
      if (avatarFile) {
        avatarBase64 = await fileToBase64StringOnly(avatarFile);
      }
      const base = edit ? draft : data; // ← use current source of truth
      const payload = uiToApi({
        ...base,
        avatar: avatarBase64 || base.avatar,
      });
      const {
        statusCode,
        data: resp,
        message,
      } = await postApi(UPDATE_USER, payload);

      if (statusCode === 200) {
        successToast(message || "Profile updated successfully");
        const fresh = resp?.data ? apiToUi(resp.data) : { ...draft };
        setData(fresh);
        setDraft(fresh);
        setAvatarFile(null); // clear pending file so the button goes back to "Upload"
        setEdit(false);
      } else {
        errorToast("Unable to update profile");
      }
    } catch (e) {
      errorToast("Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(data); // discard changes
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
        setData(ui);
        setDraft(ui);
        console.log("data:", data);
        console.log("draft:", draft);
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
            {" "}
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
                    // Optional: revert preview to saved avatar
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
              <div className="actions">
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
              <div className="piValue accent">{data.phone || "-"}</div>
            </div>
            <div className="piCol">
              <div className="piLabel">Email</div>
              <div className="piValue">{data.email || "-"}</div>
            </div>
          </div>

          {/* Edit inputs directly below the summary */}
          {edit && (
            <div className="piGrid piGrid--form piGrid--tightTop">
              <InputField
                title="User Name"
                name="name"
                placeholder="Enter User Name"
                value={draft.name}
                onChange={onChange}
              />

              <InputField
                title="Phone Number"
                name="phone"
                placeholder="Enter Phone Number"
                value={draft.phone}
                onChange={onChange}
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
                options={zipOptions} // [{label, value}]
                value={draft.zipId} // UUID
                onChange={handleZipChange} // keeps zipId + zip label
                showSearch
                allowClear
                // Remote search hooks
                filterOption={false} // don't filter on client
                onSearch={handleZipSearch} // debounce + API
                onFocus={handleZipFocus}
                onClear={handleZipClear}
                loading={zipLoading}
                notFoundContent={zipLoading ? "Loading..." : "No results"}
                required
              />
              <InputField
                title="City"
                name="city"
                placeholder="Current City"
                value={draft.city}
                onChange={onChange}
                disabled
              />
              <InputField
                title="State"
                name="state"
                placeholder="Current State"
                value={draft.state}
                onChange={onChange}
                disabled
              />
              <InputField
                title="House Number"
                name="house"
                placeholder="Enter House Number"
                value={draft.house}
                onChange={onChange}
              />
              <InputField
                title="Street Name"
                name="street"
                placeholder="Enter Street Name"
                value={draft.street}
                onChange={onChange}
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
        </div>
      </section>
    </div>
  );
};

export default Profile;
