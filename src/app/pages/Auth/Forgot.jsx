// src/pages/Auth/Login.jsx
import { useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import EmailIcon from "../../assets/icons/InputIcons/EmailIcon";
import InputField from "../../components/InputField/InputField";
import AuthLayout from "../../components/AuthLayout/AuthLayout";

export default function Forgot() {
  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState({});

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      // TODO: call your API
      console.log("submit", form);
    }
  };

  return (
    <AuthLayout>
      <div className="login-card">
        <h1 className="title">Forgot Password?</h1>
        <p className="subtitle">No worries, we'll send your reset instructions to your email</p>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <InputField
            title="Email"
            name="email"
            type="text"
            value={form.email}
            onChange={onChange}
            placeholder="Enter your email"
            required
            errorText={errors.email}
          />

          <ButtonComponent type="submit" variant="primary">
            Next
          </ButtonComponent>
        </form>

        <div className="muted">
          Back to{" "}
          <a className="link" href="/signup">
            Sign in
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
