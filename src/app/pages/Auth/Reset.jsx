// src/pages/Auth/Login.jsx
import { useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import InputField from "../../components/InputField/InputField";
import AuthLayout from "../../components/AuthLayout/AuthLayout";

export default function Reset() {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.password.trim()) next.password = "Password is required";
    if (!form.confirmPassword.trim())
      next.confirmPassword = "Confirm Password is required";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      // TODO: call your API
      console.log("submit", form);
    }
  };

  return (
    <AuthLayout>
      <div className="login-card">
        <h1 className="title">Set New Password</h1>
        <p className="subtitle">Enter new password to login your account</p>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <InputField
            title="New Password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Enter new password"
            required
            errorText={errors.password}
          />
          <InputField
            title="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={onChange}
            placeholder="Confirm new password"
            required
            errorText={errors.confirmPassword}
          />

          <ButtonComponent type="submit" variant="primary">
            Reset Password
          </ButtonComponent>
        </form>

        <div className="muted">
          Back to{" "}
          <a className="link" href="/">
            Sign In
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
