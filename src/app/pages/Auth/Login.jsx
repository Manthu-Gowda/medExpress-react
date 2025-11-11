// src/pages/Auth/Login.jsx
import { useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import InputField from "../../components/InputField/InputField";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import { errorToast, successToast } from "../../services/ToastHelper";
import { GOOGLE_AUTH, GOOGLE_LOGIN, USER_LOGIN } from "../../utils/apiPath";
import { getApi, postApi } from "../../utils/apiService";
import { saveAuthToSession } from "../../services/auth";

const initialValues = {
  email: "",
  password: "",
};

export default function Login() {
  const [login, setLogin] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLogin({
      ...login,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateFields = () => {
    let errObj = { ...initialValues };

    if (!login.email) {
      errObj.email = "This field is required";
    } else if (/\s/.test(login.email)) {
      errObj.email = "Email should not contain spaces";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(login.email)) {
      errObj.email = "Please enter a valid email address";
    } else {
      errObj.email = "";
    }

    if (!login.password) {
      errObj.password = "This field is required";
    } else if (/\s/.test(login.password)) {
      errObj.password = "Password should not contain spaces";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(login.password)
    ) {
      errObj.password =
        "Password must be 8+ characters, with uppercase, lowercase, number, and special character.";
    } else {
      errObj.password = "";
    }

    setErrors((prev) => ({ ...prev, ...errObj }));
    const data = Object.values(errObj).every((x) => x === "" || x === null);
    return data;
  };

const handleSubmit = async () => {
  if (validateFields()) {
    setIsLoading(true);
    const payload = {
      email: login.email,
      password: login.password,
    };
    
    const { statusCode, data, message } = await postApi(USER_LOGIN, payload);
    
    if (statusCode === 200) {
      saveAuthToSession(data);
      setIsLoading(false);
      successToast("Successfully Logged In");

      // Extract role (either from data.roles or data.role)
      const role = Array.isArray(data.roles) ? data.roles[0] : data.role;

      // Navigate based on role
      if (role === "Admin") {
        navigate("/dashboard");
      } else if (role === "User") {
        navigate("/patients");
      } else {
        navigate("/"); // fallback route if needed
      }

    } else {
      setIsLoading(false);
      errorToast(message || "Invalid credentials. Please try again.");
    }
  }
};

  // STEP 1: Get Google login URL and redirect
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const res = await getApi(GOOGLE_LOGIN);
      const raw = res;
      const loginUrl =
        typeof raw === "string"
          ? raw
          : raw?.url || raw?.loginUrl || raw?.authorizationUrl;

      if (!loginUrl) {
        errorToast("Could not start Google Sign-In. Please try again.");
        return;
      }

      // 🚀 Direct full-page redirect (no popup)
      window.location.href = loginUrl;
    } catch (err) {
      errorToast("Failed to start Google Sign-In");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {isLoading && <Loader />}
      <div className="login-card">
        <h1 className="title">Welcome Back!</h1>
        <p className="subtitle">Please enter your details to continue</p>
        <div className="form">
          <InputField
            title="Email"
            name="email"
            value={login.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            errorText={errors.email}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />

          <InputField
            title="Password"
            name="password"
            type="password"
            value={login.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            errorText={errors.password}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />

          <div className="row between">
            <span />
            <a className="link" href="/forgot">
              Forgot Password ?
            </a>
          </div>

          <ButtonComponent
            type="submit"
            variant="primary"
            onClick={handleSubmit}
          >
            Sign In
          </ButtonComponent>
        </div>

        <div className="muted">
          Don’t have an Account?{" "}
          <a className="link" href="/signup">
            Sign Up
          </a>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <ButtonComponent
          variant="transparent"
          style={{ width: "100%" }}
          onClick={handleGoogleLogin}
        >
          <img
            alt="Google"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="g-icon"
          />
          Sign In with Google
        </ButtonComponent>
      </div>
    </AuthLayout>
  );
}
