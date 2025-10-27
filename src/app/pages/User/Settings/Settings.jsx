import React, { useState } from "react";
import SubHeader from "../../../components/SubHeader/SubHeader";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import InputField from "../../../components/InputField/InputField";
import "./Settings.scss";
import { CHANGE_PASSWORD } from "../../../utils/apiPath";
import { postApi } from "../../../utils/apiService";
import { successToast } from "../../../services/ToastHelper";
import Loader from "../../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";

const initialValues = {
  previousPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const Settings = () => {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // live-clear or live-validate just the edited field
    setErrors((prev) => {
      const next = { ...prev };

      if (name === "previousPassword") {
        next.previousPassword = "";
      } else if (name === "newPassword") {
        // re-evaluate new + confirm when newPassword changes
        next.newPassword = "";
        if (form.confirmPassword) {
          next.confirmPassword =
            value === form.confirmPassword ? "" : "Passwords do not match";
        }
      } else if (name === "confirmPassword") {
        next.confirmPassword =
          value === (form.newPassword ?? "") ? "" : "Passwords do not match";
      }
      return next;
    });
  };

  const handleCancel = () => {
    setForm(initialValues);
    setErrors({});
  };

  const strongPwdRe =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/;
  const validatePassword = (value, { allowEqualTo } = {}) => {
    if (!value) return "This field is required";
    if (/\s/.test(value)) return "Password should not contain spaces";
    if (!strongPwdRe.test(value)) {
      return "Must be 8+ chars with upper, lower, number & special";
    }
    return "";
  };

  const validateFields = () => {
    const nextErrors = {};

    // previousPassword
    nextErrors.previousPassword = validatePassword(form.previousPassword);

    // newPassword
    nextErrors.newPassword = validatePassword(form.newPassword);
    if (!nextErrors.newPassword && form.newPassword === form.previousPassword) {
      nextErrors.newPassword =
        "New password must differ from previous password";
    }

    // confirmPassword
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password";
    } else if (form.confirmPassword !== form.newPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    } else {
      nextErrors.confirmPassword = "";
    }

    setErrors(nextErrors);
    // Return true only if all messages are empty
    return Object.values(nextErrors).every((msg) => !msg);
  };

  const handleSubmit = async () => {
    if (validateFields()) {
      setIsLoading(true);
      const payload = {
        currentPassword: form.previousPassword,
        newPassword: form.newPassword,
      };
      const { statusCode, data, message } = await postApi(
        CHANGE_PASSWORD,
        payload
      );
      if (statusCode === 200) {
        setIsLoading(false);
        successToast(message);
        sessionStorage.clear();
        navigate("/");
      } else {
        setIsLoading(false);
        errorToast(
          err?.response?.data?.message ||
            err?.message ||
            "Something went wrong. Please try again."
        );
      }
    }
  };

  return (
    <div className="settings">
      {isLoading && <Loader />}
      <SubHeader title="Settings" showBack={false} showRight={false} />

      <section className="settings_sec">
        <h3 className="settings_title">Change Password</h3>
        <div className="settings_grid">
          <InputField
            title="Current Password"
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

        <p className="settings_note">
          Forgot old password? No worries, we’ll send your reset link to your
          email <a href="/forgot">Click here</a>
        </p>

        <div className="settings_actions">
          <ButtonComponent variant="danger" onClick={handleCancel}>
            Cancel
          </ButtonComponent>
          <ButtonComponent variant="primary" onClick={handleSubmit}>
            Update Password
          </ButtonComponent>
        </div>
      </section>
    </div>
  );
};

export default Settings;
