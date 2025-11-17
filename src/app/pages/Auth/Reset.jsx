// src/pages/Auth/Reset.jsx
import { useEffect, useMemo, useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import InputField from "../../components/InputField/InputField";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { RESET_PASSWORD } from "../../utils/apiPath";
import { postApi } from "../../utils/apiService";
import { errorToast, successToast } from "../../services/ToastHelper";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";

const initialValues = {
  password: "",
  confirmPassword: "",
};

export default function Reset() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = new URLSearchParams(location.search);

  // Extract email & token from URL
  const emailFromUrl = searchParams.get("email") || "";
  const tokenFromUrl = searchParams.get("token") || "";

  // Fallback: also check state/sessionStorage if needed
  const emailFromState = location?.state?.email || "";
  const cachedEmail =
    typeof window !== "undefined" ? sessionStorage.getItem("pendingEmail") : "";

  const email = useMemo(
    () => emailFromUrl || emailFromState || cachedEmail || "",
    [emailFromUrl, emailFromState, cachedEmail]
  );

  const [token] = useState(tokenFromUrl);
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!email || !token) {
      errorToast("Invalid or missing reset link. Please request a new one.");
      navigate("/");
    }
  }, [email, token, navigate]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validateFields = () => {
    let errObj = {};

    if (!form.password) {
      errObj.password = "This field is required";
    } else if (/\s/.test(form.password)) {
      errObj.password = "Password should not contain spaces";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(form.password)
    ) {
      errObj.password =
        "Password must be 8+ characters, with uppercase, lowercase, number, and special character.";
    }

    if (!form.confirmPassword) {
      errObj.confirmPassword = "This field is required";
    } else if (form.password !== form.confirmPassword) {
      errObj.confirmPassword = "Passwords do not match";
    }

    setErrors(errObj);
    return Object.keys(errObj).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (validateFields()) {
      setIsLoading(true);
      const payload = {
        email,
        token,
        password: form.password,
      };
      const { statusCode, message } = await postApi(RESET_PASSWORD, payload);
      setIsLoading(false);
      if (statusCode === 200) {
        successToast("Password reset successful! Please sign in.");
        setIsLoading(false);
        navigate("/");
      } else {
        setIsLoading(false);
        errorToast(message);
      }
    }
  };

  return (
    <AuthLayout>
      {isLoading && <Loader />}
      <div className="login-card">
        <h1 className="title">Set New Password</h1>
        <p className="subtitle">
          Enter your new password to access your account
        </p>

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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />

          <ButtonComponent
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
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
