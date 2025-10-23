// Profile.jsx
import React, { useMemo, useState, useRef } from "react";
import SubHeader from "../../../components/SubHeader/SubHeader";
import "./Profile.scss";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import InputField from "../../../components/InputField/InputField";
import EditIcon from "../../../assets/icons/EditIcon";

const Profile = () => {
  const initial = useMemo(
    () => ({
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&q=80&auto=format&fit=crop",
      name: "Brahim elabbaoui",
      phone: "+91 9876543210",
      email: "brahimelabbaoui1124@gmail.com",
      addressLine:
        "2nd cross, Banashankari, Bengaluru, Karnataka 562127",
      zip: "",
      city: "",
      state: "",
      house: "",
      street: "",
      unit: "",
    }),
    []
  );

  const [data, setData] = useState(initial);
  const [draft, setDraft] = useState(initial); // used while editing
  const [edit, setEdit] = useState(false);
  const fileInputRef = useRef(null);

  // Trigger hidden input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a JPG or PNG file only.");
      e.target.value = ""; // clear input
      return;
    }

    // Preview selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setData((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setDraft((p) => ({ ...p, [name]: value }));
  };

  const handleEdit = () => {
    setDraft(data); // start from current values
    setEdit(true);
  };

  const handleSave = () => {
    // TODO: API call with "draft"
    setData(draft);
    setEdit(false);
  };

  const handleCancel = () => {
    setDraft(data); // discard changes
    setEdit(false);
  };

  return (
    <div className="profile">
      <SubHeader title="Profile" showBack={false} showRight={false} />

      <section className="profile_sec">
        {/* Hero */}
        <div className="profileHero">
          <div className="profileHero__avatar">
            <img src={data.avatar} alt={data.name} />
          </div>

          <div className="profileHero__upload">
            <button type="button" className="uploadBtn" onClick={handleUploadClick}>Upload New Photo</button>
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
                <EditIcon />Edit
              </ButtonComponent>
            ) : (
              <div className="actions">
                <ButtonComponent variant="danger" onClick={handleCancel}>
                  Cancel
                </ButtonComponent>
                <ButtonComponent variant="primary" onClick={handleSave}>
                  Save
                </ButtonComponent>
              </div>
            )}
          </div>

          {/* Summary row */}
          <div className="piGrid piGrid--summary">
            <div className="piCol">
              <div className="piLabel">User Name</div>
              <div className="piValue">{data.name}</div>
            </div>
            <div className="piCol">
              <div className="piLabel">Phone Number</div>
              <div className="piValue accent">{data.phone}</div>
            </div>
            <div className="piCol">
              <div className="piLabel">Email</div>
              <div className="piValue">{data.email}</div>
            </div>
          </div>

          {/* 👇 EDIT inputs directly below the summary (Figma layout) */}
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
              />
            </div>
          )}

          <div className="piDivider" />

          {/* Location title + address line */}
          <div className="piGrid piGrid--location">
            <div className="piCol col-12">
              <div className="piLabel">Location</div>
              <div className="piValue">{data.addressLine}</div>
            </div>
          </div>

          {/* Location edit grid — stays below Location section */}
          {edit && (
            <div className="piGrid piGrid--form">
              <InputField
                title="Zip Code"
                name="zip"
                placeholder="Enter Zip Code"
                value={draft.zip}
                onChange={onChange}
              />
              <InputField
                title="City"
                name="city"
                placeholder="Current City"
                value={draft.city}
                onChange={onChange}
              />
              <InputField
                title="State"
                name="state"
                placeholder="Current State"
                value={draft.state}
                onChange={onChange}
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
