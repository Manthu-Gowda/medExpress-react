// src/pages/Auth/Login.jsx
import { useEffect, useMemo, useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import InputField from "../../components/InputField/InputField";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { RESET_PASSWORD } from "../../utils/apiPath";
import { postApi } from "../../utils/apiService";
import { errorToast, successToast } from "../../services/ToastHelper";
import { useLocation, useNavigate } from "react-router-dom";

const initialValues = {
  password: "",
  confirmPassword: "",
};

export default function Reset() {
    const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location?.state?.email || "";
  const cachedEmail =
    typeof window !== "undefined" ? sessionStorage.getItem("pendingEmail") : "";
  const email = useMemo(
    () => emailFromState || cachedEmail || "",
    [emailFromState, cachedEmail]
  );
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});

    useEffect(() => {
      if (!email) {
        errorToast("Missing email. Please register again.");
        navigate("/forgot"); // or back to signup
      }
    }, [email, navigate]);
  

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validateFields = () => {
    let errObj = { ...initialValues };

    if (!form.password) {
      errObj.password = "This field is required";
    } else if (/\s/.test(form.password)) {
      errObj.password = "Password should not contain spaces";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(form.password)
    ) {
      errObj.password =
        "Password must be 8+ characters, with uppercase, lowercase, number, and special character.";
    } else {
      errObj.password = "";
    }

    if (!form.confirmPassword) {
      errObj.confirmPassword = "This field is required";
    } else if (form.password !== form.confirmPassword) {
      errObj.confirmPassword = "Passwords do not match";
    } else {
      errObj.confirmPassword = "";
    }

    setErrors((prev) => ({ ...prev, ...errObj }));
    const data = Object.values(errObj).every((x) => x === "" || x === null);
    return data;
  };

  const handleSubmit = async () => {
    if (validateFields()) {
      setIsLoading(true);
      const payload = {
        email,
        token: "",
        password: form.password,
      };
      const { statusCode, data, message } = await postApi(
        RESET_PASSWORD,
        payload
      );
      if (statusCode === 200) {
        setIsLoading(false);
        successToast(message);
        navigate("/");
      } else {
        setIsLoading(false);
        errorToast(message);
      }
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
