// src/pages/Auth/Login.jsx
import { useEffect, useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import InputField from "../../components/InputField/InputField";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useNavigate } from "react-router-dom";
import { FORGOT_PASSWORD } from "../../utils/apiPath";
import { postApi } from "../../utils/apiService";
import { errorToast, successToast } from "../../services/ToastHelper";
import Loader from "../../components/Loader/Loader";

const initialValues = {
  email: "",
};

export default function Forgot() {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validateFields = () => {
    let errObj = { ...initialValues };

    if (!form.email) {
      errObj.email = "This field is required";
    } else if (/\s/.test(form.email)) {
      errObj.email = "Email should not contain spaces";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      errObj.email = "Please enter a valid email address";
    } else {
      errObj.email = "";
    }

    setErrors((prev) => ({ ...prev, ...errObj }));
    const data = Object.values(errObj).every((x) => x === "" || x === null);
    return data;
  };

  const handleSubmit = async () => {
    if (validateFields()) {
      setIsLoading(true);
      const payload = {
        email: form.email,
      };
      const { statusCode, data, message } = await postApi(
        FORGOT_PASSWORD,
        payload
      );
      if (statusCode === 200) {
        setIsLoading(false);
        successToast(
          "We've sent a reset password link to your registered email ID."
        );
        // navigate("/");
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
        <h1 className="title">Forgot Password?</h1>
        <p className="subtitle">
          No worries, we'll send your reset instructions to your email
        </p>
        <div className="form">
          <InputField
            title="Email"
            name="email"
            type="text"
            value={form.email}
            onChange={onChange}
            placeholder="Enter your email"
            required
            errorText={errors.email}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />

          <ButtonComponent
            type="submit"
            variant="primary"
            onClick={handleSubmit}
          >
            Next
          </ButtonComponent>
        </div>

        <div className="muted">
          Back to{" "}
          <a className="link" href="/">
            Sign in
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
