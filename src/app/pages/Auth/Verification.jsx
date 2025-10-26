// src/pages/Auth/Login.jsx
import { useEffect, useMemo, useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import OTPField from "../../components/OTPField/OTPField";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import { RESEND_REGISTER_OTP, VERIFY_REGISTER_OTP } from "../../utils/apiPath";
import { postApi } from "../../utils/apiService";
import { errorToast, successToast } from "../../services/ToastHelper";

export default function Verification() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location?.state?.email || "";
  const cachedEmail =
    typeof window !== "undefined" ? sessionStorage.getItem("pendingEmail") : "";
  const email = useMemo(
    () => emailFromState || cachedEmail || "",
    [emailFromState, cachedEmail]
  );
  const [form, setForm] = useState({ otp: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      errorToast("Missing email. Please register again.");
      navigate("/signup"); // or back to signup
    }
  }, [email, navigate]);

  const handleOTPChange = (e) => {
    const { name, value } = e.target;
    // allow only digits, max 4
    const nextVal = value.replace(/\D/g, "").slice(0, 4);

    setForm((prev) => ({ ...prev, [name]: nextVal }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateOTP = () => {
    const next = {};
    if (!form.otp) next.otp = "This field is required";
    else if (!/^\d{4}$/.test(form.otp))
      next.otp = "Please enter the 4-digit code";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (validateOTP()) {
      setIsLoading(true);
      const payload = { email, otp: form.otp };
      const { statusCode, data, message } = await postApi(
        VERIFY_REGISTER_OTP,
        payload
      );
      if (statusCode === 200) {
        successToast(message || "OTP verified successfully!");
        localStorage.removeItem("pendingEmail");
        setIsLoading(false);
        navigate("/");
      } else {
        setIsLoading(false);
        errorToast(message || "Invalid OTP. Please try again.");
      }
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    const { statusCode, data, message } = await postApi(RESEND_REGISTER_OTP, {
      email,
    });
    if (statusCode === 200) {
      setIsResending(false);
      successToast(message || "OTP resent to your email.");
    } else {
      setIsResending(false);
      errorToast(data?.message || "Unable to resend OTP. Try again later.");
    }
  };

  return (
    <AuthLayout>
      {isLoading && <Loader />}
      <div className="login-card">
        <h1 className="title">OTP Verification</h1>
        <p className="subtitle">
          Please enter the 4-digit code sent to your email
        </p>
        <div className="form">
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
          <ButtonComponent
            type="submit"
            variant="primary"
            onClick={handleSubmit}
          >
            Verify
          </ButtonComponent>
        </div>

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
            onClick={handleResend}
          >
            Resend It
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
