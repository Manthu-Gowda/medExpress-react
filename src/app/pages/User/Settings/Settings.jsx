import React, { useState } from "react";
import SubHeader from "../../../components/SubHeader/SubHeader";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import InputField from "../../../components/InputField/InputField";
import "./Settings.scss";

const Settings = () => {
  const [form, setForm] = useState({
    previousPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setForm({
      previousPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!form.previousPassword) newErrors.previousPassword = "Enter previous password";
    if (!form.newPassword) newErrors.newPassword = "Enter new password";
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm your password";
    if (
      form.newPassword &&
      form.confirmPassword &&
      form.newPassword !== form.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // TODO: call API for password update
      console.log("Password updated successfully", form);
      handleCancel();
    }
  };

  return (
    <div className="settings">
      <SubHeader title="Settings" showBack={false} showRight={false} />

      <section className="settings_sec">
        <div className="settings_card">
          <h3 className="settings_title">Change Password</h3>

          <div className="settings_grid">
            <InputField
              title="Previous Password"
              name="previousPassword"
              type="password"
              placeholder="Enter previous password"
              value={form.previousPassword}
              onChange={handleChange}
              required
              errorText={errors.previousPassword}
            />

            <InputField
              title="New Password"
              name="newPassword"
              type="password"
              placeholder="New password"
              value={form.newPassword}
              onChange={handleChange}
              required
              errorText={errors.newPassword}
            />

            <InputField
              title="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              errorText={errors.confirmPassword}
            />
          </div>

          <p className="forgot_note">
            Forgot old password? No worries, we’ll send your reset link to your email{" "}
            <a href="#">Click here</a>
          </p>

          <div className="settings_actions">
            <ButtonComponent variant="danger" onClick={handleCancel}>
              Cancel
            </ButtonComponent>
            <ButtonComponent variant="primary" onClick={handleSubmit}>
              Update Password
            </ButtonComponent>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
