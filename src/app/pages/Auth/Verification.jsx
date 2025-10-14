// src/pages/Auth/Login.jsx
import { useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import OTPField from "../../components/OTPField/OTPField";

export default function Verification() {
  const [form, setForm] = useState({ otp: "" });
  const [errors, setErrors] = useState({});

  const handleOTPChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (form.otp.length !== 4) next.otp = "Please enter the 4-digit code";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      console.log("Verify OTP:", form.otp);
    }
  };

  return (
    <AuthLayout>
      <div className="login-card">
        <h1 className="title">OTP Verification</h1>
        <p className="subtitle">
          Please enter the 4-digit code sent to your email
        </p>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <OTPField
            title=""
            name="otp"
            length={4}
            value={form.otp}
            onChange={handleOTPChange}
            required
            errorText={errors.otp}
            helperText=""
          />
          <ButtonComponent type="submit" variant="primary">
            Verify
          </ButtonComponent>
        </form>

        <div className="muted">
          Haven't received the code?{" "}
          <button
            className="link"
            type="button"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              color: "#0e82fd",
              cursor: "pointer",
            }}
            onClick={() => console.log("Resend OTP")}
          >
            Resend It
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
